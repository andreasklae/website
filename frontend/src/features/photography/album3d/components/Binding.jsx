import { useEffect, useMemo } from 'react'
import { BoxGeometry, Color, MeshStandardMaterial } from 'three'
import { bindingPose } from '../lib/blockLayout'
import { useClothTexture } from '../lib/useClothTexture'

const geometry = new BoxGeometry(1, 1, 1)
const DEFAULT_CLOTH = '#332e27'

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
export default function Binding({ depth, pageDepth, cloth, spineTexture, albumId }) {
  const { position, scale } = bindingPose(depth, pageDepth)
  const clothTexture = useClothTexture(cloth || DEFAULT_CLOTH, `${albumId}-binding`)

  const materials = useMemo(() => {
    const make = () => new MeshStandardMaterial({ color: new Color('#ffffff'), roughness: 0.88 })
    // [+X, -X, +Y, -Y, +Z bound edge, -Z]
    return [make(), make(), make(), make(), make(), make()]
  }, [])

  useEffect(() => {
    materials.forEach((m, i) => {
      m.map = i === 4 ? spineTexture || clothTexture : clothTexture
      m.needsUpdate = true
    })
  }, [materials, spineTexture, clothTexture])

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
