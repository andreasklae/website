import { useMemo } from 'react'
import AlbumBook from './AlbumBook'
import { PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH } from './Page'

export const SHELF_GAP = 0.055

/** The two boards, front and back. */
export const COVER_BOARD = 0.022

/**
 * A shelved album is exactly as thick as its leaves plus its boards, so the
 * block you see edge-on and the pages you turn are the same object measured
 * the same way.
 */
export const albumThickness = (sheetCount) => sheetCount * PAGE_DEPTH + COVER_BOARD * 2

/**
 * Positions every album along the shelf and returns each one's centre, so the
 * shelf and the camera agree on where a book lives.
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

export default function Shelf({ layout, language, activeId, full }) {

  return (
    <group>
      {layout.map((album, i) => (
        <group key={album.id} position={[album.x, 0, 0]}>
          <AlbumBook
            album={album}
            full={full?.id === album.id ? full : null}
            index={i}
            language={language}
            active={album.id === activeId}
          />
        </group>
      ))}

      {/* The shelf board itself. Flat colour, no shadow map. */}
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
