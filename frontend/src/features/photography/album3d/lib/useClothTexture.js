import { useEffect, useMemo } from 'react'
import { CanvasTexture, LinearFilter, RepeatWrapping, SRGBColorSpace } from 'three'
import { paintCloth, seedFrom, shade } from './material'
import { BOARD_SHADE } from './faceCanvas'

/**
 * A swatch of the album's binding cloth.
 *
 * The binding used a flat colour while the boards were painted cloth, and the
 * weave lightens the cloth by about a tenth — so the two matched on the shelf,
 * where only the textured spine shows, and parted company the moment the album
 * turned and put a board next to it. Same material on every face now.
 */
export function useClothTexture(cloth, seed) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 192
    canvas.height = 512
    paintCloth(canvas.getContext('2d'), canvas.width, canvas.height, shade(cloth, BOARD_SHADE), seedFrom(seed))
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.minFilter = tex.magFilter = LinearFilter
    tex.generateMipmaps = false
    tex.wrapS = tex.wrapT = RepeatWrapping
    return tex
  }, [cloth, seed])

  useEffect(() => () => texture.dispose(), [texture])

  return texture
}
