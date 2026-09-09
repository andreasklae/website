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

/**
 * How far forward the chosen album is drawn. Far enough that it clears the
 * deepest album's boards, so a book pulled out never touches the row it came
 * from — the row does not have to make space for it.
 */
export const FORWARD_Z = PAGE_WIDTH * 0.62

/**
 * Fraction of the way out before the album starts to turn. A book is drawn
 * clear of its neighbours first and turned in front of them, rather than
 * pivoting between them and shouldering them aside.
 */
const TURN_BEGINS_AT = 0.4

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
 * Paints a board on mount, so an album's cover is already there the moment it
 * turns rather than appearing once something touches it. The same call makes
 * the back board, which is otherwise bare paper on a shelved album.
 */
function useBoardTexture(album, language, kind) {
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
    const face = kind === 'back-cover'
      ? { role: 'back-cover', slots: [{ kind: 'back-cover', title: album.title }] }
      : {
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
      if (kind !== 'back-cover' && album.cover) imageCache.load(album.cover, 'page').then(paint)
    })

    setTexture(tex)
    return () => { cancelled = true; tex.dispose(); canvas.width = canvas.height = 1 }
  }, [album, language, kind])

  return texture
}

/**
 * One album on the shelf — the real, bound thing, whether or not it has been
 * chosen. Choosing it turns it and starts painting its faces; it never swaps
 * for a different object, because there is no other object.
 */
export default function AlbumBook({ album, full, index, language, active }) {
  const group = useRef()
  const mode = useAlbumStore((s) => s.mode)
  const hoveredAlbum = useAlbumStore((s) => s.hoveredAlbum)
  const setHoveredAlbum = useAlbumStore((s) => s.setHoveredAlbum)
  const selectAlbum = useAlbumStore((s) => s.selectAlbum)

  const coverTexture = useBoardTexture(album, language, 'cover')
  const backCoverTexture = useBoardTexture(album, language, 'back-cover')
  const spineTexture = useSpineTexture(album, language, index)

  const reading = active && (mode === MODES.OPEN || mode === MODES.ZOOM)
  const hovered = hoveredAlbum === album.id && !active && mode !== MODES.OPEN && mode !== MODES.ZOOM

  // One eased number drives both the pull and the turn, so putting the album
  // back is the exact reverse of taking it out — two separately damped
  // channels drift apart and the reverse never quite matches.
  const extension = useRef({ value: 0 }).current

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    easing.damp(extension, 'value', active ? 1 : 0, TURN_SMOOTHING, delta)
    const out = extension.value
    const turn = Math.min(1, Math.max(0, (out - TURN_BEGINS_AT) / (1 - TURN_BEGINS_AT)))

    g.rotation.y = SHELF_ROTATION + (READING_ROTATION - SHELF_ROTATION) * turn
    g.position.set(
      0,
      hovered ? 0.055 : 0,
      SPINE_SEAT + out * FORWARD_Z + (hovered ? 0.07 : 0)
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
        backCoverTexture={backCoverTexture}
        spineTexture={spineTexture}
      />
    </group>
  )
}
