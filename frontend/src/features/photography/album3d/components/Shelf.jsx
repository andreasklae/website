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
  // A SHUT album lies wholly to one side of its binding, so it reaches a full
  // page width even before it opens — sizing this for half a cover, as it once
  // was, puts the neighbour inside the book. One room for every reading state
  // keeps the row still while the album turns and opens.
  const room = PAGE_WIDTH * 1.32
  return layout.map((_, i) => (i < active ? -room : i > active ? room : 0))
}

export default function Shelf({ layout, language, activeId, full, spread }) {
  const offsets = partingOffsets(layout, activeId, spread)

  return (
    <group>
      {layout.map((album, i) => (
        <group key={album.id} position={[album.x, 0, 0]}>
          <AlbumBook
            album={album}
            full={full?.id === album.id ? full : null}
            index={i}
            language={language}
            offsetX={offsets[i]}
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
