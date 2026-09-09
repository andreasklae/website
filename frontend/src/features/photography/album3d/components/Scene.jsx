import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import Shelf, { useShelfLayout } from './Shelf'
import Room, { SLIDE_ROOM } from './Room'
import Lamp from './Lamp'
import CameraRig from './CameraRig'
import { useAlbumStore } from '../lib/store'

/**
 * Slides the whole row so the chosen album ends up dead centre. Panning the
 * shelf rather than the camera keeps framing identical whichever album is
 * picked — which matters most on a phone, where there is no room to spare.
 */
function ShelfPan({ targetX, children }) {
  const group = useRef()
  useFrame((_, delta) => {
    if (group.current) easing.damp(group.current.position, 'x', targetX, 0.4, delta)
  })
  return <group ref={group}>{children}</group>
}

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
        Dim enough that the lamp is doing the work. Still no shadow maps —
        they are what costs frames here, and the room reads without them.
      */}
      <ambientLight intensity={0.1} color="#8294ad" />
      <hemisphereLight args={['#8ea3c0', '#3a2c1e', 0.14]} />
      <Lamp x={booksRight + SLIDE_ROOM * 0.72} />

      <Suspense fallback={null}>
        <Room booksLeft={booksLeft} booksRight={booksRight} />
        <ShelfPan targetX={slot ? -slot.x : 0}>
          <Shelf
            layout={layout}
            language={language}
            activeId={activeId}
            hoveredId={hoveredId}
            full={album}
          />
        </ShelfPan>
      </Suspense>
    </>
  )
}
