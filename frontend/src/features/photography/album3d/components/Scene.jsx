import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { lampLevel } from '../lib/lampLevel'
import Shelf, { useShelfLayout } from './Shelf'
import Room, { SLIDE_ROOM } from './Room'
import Lamp from './Lamp'
import CameraRig from './CameraRig'
import { useAlbumStore } from '../lib/store'
import { lampX } from '../lib/lampPose'
import DevStill from './DevStill'

/**
 * The light bouncing around the room, which is most of what actually lights it.
 *
 * A point light falls off with the square of the distance, so one bulb can
 * model the half-metre around itself and nothing else: at three metres it is a
 * ninth as strong, and the room went from a couple of metres across to nearly
 * eight. Turning the bulb up cannot fix that — it would blow out the books
 * long before it reached the far wall — because the missing light is not
 * direct light at all. It is everything that has already hit a surface once.
 *
 * So this comes up with the lamp and goes down with it, and the bulb keeps
 * doing the modelling nearby.
 */
const FILL = 0.8
const FILL_SKY = 0.4

function RoomFill() {
  const fill = useRef()
  const sky = useRef()

  useFrame(() => {
    const t = lampLevel.value
    if (fill.current) fill.current.intensity = t * FILL
    if (sky.current) sky.current.intensity = t * FILL_SKY
  })

  return (
    <>
      <ambientLight ref={fill} color="#ffd2a6" intensity={0} />
      {/* Warm off the lit ceiling above, and off the parquet below. */}
      <hemisphereLight ref={sky} args={['#ffd8ad', '#6b4a2c', 0]} />
    </>
  )
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
      {new URLSearchParams(location.search).has('still') && <DevStill />}

      {/*
        Enough moonlight to find the lamp's cord by, and no more, so the lamp
        is what lights the room. Still no shadow maps — they are what costs
        frames here, and the room reads without them.
      */}
      <ambientLight intensity={0.3} color="#8294ad" />
      <hemisphereLight args={['#8ea3c0', '#3a2c1e', 0.36]} />
      <RoomFill />
      {/* Clear of the case's right-hand upright, so it hangs beside the
          bookcase rather than in front of it. */}
      <Lamp x={lampX(booksRight, SLIDE_ROOM)} />

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
