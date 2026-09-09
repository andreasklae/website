import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry, CanvasTexture, Color, LinearFilter, MeshStandardMaterial, SRGBColorSpace,
} from 'three'
import { paintSpine } from '../lib/spineCanvas'
import { ensureFonts } from '../lib/fonts'
import { MODES, useAlbumStore } from '../lib/store'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'

export const SHELF_GAP = 0.055
export const albumThickness = (sheetCount) => 0.11 + Math.min(sheetCount, 50) * 0.007

const spineGeometry = new BoxGeometry(1, 1, 1)
const BOARD = new Color('#3a342c')
const PAGES_EDGE = new Color('#e6dfd0')

/**
 * Positions every album along the shelf and returns each one's centre, so the
 * shelf and the pulled-out album agree on where a book lives.
 */
export function useShelfLayout(shelf) {
  return useMemo(() => {
    const items = shelf.map((a) => ({ ...a, thickness: albumThickness(a.sheetCount) }))
    const total = items.reduce((n, a) => n + a.thickness, 0) + SHELF_GAP * Math.max(0, items.length - 1)
    let x = -total / 2
    return items.map((a) => {
      const centre = x + a.thickness / 2
      x += a.thickness + SHELF_GAP
      return { ...a, x: centre }
    })
  }, [shelf])
}

/** One shelved album, seen spine-on. */
function Spine({ album, index, language, hidden, offsetX }) {
  const mesh = useRef()
  const hoveredAlbum = useAlbumStore((s) => s.hoveredAlbum)
  const setHoveredAlbum = useAlbumStore((s) => s.setHoveredAlbum)
  const selectAlbum = useAlbumStore((s) => s.selectAlbum)
  const mode = useAlbumStore((s) => s.mode)

  const materials = useMemo(() => {
    const canvas = document.createElement('canvas')
    paintSpine(canvas, album, { language, index })
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = texture.magFilter = LinearFilter
    texture.generateMipmaps = false
    texture.anisotropy = 4

    const board = () => new MeshStandardMaterial({ color: BOARD, roughness: 0.92 })
    const edge = () => new MeshStandardMaterial({ color: PAGES_EDGE, roughness: 0.98 })
    // +X, -X are the boards; +Y/-Y head and tail; +Z the spine; -Z the fore-edge.
    return {
      list: [board(), board(), edge(), edge(), new MeshStandardMaterial({ map: texture, roughness: 0.85 }), edge()],
      texture, canvas,
    }
  }, [album, index])

  // Repaint the spine when the language changes rather than rebuilding it.
  useEffect(() => {
    let cancelled = false
    ensureFonts().then(() => {
      if (cancelled) return
      paintSpine(materials.canvas, album, { language, index })
      materials.texture.needsUpdate = true
    })
    return () => { cancelled = true }
  }, [materials, album, language, index])

  useEffect(() => () => {
    materials.texture.dispose()
    materials.list.forEach((m) => m.dispose())
  }, [materials])

  const hovered = hoveredAlbum === album.id && (mode === MODES.SHELF || mode === MODES.COVER)

  useFrame((_, delta) => {
    if (!mesh.current) return
    // Hovering eases the album up and forward, the way you'd tip one out.
    easing.damp(mesh.current.position, 'y', hovered ? 0.055 : 0, 0.22, delta)
    easing.damp(mesh.current.position, 'z', hovered ? 0.07 : 0, 0.22, delta)
    // Sliding aside to clear space for whichever album has turned to face us.
    easing.damp(mesh.current.position, 'x', offsetX, 0.3, delta)
  })

  // Kept mounted while hidden so it slides back into place on the way out.
  if (hidden) return null

  return (
    <mesh
      ref={mesh}
      geometry={spineGeometry}
      material={materials.list}
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
        selectAlbum(album.id)
      }}
    />
  )
}

/**
 * How far each album steps aside for whichever one has turned to face us.
 *
 * Two things make this bigger than it first looks. An OPEN album is two pages
 * wide (~2.6 units), not one, so room sized for the closed cover leaves the
 * neighbours standing inside the book. And the active album sits closer to the
 * camera, so perspective magnifies it relative to the row behind — geometric
 * clearance alone still overlaps on screen. Hence the generous margins.
 */
export function partingOffsets(layout, activeId, spread) {
  const active = layout.findIndex((a) => a.id === activeId)
  if (active < 0) return layout.map(() => 0)
  const room = spread ? PAGE_WIDTH * 1.28 : PAGE_WIDTH * 0.72
  return layout.map((_, i) => (i < active ? -room : i > active ? room : 0))
}

export default function Shelf({ layout, language, activeId, spread }) {
  const offsets = partingOffsets(layout, activeId, spread)

  return (
    <group>
      {layout.map((album, i) => (
        <group key={album.id} position={[album.x, 0, 0]}>
          <Spine
            album={album}
            index={i}
            language={language}
            hidden={album.id === activeId}
            offsetX={offsets[i]}
          />
        </group>
      ))}

      {/* The shelf board itself. Baked-flat colour, no shadow map. */}
      <mesh position={[0, -PAGE_HEIGHT * 0.545, -PAGE_WIDTH * 0.08]}>
        <boxGeometry args={[
          layout.reduce((n, a) => n + a.thickness, 0) + SHELF_GAP * layout.length + 0.35,
          0.032,
          PAGE_WIDTH * 1.06,
        ]} />
        <meshStandardMaterial color="#5b4c3d" roughness={0.92} />
      </mesh>
    </group>
  )
}
