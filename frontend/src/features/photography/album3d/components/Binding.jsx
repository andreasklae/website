import { useEffect, useMemo } from 'react'
import { BoxGeometry, Color, MeshStandardMaterial } from 'three'
import { PAGE_DEPTH, PAGE_HEIGHT } from './Page'

const geometry = new BoxGeometry(1, 1, 1)
const CLOTH = new Color('#332e27')

/** Thickness of a board, matching the shelved block's own reckoning. */
export const COVER_BOARD = 0.022

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
export default function Binding({ sheetCount, spineTexture }) {
  const depth = sheetCount * PAGE_DEPTH + COVER_BOARD * 2

  const materials = useMemo(() => {
    const cloth = () => new MeshStandardMaterial({ color: CLOTH, roughness: 0.9 })
    // [+X, -X, +Y, -Y, +Z bound edge, -Z]
    return [cloth(), cloth(), cloth(), cloth(), cloth(), cloth()]
  }, [])

  useEffect(() => {
    materials[4].map = spineTexture || null
    materials[4].color.set(spineTexture ? '#ffffff' : CLOTH)
    materials[4].needsUpdate = true
  }, [materials, spineTexture])

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])

  return (
    <mesh
      geometry={geometry}
      material={materials}
      // Runs the depth of the block along local x, and straddles the hinge on
      // local z — sitting a little proud on the bound side so it reads as a
      // spine when the album is shut.
      position={[-depth / 2, 0, 0.004]}
      // Never taller than the leaves: standing proud shows as a raised strip
      // down the crease, and along the spine edge of a shut cover.
      scale={[depth, PAGE_HEIGHT, 0.024]}
    />
  )
}
