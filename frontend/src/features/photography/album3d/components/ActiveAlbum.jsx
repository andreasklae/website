import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import Album from './Album'
import { PAGE_WIDTH } from './Page'
import { FORWARD_Z, READING_ROTATION, SHELF_ROTATION, TURN_SMOOTHING } from './AlbumBook'
import { useSpineTexture } from '../lib/useSpineTexture'
import { useAlbumStore } from '../lib/store'

/**
 * The bound album — leaves, boards and spine — from the moment it is chosen
 * until it has turned back into the row.
 *
 * The shelved block hands over the instant an album is picked, while both are
 * still edge-on and showing the same spine, so nothing visibly changes hands.
 * Everything after that — turning to face you, opening, turning back — happens
 * to this one object.
 */
export default function ActiveAlbum({ album, language, thickness = 0, index = 0, active, onRetired }) {
  const group = useRef()
  const page = useAlbumStore((s) => s.page)
  const spineTexture = useSpineTexture(album, language, index)
  const retired = useRef(false)

  // Leaves hinge at x=0 and extend one way, so a CLOSED book sits wholly to
  // one side of the hinge and needs nudging back by half a page. An open
  // spread already straddles it.
  //
  // This belongs on the group that CARRIES the rotation, not inside it: a
  // shift applied within the album's own rotated frame travels along world Z.
  const sheetCount = album?.sheets.length ?? 0
  const bookClosed = page === 0 || page === sheetCount
  const offsetX = bookClosed ? -PAGE_WIDTH / 2 : 0

  // Sheet 0's front face is the cover, and the block's front board sits half a
  // thickness proud of its centre, so the leaves start there.
  const z = FORWARD_Z + thickness / 2

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    // The same smoothing whichever way it is going, so turning back is the
    // exact reverse of turning out.
    easing.dampAngle(g.rotation, 'y', active ? READING_ROTATION : SHELF_ROTATION, TURN_SMOOTHING, delta)
    easing.damp3(g.position, [active ? offsetX : 0, 0, active ? z : 0], TURN_SMOOTHING, delta)

    // Once it is square with the row again the shelved block can take over.
    if (!active && !retired.current && Math.abs(g.rotation.y - SHELF_ROTATION) < 0.008) {
      retired.current = true
      onRetired?.()
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]} rotation-y={SHELF_ROTATION}>
      {album && (
        <Album album={album} language={language} planeZ={z} spineTexture={spineTexture} />
      )}
    </group>
  )
}
