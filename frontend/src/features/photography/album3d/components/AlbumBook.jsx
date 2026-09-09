import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import Album from './Album'
import { PAGE_WIDTH } from './Page'
import { paintFace } from '../lib/faceCanvas'
import { ensureFonts } from '../lib/fonts'
import { imageCache } from '../lib/textures'
import { useSpineTexture } from '../lib/useSpineTexture'
import { MODES, useAlbumStore } from '../lib/store'
import { easing } from 'maath'

// Shelved, an album's spine faces the viewer. A quarter turn brings its front
// board round — the same frame the leaves are authored in, so opening simply
// continues from where the turn leaves off.
export const SHELF_ROTATION = 0
export const READING_ROTATION = -Math.PI / 2

/** Where the chosen album stands, clear of the row. */
export const FORWARD_Z = PAGE_WIDTH * 0.3

/** Shared by the turn out and the turn back, so one is the reverse of the other. */
export const TURN_SMOOTHING = 0.42

/**
 * The bound album hinges on its spine and its body runs backwards from there,
 * so it is seated on that edge rather than straddling its own origin.
 */
const SPINE_SEAT = -PAGE_WIDTH / 2

// Covers are painted at a fraction of page resolution. They are never read
// like a page, and five full-size boards would cost ~28MB of texture.
const COVER_SCALE = 0.62

/**
 * Paints the front board on mount, so an album's cover is already there the
 * moment it turns rather than appearing once something touches it.
 */
function useCoverTexture(album, language) {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    let cancelled = false
    const canvas = document.createElement('canvas')
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.minFilter = tex.magFilter = LinearFilter
    tex.generateMipmaps = false
    tex.anisotropy = 4

    // The same face description the album's own page 0 is built from, so the
    // board and the first leaf are the same image.
    const face = {
      role: 'cover',
      slots: [{
        kind: 'cover',
        title: album.title,
        subtitle: album.camera,
        dates: album.dates,
        photo: album.cover,
      }],
    }

    const paint = () => {
      if (cancelled) return
      paintFace(canvas, face, { language, images: imageCache.map, scale: COVER_SCALE })
      tex.needsUpdate = true
    }

    ensureFonts().then(() => {
      paint()
      if (album.cover) imageCache.load(album.cover, 'page').then(paint)
    })

    setTexture(tex)
    return () => { cancelled = true; tex.dispose(); canvas.width = canvas.height = 1 }
  }, [album, language])

  return texture
}

/**
 * One album on the shelf — the real, bound thing, whether or not it has been
 * chosen. Choosing it turns it and starts painting its faces; it never swaps
 * for a different object, because there is no other object.
 */
export default function AlbumBook({ album, full, index, language, offsetX, active }) {
  const group = useRef()
  const mode = useAlbumStore((s) => s.mode)
  const hoveredAlbum = useAlbumStore((s) => s.hoveredAlbum)
  const setHoveredAlbum = useAlbumStore((s) => s.setHoveredAlbum)
  const selectAlbum = useAlbumStore((s) => s.selectAlbum)

  const coverTexture = useCoverTexture(album, language)
  const spineTexture = useSpineTexture(album, language, index)

  const reading = active && (mode === MODES.OPEN || mode === MODES.ZOOM)
  const hovered = hoveredAlbum === album.id && !active && mode !== MODES.OPEN && mode !== MODES.ZOOM

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    // The same smoothing whichever way it is going, so turning back is the
    // exact reverse of turning out.
    easing.dampAngle(g.rotation, 'y', active ? READING_ROTATION : SHELF_ROTATION, TURN_SMOOTHING, delta)
    easing.damp3(
      g.position,
      [
        offsetX,
        hovered ? 0.055 : 0,
        SPINE_SEAT + (active ? FORWARD_Z : hovered ? 0.07 : 0),
      ],
      TURN_SMOOTHING,
      delta
    )
  })

  return (
    <group
      ref={group}
      position={[0, 0, SPINE_SEAT]}
      onPointerOver={(e) => {
        if (reading || mode === MODES.OPEN || mode === MODES.ZOOM) return
        e.stopPropagation()
        setHoveredAlbum(album.id)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHoveredAlbum(null)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        if (mode === MODES.OPEN || mode === MODES.ZOOM) return
        e.stopPropagation()
        document.body.style.cursor = ''
        if (active) useAlbumStore.getState().open()
        else selectAlbum(album.id)
      }}
    >
      <Album
        full={active ? full : null}
        sheetCount={album.sheetCount}
        active={active}
        language={language}
        coverTexture={coverTexture}
        spineTexture={spineTexture}
      />
    </group>
  )
}
