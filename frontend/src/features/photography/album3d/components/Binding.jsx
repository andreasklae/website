import { useEffect, useMemo } from 'react'
import { BoxGeometry, Color, MeshStandardMaterial } from 'three'
import { bindingPose } from '../lib/blockLayout'
import { shade } from '../lib/material'
import { BOARD_SHADE } from '../lib/faceCanvas'

const geometry = new BoxGeometry(1, 1, 1)
const DEFAULT_CLOTH = '#332e27'

/** The binding is the same material as the boards, so it takes the same shade. */
const boardColour = (cloth) => shade(cloth || DEFAULT_CLOTH, BOARD_SHADE)

/**
 * The binding: the album's spine, and the thing that fills the gutter.
 *
 * Leaves hinge on one line and fan out either side of it. Nothing occupies
 * that line, so an open album is two slabs joined by daylight — the gap down
 * the middle. This strip sits in it, runs back through the whole block, and
 * doubles as the spine when the album is shut: the same edge, and the same
 * label, that the shelved block shows.
 *
 * Authored in album-local space, where the leaves stack along x and the hinge
 * lies on z = 0. That is not where reasoning about it in world terms lands
 * you — the placement below is the one geometry.test.mjs verifies.
 */
export default function Binding({ depth, pageDepth, cloth, spineTexture }) {
  const { position, scale } = bindingPose(depth, pageDepth)

  const materials = useMemo(() => {
    const make = () => new MeshStandardMaterial({ color: new Color(boardColour(cloth)), roughness: 0.88 })
    // [+X, -X, +Y, -Y, +Z bound edge, -Z]
    return [make(), make(), make(), make(), make(), make()]
  }, [cloth])

  useEffect(() => {
    materials[4].map = spineTexture || null
    materials[4].color.set(spineTexture ? '#ffffff' : boardColour(cloth))
    materials[4].needsUpdate = true
  }, [materials, spineTexture, cloth])

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])

  return (
    <mesh
      geometry={geometry}
      material={materials}
      position={position}
      scale={scale}
    />
  )
}
