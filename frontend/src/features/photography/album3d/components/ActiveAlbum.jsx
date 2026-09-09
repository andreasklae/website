import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import Album from './Album'
import { PAGE_WIDTH } from './Page'
import { MODES, useAlbumStore } from '../lib/store'

// Shelved, the spine faces the camera. A quarter turn brings the front cover
// round; the pages are authored in that same reading frame, so one rotation
// serves both the cover and the open spread.
const SHELF_ROTATION = 0
const READING_ROTATION = -Math.PI / 2

/**
 * The chosen album turns in place rather than sliding out of the row — its
 * neighbours step aside instead (see `partingOffsets`). Nothing ever passes
 * through another book, and switching albums is a single click.
 */
export default function ActiveAlbum({ album, slot, language }) {
  const group = useRef()
  const mode = useAlbumStore((s) => s.mode)
  const open = useAlbumStore((s) => s.open)

  const reading = mode === MODES.OPEN || mode === MODES.ZOOM

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    // Facing you, the album stands where it sat on the shelf, eased forward so
    // it clears the row. Open, it comes forward further to be read.
    easing.damp3(g.position, [0, 0, reading ? PAGE_WIDTH * 0.5 : PAGE_WIDTH * 0.16], 0.4, delta)
    easing.dampAngle(g.rotation, 'y', READING_ROTATION, 0.4, delta)
  })

  return (
    <group ref={group} position={[0, 0, 0]} rotation-y={SHELF_ROTATION}>
      {album && (
        <Album
          album={album}
          language={language}
          onCoverClick={mode === MODES.COVER ? open : undefined}
        />
      )}
    </group>
  )
}
