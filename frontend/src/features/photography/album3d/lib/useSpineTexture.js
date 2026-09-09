import { useEffect, useMemo } from 'react'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { paintSpine } from './spineCanvas'
import { ensureFonts } from './fonts'

/**
 * The spine label, shared by the shelved block and the bound album, so the two
 * are indistinguishable at the moment one takes over from the other.
 */
export function useSpineTexture(album, language, index = 0) {
  const spine = useMemo(() => {
    const canvas = document.createElement('canvas')
    paintSpine(canvas, album, { language, index })
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = texture.magFilter = LinearFilter
    texture.generateMipmaps = false
    texture.anisotropy = 4
    return { canvas, texture }
  }, [album, index])

  // Webfonts land after the first paint; redo it once they have.
  useEffect(() => {
    let cancelled = false
    ensureFonts().then(() => {
      if (cancelled) return
      paintSpine(spine.canvas, album, { language, index })
      spine.texture.needsUpdate = true
    })
    return () => { cancelled = true }
  }, [spine, album, language, index])

  useEffect(() => () => {
    spine.texture.dispose()
    spine.canvas.width = spine.canvas.height = 1
  }, [spine])

  return spine.texture
}
