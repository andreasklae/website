import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import Album from './Album'
import { PAGE_WIDTH } from './Page'
import { FORWARD_Z, READING_ROTATION } from './AlbumBook'
import { useAlbumStore } from '../lib/store'

/**
 * The album once it is open. Up to that point the very same book is the box
 * rendered by AlbumBook, turning in place on the shelf; this takes over at the
 * moment the first page lifts, at the same position and the same rotation, so
 * the handover is invisible.
 */
export default function ActiveAlbum({ album, language, thickness = 0 }) {
  const group = useRef()
  const page = useAlbumStore((s) => s.page)

  // Pages hinge at x=0 and extend one way, so a CLOSED book sits wholly to one
  // side of the hinge and needs nudging back by half a page. An open spread
  // already straddles the hinge.
  //
  // This belongs on the group that CARRIES the rotation, not inside it: a
  // shift applied within the album's own rotated frame travels along world Z.
  const sheetCount = album?.sheets.length ?? 0
  const bookClosed = page === 0 || page === sheetCount
  const offsetX = bookClosed ? -PAGE_WIDTH / 2 : 0

  // Sheet 0's front face is the album's cover. The block's front board sits
  // half a thickness proud of its centre, so the leaves start there — the
  // cover stays put at the instant one becomes the other.
  const z = FORWARD_Z + thickness / 2

  useFrame((_, delta) => {
    if (!group.current) return
    easing.damp(group.current.position, 'x', offsetX, 0.4, delta)
  })

  return (
    <group ref={group} position={[offsetX, 0, z]} rotation-y={READING_ROTATION}>
      {album && <Album album={album} language={language} planeZ={z} />}
    </group>
  )
}
