import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useRef } from 'react'
import Album from './Album'
import { PAGE_WIDTH } from './Page'
import { COVER_HOLD_MS, MODES, useAlbumStore } from '../lib/store'

// Shelved, the spine faces the camera. Turning the album a quarter turn brings
// the front cover round; the pages are authored in that same reading frame,
// so one rotation serves both the cover and the open spread.
const SHELF_ROTATION = 0
const READING_ROTATION = -Math.PI / 2

export default function ActiveAlbum({ album, slot, language }) {
  const group = useRef()
  const mode = useAlbumStore((s) => s.mode)
  const reachedCover = useAlbumStore((s) => s.reachedCover)
  const open = useAlbumStore((s) => s.open)

  // Hold the cover for a beat before the album opens itself.
  useEffect(() => {
    if (mode !== MODES.COVER) return
    const t = setTimeout(open, COVER_HOLD_MS)
    return () => clearTimeout(t)
  }, [mode, open])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    const pulling = mode === MODES.PULLING
    const target = pulling
      // Clear the row first, along +Z, before travelling to the centre.
      ? { pos: [slot.x, 0.02, PAGE_WIDTH * 0.85], rot: SHELF_ROTATION }
      : { pos: [0, 0, PAGE_WIDTH * 0.55], rot: READING_ROTATION }

    easing.damp3(g.position, target.pos, pulling ? 0.3 : 0.45, delta)
    easing.dampAngle(g.rotation, 'y', target.rot, 0.45, delta)

    if (pulling && g.position.z > PAGE_WIDTH * 0.6) reachedCover()
  })

  return (
    <group ref={group} position={[slot.x, 0, 0]} rotation-y={SHELF_ROTATION}>
      {album && <Album album={album} language={language} />}
    </group>
  )
}
