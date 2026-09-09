import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import Album from './Album'
import { FORWARD_Z, READING_ROTATION, SHELF_ROTATION, TURN_SMOOTHING } from './AlbumBook'
import { useSpineTexture } from '../lib/useSpineTexture'

/**
 * The bound album — leaves, boards and spine — from the moment it is chosen
 * until it has turned back into the row.
 *
 * The shelved block hands over the instant an album is picked, while both are
 * still edge-on and showing the same spine, so nothing visibly changes hands.
 * Everything after that — turning to face you, opening, turning back — happens
 * to this one object.
 */
export default function ActiveAlbum({ album, language, index = 0, active, onRetired }) {
  const group = useRef()
  const spineTexture = useSpineTexture(album, language, index)
  const retired = useRef(false)

  // Nothing to offset here any more: the album centres its own block on this
  // origin, in its own local space, so it occupies exactly the volume the
  // shelved block does whichever way it happens to be turned.

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    // The same smoothing whichever way it is going, so turning back is the
    // exact reverse of turning out.
    easing.dampAngle(g.rotation, 'y', active ? READING_ROTATION : SHELF_ROTATION, TURN_SMOOTHING, delta)
    easing.damp3(g.position, [0, 0, active ? FORWARD_Z : 0], TURN_SMOOTHING, delta)

    // Once it is square with the row again the shelved block can take over.
    if (!active && !retired.current && Math.abs(g.rotation.y - SHELF_ROTATION) < 0.008) {
      retired.current = true
      onRetired?.()
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]} rotation-y={SHELF_ROTATION}>
      {album && (
        <Album album={album} language={language} planeZ={FORWARD_Z} spineTexture={spineTexture} />
      )}
    </group>
  )
}
