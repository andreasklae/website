import { useMemo } from 'react'
import AlbumBook from './AlbumBook'
import { PAGE_WIDTH, PAGE_HEIGHT } from './Page'
import { depthFor } from '../lib/albumDepth'

// Albums stand shoulder to shoulder. The only gap on the shelf is the one
// that opens around whichever album is in play.
export const SHELF_GAP = 0.004

/**
 * How far the books to the RIGHT of the pointer slide over.
 *
 * Only the right-hand side moves: the row stands against the left upright of
 * the bookcase, so there is nowhere for the left-hand books to go. Wide enough
 * that the hovered album can turn far enough to show its cover.
 */
export const HOVER_PART = 0.52

/**
 * A shelved album is exactly as thick as its leaves, so the block you see
 * edge-on and the pages you turn are the same object measured the same way.
 * The thickness is a property of the album rather than of its page count.
 */
export const albumThickness = depthFor

/**
 * Positions every album along the shelf and returns each one's centre, so the
 * shelf and the camera agree on where a book lives.
 */
export function useShelfLayout(shelf) {
  return useMemo(() => {
    const items = shelf.map((a) => ({ ...a, thickness: albumThickness(a.id) }))
    const total = items.reduce((n, a) => n + a.thickness, 0) + SHELF_GAP * Math.max(0, items.length - 1)
    let x = -total / 2
    return items.map((a) => {
      const centre = x + a.thickness / 2
      x += a.thickness + SHELF_GAP
      return { ...a, x: centre }
    })
  }, [shelf])
}

export default function Shelf({ layout, language, activeId, hoveredId, full }) {
  // The album being pointed at, or — once one has been chosen — the one that
  // was: picking a book should not shut the gap that opened for it.
  const parted = layout.findIndex((a) => a.id === (hoveredId ?? activeId))

  return (
    <group>
      {layout.map((album, i) => (
        <group key={album.id} position={[album.x, 0, 0]}>
          <AlbumBook
            album={album}
            full={full?.id === album.id ? full : null}
            index={i}
            language={language}
            partX={parted >= 0 && i > parted ? HOVER_PART : 0}
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
