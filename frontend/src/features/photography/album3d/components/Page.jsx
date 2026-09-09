import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo, useRef } from 'react'
import {
  Bone, BoxGeometry, Color, Float32BufferAttribute, MeshStandardMaterial,
  Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3,
} from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import { LEAF_FRACTION } from '../lib/albumDepth'
import { lampLevel } from '../lib/lampLevel'

// Page geometry and the bone-driven curl are adapted from
// github.com/wass08/r3f-animated-book-slider-final — a chain of bones along the
// page's width, with the skin weight of each vertex blended between the two
// bones it sits between. Curl is then just per-bone Y rotation.

export const PAGE_WIDTH = 1.28
export const PAGE_HEIGHT = 1.71
// Album leaves are card, not paper. This is also what makes the closed book
// and the open one the same object: the shelved block's thickness is derived
// from it, so opening does not swap a fat slab for a thin one.
export const PAGE_DEPTH = 0.012
const PAGE_SEGMENTS = 26
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS

// Larger is slower. A leaf sweeps 180 degrees, so it wants a good deal more
// time than a small move would.
const easingFactor = 0.78
const easingFactorFold = 0.4

// How much a leaf bows as it turns. The reference is tuned for a paperback;
// album leaves are card and barely flex, so these are a fraction of it.
const insideCurveStrength = 0.06
const outsideCurveStrength = 0.018
const turningCurveStrength = 0.035

/** One geometry, shared by every page in every album. */
// A leaf is deliberately thinner than the spacing between leaves. At the full
// spacing two settled leaves are exactly touching, and the pair nearest the
// spine — where they converge — interpenetrate, so a leaf appears to sink into
// the one it just landed on at the end of its turn.
const geometries = new Map()

/**
 * The leaf mesh for a given thickness.
 *
 * Albums use different leaf spacing so they can all be about as thick as one
 * another, so this is cached per thickness rather than being one shared
 * geometry. There are only ever a handful. Scaling a single geometry instead
 * would shear the skinning, since the bones are children of the mesh.
 */
function getPageGeometry(thickness) {
  const key = thickness.toFixed(5)
  if (geometries.has(key)) return geometries.get(key)

  const geometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, thickness, PAGE_SEGMENTS, 2)
  geometry.translate(PAGE_WIDTH / 2, 0, 0) // hinge at x=0

  const position = geometry.attributes.position
  const vertex = new Vector3()
  const skinIndexes = []
  const skinWeights = []
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    const skinIndex = Math.max(0, Math.floor(vertex.x / SEGMENT_WIDTH))
    const skinWeight = (vertex.x % SEGMENT_WIDTH) / SEGMENT_WIDTH
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0)
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
  }
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndexes, 4))
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4))

  geometries.set(key, geometry)
  return geometry
}

/**
 * How bright a page reads when the lamp is at full.
 *
 * A printed page is shown through EMISSION rather than lit like a surface, and
 * skips tone mapping, so at full lamp a photograph is exactly the image file:
 * the room contributes nothing to it. It is still scaled by the lamp, so the
 * album goes dark when the room does — a page that stayed at reading
 * brightness in an unlit room looked like a screen, not paper.
 */
const PAGE_EXPOSURE = 1

const PAPER = new Color('#efeae0')
const EDGE = new Color('#d9d2c4')

/** Edge materials are shared — only the two face materials are per-page. */
const edgeMaterials = [
  new MeshStandardMaterial({ color: EDGE, roughness: 0.95 }),
  new MeshStandardMaterial({ color: EDGE, roughness: 0.95 }),
  new MeshStandardMaterial({ color: EDGE, roughness: 0.95 }),
  new MeshStandardMaterial({ color: EDGE, roughness: 0.95 }),
]

