import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo, useRef } from 'react'
import {
  Bone, BoxGeometry, Color, Float32BufferAttribute, MeshStandardMaterial,
  Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3,
} from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'

// Page geometry and the bone-driven curl are adapted from
// github.com/wass08/r3f-animated-book-slider-final — a chain of bones along the
// page's width, with the skin weight of each vertex blended between the two
// bones it sits between. Curl is then just per-bone Y rotation.

export const PAGE_WIDTH = 1.28
export const PAGE_HEIGHT = 1.71
export const PAGE_DEPTH = 0.003
const PAGE_SEGMENTS = 26
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS

const easingFactor = 0.5
const easingFactorFold = 0.3
const insideCurveStrength = 0.18
const outsideCurveStrength = 0.05
const turningCurveStrength = 0.09

/** One geometry, shared by every page in every album. */
const pageGeometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2)
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0) // hinge at x=0

{
  const position = pageGeometry.attributes.position
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
  pageGeometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndexes, 4))
  pageGeometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4))
}

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
  number, opened, bookClosed, sheetCount, frontTexture, backTexture, onPointerMove, onClick, onPointerOut,
}) {
  const group = useRef()
  const skinnedMeshRef = useRef()
  const turnedAt = useRef(0)
  const lastOpened = useRef(opened)

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
    // a single directional light, which is far cheaper than a shadow map.
    const faceMaterial = () => new MeshStandardMaterial({ color: PAPER, roughness: 0.88, metalness: 0 })
    const materials = [...edgeMaterials, faceMaterial(), faceMaterial()]

    const skinned = new SkinnedMesh(pageGeometry, materials)
    skinned.frustumCulled = false
    skinned.castShadow = false
    skinned.receiveShadow = false
    skinned.add(skeleton.bones[0])
    skinned.bind(skeleton)
    return skinned
  }, [])

  // Swap textures without rebuilding the mesh, so page turns never hitch.
  useEffect(() => {
    const [front, back] = [mesh.material[4], mesh.material[5]]
    front.map = frontTexture || null
    back.map = backTexture || null
    front.color.set(frontTexture ? '#ffffff' : PAPER)
    back.color.set(backTexture ? '#ffffff' : PAPER)
    front.needsUpdate = back.needsUpdate = true
  }, [mesh, frontTexture, backTexture])

  useEffect(() => () => { mesh.material[4].dispose(); mesh.material[5].dispose() }, [mesh])

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return

    if (lastOpened.current !== opened) {
      turnedAt.current = performance.now()
      lastOpened.current = opened
    }
    // A half-sine over 400ms: the page bows out mid-turn and flattens again.
    let turningTime = Math.min(400, performance.now() - turnedAt.current) / 400
    turningTime = Math.sin(turningTime * Math.PI)

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2
    if (!bookClosed) targetRotation += degToRad(number * 0.8) // fan the block

    const bones = skinnedMeshRef.current.skeleton.bones
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i]
      if (!target) continue

      const insideCurve = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0
      const outsideCurve = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0
      const turning = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime

      let rotationAngle =
        insideCurveStrength * insideCurve * targetRotation -
        outsideCurveStrength * outsideCurve * targetRotation +
        turningCurveStrength * turning * targetRotation
      let foldAngle = degToRad(Math.sign(targetRotation) * 2)

      if (bookClosed) {
        rotationAngle = i === 0 ? targetRotation : 0
        foldAngle = 0
      }

      easing.dampAngle(target.rotation, 'y', rotationAngle, easingFactor, delta)

      const foldIntensity = i > 8 ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime : 0
      easing.dampAngle(target.rotation, 'x', foldAngle * foldIntensity, easingFactorFold, delta)
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
        position-z={-number * PAGE_DEPTH + (opened ? 1 : 0) * PAGE_DEPTH}
      />
    </group>
  )
}
