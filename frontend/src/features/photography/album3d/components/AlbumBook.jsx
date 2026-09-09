import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BoxGeometry, CanvasTexture, Color, LinearFilter, MeshStandardMaterial, SRGBColorSpace,
} from 'three'
import { paintSpine } from '../lib/spineCanvas'
import { paintFace } from '../lib/faceCanvas'
import { ensureFonts } from '../lib/fonts'
import { imageCache } from '../lib/textures'
import { MODES, useAlbumStore } from '../lib/store'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'

// The closed album is ONE object. Its spine and its front board are two faces
// of the same box, so choosing it turns that box a quarter turn rather than
// hiding a spine and revealing a different model in its place.
//
// Shelved, the spine (+Z) faces the viewer. A -90 degree turn brings the front
// board (+X) round to face them — the same rotation the pages are authored in,
// so opening the album continues from exactly where this leaves off.
export const SHELF_ROTATION = 0
export const READING_ROTATION = -Math.PI / 2

/** Both the closed book and the open one sit here, so opening never jumps. */
export const FORWARD_Z = PAGE_WIDTH * 0.3

const boxGeometry = new BoxGeometry(1, 1, 1)
const BOARD = new Color('#3a342c')
const PAGES_EDGE = new Color('#e6dfd0')

// Covers are painted at a fraction of page resolution. They are never read
// like a page, and five full-size boards would cost ~28MB of texture for
// something mostly seen edge-on.
const COVER_SCALE = 0.62

/**
 * Paints the front board immediately, so an album's cover is already there the
 * moment it turns rather than appearing once the pointer happens to touch it.
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
    // board and the first page are the same image when one becomes the other.
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

export default function AlbumBook({ album, index, language, offsetX, active }) {
  const mesh = useRef()
  const mode = useAlbumStore((s) => s.mode)
  const hoveredAlbum = useAlbumStore((s) => s.hoveredAlbum)
  const setHoveredAlbum = useAlbumStore((s) => s.setHoveredAlbum)
  const selectAlbum = useAlbumStore((s) => s.selectAlbum)

  const coverTexture = useCoverTexture(album, language)

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

  useEffect(() => {
    let cancelled = false
    ensureFonts().then(() => {
      if (cancelled) return
      paintSpine(spine.canvas, album, { language, index })
      spine.texture.needsUpdate = true
    })
    return () => { cancelled = true }
  }, [spine, album, language, index])

  useEffect(() => () => spine.texture.dispose(), [spine])

  // [+X front board, -X back board, +Y head, -Y tail, +Z spine, -Z fore-edge]
  const materials = useMemo(() => [
    new MeshStandardMaterial({ color: BOARD, roughness: 0.9 }),
    new MeshStandardMaterial({ color: BOARD, roughness: 0.9 }),
    new MeshStandardMaterial({ color: PAGES_EDGE, roughness: 0.98 }),
    new MeshStandardMaterial({ color: PAGES_EDGE, roughness: 0.98 }),
    new MeshStandardMaterial({ map: spine.texture, roughness: 0.85 }),
    new MeshStandardMaterial({ color: PAGES_EDGE, roughness: 0.98 }),
  ], [spine])

  useEffect(() => {
    materials[0].map = coverTexture || null
    materials[0].color.set(coverTexture ? '#ffffff' : BOARD)
    materials[0].needsUpdate = true
  }, [materials, coverTexture])

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])

  const hovered = hoveredAlbum === album.id && !active && (mode === MODES.SHELF || mode === MODES.COVER)

  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return
    easing.dampAngle(m.rotation, 'y', active ? READING_ROTATION : SHELF_ROTATION, 0.42, delta)
    easing.damp3(
      m.position,
      [offsetX, hovered ? 0.055 : 0, active ? FORWARD_Z : hovered ? 0.07 : 0],
      active ? 0.42 : 0.24,
      delta
    )
  })

  // Once the album is open, its pages are the album; the block steps aside.
  if (active && (mode === MODES.OPEN || mode === MODES.ZOOM)) return null

  return (
    <mesh
      ref={mesh}
      geometry={boxGeometry}
      material={materials}
      scale={[album.thickness, PAGE_HEIGHT * 1.05, PAGE_WIDTH * 1.02]}
      onPointerOver={(e) => {
        if (mode === MODES.OPEN || mode === MODES.ZOOM) return
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
    />
  )
}
