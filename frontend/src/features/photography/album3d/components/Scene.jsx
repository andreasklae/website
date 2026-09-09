import { Suspense } from 'react'
import Shelf, { useShelfLayout } from './Shelf'
import Room, { SLIDE_ROOM } from './Room'
import Lamp from './Lamp'
import CameraRig from './CameraRig'
import { useAlbumStore } from '../lib/store'

export default function Scene({ shelf, album, language }) {
  const layout = useShelfLayout(shelf)
  const booksLeft = layout.length ? layout[0].x - layout[0].thickness / 2 : -0.5
  const booksRight = layout.length
    ? layout[layout.length - 1].x + layout[layout.length - 1].thickness / 2
    : 0.5
  // The camera frames the bay, not just the books: the empty half of the shelf
  // is where the row goes when one is picked out, and it should be in shot.
  const shelfWidth = booksRight - booksLeft + SLIDE_ROOM
  const activeId = useAlbumStore((s) => s.activeId)
  const hoveredId = useAlbumStore((s) => s.hoveredAlbum)
  const slot = layout.find((a) => a.id === activeId)

  return (
    <>
      <CameraRig shelfWidth={shelfWidth} />

      {/*
        Enough moonlight to find the lamp's cord by, and no more: the lamp is
        still what lights the room. Still no shadow maps — they are what costs
        frames here, and the room reads without them.
      */}
      <ambientLight intensity={0.3} color="#8294ad" />
      <hemisphereLight args={['#8ea3c0', '#3a2c1e', 0.36]} />
      <Lamp x={booksLeft + 0.18} />

      <Suspense fallback={null}>
        <Room booksLeft={booksLeft} booksRight={booksRight} />
        {/*
          The row does not move. Sliding the shelf to bring an album to the
          middle also slid it relative to the bookcase it is standing in, which
          reads as the whole case shifting; the camera goes to the album
          instead.
        */}
        <Shelf
            layout={layout}
            language={language}
            activeId={activeId}
            hoveredId={hoveredId}
            full={album}
          />
      </Suspense>
    </>
  )
}