export default function Page({
  number, page, opened, bookClosed, sheetCount, rigid, pageDepth = PAGE_DEPTH,
  edgeColour, frontSelfLit = true, backSelfLit = true, frontTexture, backTexture,
  onPointerMove, onClick, onPointerOut,
}) {
  const group = useRef()
  const skinnedMeshRef = useRef()
  // Leaves are born flat. Without this they all swing into position on the
  // first frames, so the shelf visibly unfolds itself when the page loads.
  const seated = useRef(false)

  const mesh = useMemo(() => {
    const bones = []
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone()
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH
      bones.push(bone)
      if (i > 0) bones[i - 1].add(bone)
    }
    const skeleton = new Skeleton(bones)

    // Matte paper: no clearcoat, no shadows. The curl reads from geometry and
    // the room's lamp, which is far cheaper than a shadow map.
    //
    // A page is also part self-lit. Under a warm lamp a fully-lit photograph
    // takes the lamp's colour, and a photograph that has gone orange is no
    // longer the photograph — so most of a page's brightness comes from its
    // own image and only the rest from the room.
    const faceMaterial = () => new MeshStandardMaterial({
      color: PAPER,
      roughness: 0.88,
      metalness: 0,
      emissive: new Color('#ffffff'),
      emissiveIntensity: 0,
    })

    const edges = edgeColour
      ? Array.from({ length: 4 }, () => new MeshStandardMaterial({ color: new Color(edgeColour), roughness: 0.9 }))
      : edgeMaterials
    const materials = [...edges, faceMaterial(), faceMaterial()]

    const skinned = new SkinnedMesh(getPageGeometry(pageDepth * LEAF_FRACTION), materials)
    skinned.frustumCulled = false
    skinned.castShadow = false
    skinned.receiveShadow = false
    skinned.add(skeleton.bones[0])
    skinned.bind(skeleton)
    return skinned
  }, [pageDepth, edgeColour])

  // Swap textures without rebuilding the mesh, so page turns never hitch.
  useEffect(() => {
    // Decided per FACE, not per leaf: the outermost leaves are a cloth board
    // on one side and a printed page on the other, and treating the whole leaf
    // as a board left the first and last pages of every album lit like cloth —
    // the only two pages that went warm under the lamp.
    const pair = [
      [mesh.material[4], frontTexture, frontSelfLit],
      [mesh.material[5], backTexture, backSelfLit],
    ]
    for (const [material, texture, selfLit] of pair) {
      // A printed page is shown by its own emission: nothing of the lamp's
      // colour lands on it, and tone mapping is skipped, so a photograph is
      // the colour it was taken at. A cloth BOARD is a surface in the room
      // like any other and is lit like one — a cover that ignored the lamp
      // looked pasted on rather than sitting on a shelf.
      const emits = selfLit && Boolean(texture)
      material.map = texture || null
      material.color.set(emits ? '#000000' : texture ? '#ffffff' : PAPER)
      material.emissiveMap = emits ? texture : null
      material.emissiveIntensity = 0
      material.toneMapped = !emits
      material.needsUpdate = true
    }
  }, [mesh, frontTexture, backTexture, frontSelfLit, backSelfLit])

  useEffect(() => () => { mesh.material[4].dispose(); mesh.material[5].dispose() }, [mesh])

  // Pages brighten and dim with the room's lamp, read per frame so the warm-up
  // carries them with it.
  useFrame(() => {
    const level = lampLevel.value * PAGE_EXPOSURE
    for (const i of [4, 5]) {
      const material = mesh.material[i]
      if (material.emissiveMap) material.emissiveIntensity = level
    }
  })

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current || !group.current) return

    // Fan the block slightly, bounded however many sheets there are. A fixed
    // angle per sheet tilts the outer leaves of a 26-sheet album ~20 degrees
    // and swings them across the spread.
    //
    // The SIGN matters more than the amount. A leaf turns between +90 and -90
    // degrees, and dampAngle takes the shortest way round — at exactly 180
    // apart there is no shortest way, so leaves pick a side arbitrarily and
    // some sweep behind the book instead of over the front of it. Fanning the
    // two rest poses TOWARD each other keeps them under 180 apart, which puts
    // the short way through 0: the leaf stands up toward the reader mid-turn.
    const fan = degToRad(1.5 + Math.min(number, 20) * 0.3)
    const base = opened ? -Math.PI / 2 : Math.PI / 2
    const targetRotation = bookClosed ? base : base + (opened ? fan : -fan)

    if (!seated.current) {
      group.current.rotation.y = targetRotation
      seated.current = true
    } else {
      easing.dampAngle(group.current.rotation, 'y', targetRotation, easingFactor, delta)
    }

    // How far the leaf still has to go, which is what the curl is scaled by.
    //
    // Driving it from a timer instead — as the reference does — decouples the
    // bend from the leaf's actual position: the bend is still relaxing, one
    // easing behind, as the leaf arrives, and because the bend rotates the far
    // end PAST the leaf's own angle it dips through the leaves it is landing
    // on before settling back out. Tied to the remaining angle it is zero at
    // the exact moment the leaf is flat.
    let remaining = (targetRotation - group.current.rotation.y) % (Math.PI * 2)
    if (remaining > Math.PI) remaining -= Math.PI * 2
    if (remaining < -Math.PI) remaining += Math.PI * 2
    const turning = Math.sin(Math.abs(remaining))

    const bones = skinnedMeshRef.current.skeleton.bones
    for (let i = 1; i < bones.length; i++) {
      const insideCurve = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0
      const outsideCurve = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0
      const alongLeaf = Math.sin(i * Math.PI * (1 / bones.length))

      // The bend TRAILS the turn: paper lags behind the hand moving it. Scaling
      // it by targetRotation instead, as the reference does, points the bend
      // the way the leaf is already going, so the far end runs ahead of the
      // leaf's own angle — past where it is going to settle — and then comes
      // back as the bend unwinds. One direction only, never overshooting.
      const trailing = -Math.sign(remaining)
      // Boards are stiff. A cover that flexes open like a sheet of paper is
      // the single thing that stops a book reading as a book.
      const curl = bookClosed || rigid
        ? 0
        : (insideCurveStrength * insideCurve -
            outsideCurveStrength * outsideCurve +
            turningCurveStrength * alongLeaf) *
          (Math.PI / 2) *
          trailing *
          turning

      easing.dampAngle(bones[i].rotation, 'y', curl, easingFactorFold, delta)

      const foldIntensity = i > 8 ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turning : 0
      const fold = bookClosed || rigid ? 0 : degToRad(trailing * 2) * foldIntensity
      easing.dampAngle(bones[i].rotation, 'x', fold, easingFactorFold, delta)
    }
  })

  return (
    <group
      ref={group}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      <primitive
        object={mesh}
        ref={skinnedMeshRef}
        // The WHOLE block shifts with the current sheet, so both halves of an
        // open spread sit level. Offsetting opened and unopened leaves
        // separately instead — which is what this used to do — steps the two
        // pages apart at the crease by the depth of everything turned so far.
        position-z={(page - number) * pageDepth}
      />
    </group>
  )
}
