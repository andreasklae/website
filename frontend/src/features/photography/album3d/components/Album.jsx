import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Page, { PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH } from './Page'
import ZoomOverlay from './ZoomOverlay'
import { FaceTextureManager } from '../lib/textures'
import { FACE_W, FACE_H } from '../lib/faceCanvas'
import { MODES, useAlbumStore, visibleFaceIndices } from '../lib/store'

// Every sheet is a real mesh — the page geometry is shared, so the cost of a
// long album is draw calls, not memory. What is windowed is TEXTURES, which
// are the expensive part: only sheets within WINDOW of the current spread
// carry a painted face, the rest render as blank paper.
const WINDOW = 3

const HOVER_ZOOM_DELAY = 260
const STACK_CYCLE_MS = 750

export default function Album({ album, language }) {
  const mode = useAlbumStore((s) => s.mode)
  const page = useAlbumStore((s) => s.page)
  const zoomed = useAlbumStore((s) => s.zoomed)
  const setHoveredSlot = useAlbumStore((s) => s.setHoveredSlot)
  const zoom = useAlbumStore((s) => s.zoom)
  const unzoom = useAlbumStore((s) => s.unzoom)
  const next = useAlbumStore((s) => s.next)
  const prev = useAlbumStore((s) => s.prev)

  const group = useRef()
  const { invalidate } = useThree()
  const [, forceRepaint] = useState(0)

  const manager = useMemo(
    () => new FaceTextureManager(album, {
      language,
      budget: (WINDOW * 2 + 2) * 2,
      onUpdate: () => { forceRepaint((n) => n + 1); invalidate() },
    }),
    [album, invalidate]
  )

  useEffect(() => () => manager.dispose(), [manager])
  useEffect(() => { manager.setLanguage(language) }, [manager, language])

  const sheets = album.sheets
  const faceCount = manager.faceCount()

  // Delay page turns so a multi-page jump cascades instead of snapping.
  const [delayedPage, setDelayedPage] = useState(page)
  useEffect(() => {
    let timeout
    const step = () => {
      setDelayedPage((current) => {
        if (current === page) return current
        timeout = setTimeout(step, Math.abs(page - current) > 2 ? 50 : 150)
        return current + Math.sign(page - current)
      })
    }
    step()
    return () => clearTimeout(timeout)
  }, [page])

  // Keep only the textures the current spread and its neighbours need.
  useEffect(() => {
    const wanted = visibleFaceIndices(delayedPage, faceCount)
    wanted.forEach((i) => manager.acquire(i))
    manager.keepOnly(wanted)
    invalidate()
  }, [delayedPage, faceCount, manager, invalidate])

  // ---- hover / hit testing -------------------------------------------------

  const hoverTimer = useRef(null)
  const stackTimer = useRef(null)
  const currentHit = useRef(null)

  const clearTimers = () => {
    clearTimeout(hoverTimer.current); hoverTimer.current = null
    clearInterval(stackTimer.current); stackTimer.current = null
  }

  /** Maps a pointer hit on a page face to the album slot under the cursor. */
  const hitTest = useCallback((event, faceIndex) => {
    const entry = manager.entries.get(faceIndex)
    if (!entry || !event.uv) return null
    const x = event.uv.x * FACE_W
    const y = (1 - event.uv.y) * FACE_H
    return entry.hitboxes.find(
      (h) => x >= h.rect.x && x <= h.rect.x + h.rect.w && y >= h.rect.y && y <= h.rect.y + h.rect.h
    ) || null
  }, [manager])

  const handlePointerMove = useCallback((event, sheetIndex) => {
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return
    // materialIndex 4 is the +Z face (front of the sheet), 5 is the back.
    const isFront = event.face?.materialIndex === 4
    const faceIndex = sheetIndex * 2 + (isFront ? 0 : 1)
    const hit = hitTest(event, faceIndex)

    const key = hit ? `${faceIndex}:${hit.index}` : null
    if (key === currentHit.current) return
    currentHit.current = key
    clearTimers()

    if (!hit) { setHoveredSlot(null); document.body.style.cursor = ''; return }
    event.stopPropagation()

    setHoveredSlot({ faceIndex, ...hit })
    document.body.style.cursor = 'pointer'

    if (hit.slot.kind === 'photo') {
      hoverTimer.current = setTimeout(() => zoom({ ...hit.slot, faceIndex }), HOVER_ZOOM_DELAY)
    } else if (hit.slot.kind === 'stack') {
      // Sift through the stack for as long as the cursor rests on it.
      stackTimer.current = setInterval(() => manager.cycleStack(faceIndex, hit.index, 1), STACK_CYCLE_MS)
    }
  }, [mode, hitTest, manager, setHoveredSlot, zoom])

  const handlePointerOut = useCallback(() => {
    currentHit.current = null
    clearTimers()
    setHoveredSlot(null)
    document.body.style.cursor = ''
    if (useAlbumStore.getState().mode === MODES.ZOOM) unzoom()
  }, [setHoveredSlot, unzoom])

  const handleClick = useCallback((event, sheetIndex) => {
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return
    const isFront = event.face?.materialIndex === 4
    const faceIndex = sheetIndex * 2 + (isFront ? 0 : 1)
    const hit = hitTest(event, faceIndex)

    if (hit?.slot.kind === 'stack') {
      event.stopPropagation()
      manager.cycleStack(faceIndex, hit.index, 1)
      return
    }
    if (hit?.slot.kind === 'photo') { event.stopPropagation(); return }

    // Clicking bare paper turns the page, in the direction of the click.
    event.stopPropagation()
    if (sheetIndex < delayedPage) prev(); else next()
  }, [mode, hitTest, manager, delayedPage, prev, next])

  useEffect(() => () => { clearTimers(); document.body.style.cursor = '' }, [])

  // ---- placement -----------------------------------------------------------

  // Pages hinge at x=0 and extend +X, so a closed book sits wholly to one side
  // and has to be nudged back; an open spread already straddles the hinge.
  const bookClosed = delayedPage === 0 || delayedPage === sheets.length
  useFrame((_, delta) => {
    if (!group.current) return
    easing.damp(group.current.position, 'x', bookClosed ? -PAGE_WIDTH / 2 : 0, 0.32, delta)
  })

  return (
    <group ref={group}>
      {sheets.map((_, sheetIndex) => {
        const front = manager.entries.get(sheetIndex * 2)
        const back = manager.entries.get(sheetIndex * 2 + 1)
        return (
          <Page
            key={sheetIndex}
            number={sheetIndex}
            sheetCount={sheets.length}
            opened={delayedPage > sheetIndex}
            bookClosed={bookClosed}
            frontTexture={front?.texture}
            backTexture={back?.texture}
            onPointerMove={(e) => handlePointerMove(e, sheetIndex)}
            onPointerOut={handlePointerOut}
            onClick={(e) => handleClick(e, sheetIndex)}
          />
        )
      })}

      {zoomed && <ZoomOverlay slot={zoomed} />}
    </group>
  )
}

export { PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH }
