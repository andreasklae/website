import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Page, { PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH } from './Page'
import { FaceTextureManager } from '../lib/textures'
import { FACE_W, FACE_H } from '../lib/faceCanvas'
import { focusBoxFor, worldPointFor, leanTarget } from '../lib/focus'
import { MODES, useAlbumStore, visibleFaceIndices } from '../lib/store'

// Every sheet is a real mesh — the page geometry is shared, so the cost of a
// long album is draw calls, not memory. What is windowed is TEXTURES, which
// are the expensive part: only sheets within WINDOW of the current spread
// carry a painted face, the rest render as blank paper.
const WINDOW = 3



/** Touch devices have no hover, so every hover affordance needs a tap path. */
const isTouch = (event) => event.pointerType === 'touch' || event.pointerType === 'pen'

export default function Album({ album, language }) {
  const mode = useAlbumStore((s) => s.mode)
  const page = useAlbumStore((s) => s.page)
  const heldStack = useAlbumStore((s) => s.heldStack)
  const setHoveredSlot = useAlbumStore((s) => s.setHoveredSlot)
  const zoom = useAlbumStore((s) => s.zoom)
  const takeStack = useAlbumStore((s) => s.takeStack)
  const unzoom = useAlbumStore((s) => s.unzoom)
  const setFocus = useAlbumStore((s) => s.setFocus)
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
  const currentHit = useRef(null)

  const clearTimers = () => {
    clearTimeout(hoverTimer.current); hoverTimer.current = null
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
    if (isTouch(event)) return // a touch "move" is a drag, not a hover
    if (heldStack) return
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return
    // materialIndex 4 is the +Z face (front of the sheet), 5 is the back.
    const isFront = event.face?.materialIndex === 4
    const faceIndex = sheetIndex * 2 + (isFront ? 0 : 1)
    const hit = hitTest(event, faceIndex)

    const key = hit ? `${faceIndex}:${hit.index}` : null
    const sameSlot = key === currentHit.current
    currentHit.current = key
    clearTimers()
    // Repeat moves within one photograph must still be processed — that is
    // what pans the camera. Only the cursor/hover bookkeeping is skipped.

    // Left the photograph's own borders: fall back to the whole spread.
    if (!hit) {
      setHoveredSlot(null)
      document.body.style.cursor = ''
      setFocus(null)
      return
    }
    event.stopPropagation()

    if (!sameSlot) setHoveredSlot({ faceIndex, ...hit })

    // Photographs and stacks are worth leaning in on; postcards and memos are
    // already legible at spread distance.
    const leanable = hit.slot.kind === 'photo' || hit.slot.kind === 'stack'
    if (!sameSlot) document.body.style.cursor = leanable ? 'zoom-in' : 'pointer'

    if (!leanable) { setFocus(null); return }

    // Pan with the cursor. leanTarget deliberately does not centre on the
    // pointer — see the note there — so this updates every move without the
    // camera chasing itself.
    const box = focusBoxFor(hit.rect, sheetIndex, delayedPage)
    const point = worldPointFor(event.uv.x, event.uv.y, sheetIndex, delayedPage)
    setFocus(leanTarget(box, point))
  }, [mode, hitTest, setHoveredSlot, setFocus, delayedPage, heldStack])

  const handlePointerOut = useCallback(() => {
    currentHit.current = null
    clearTimers()
    setHoveredSlot(null)
    document.body.style.cursor = ''
    setFocus(null)
  }, [setHoveredSlot, setFocus])

  const handleClick = useCallback((event, sheetIndex) => {
    if (heldStack) return
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return

    const isFront = event.face?.materialIndex === 4
    const faceIndex = sheetIndex * 2 + (isFront ? 0 : 1)
    const hit = hitTest(event, faceIndex)

    if (hit?.slot.kind === 'stack') {
      event.stopPropagation()
      takeStack(hit.slot)
      return
    }
    if (hit?.slot.kind === 'photo') {
      event.stopPropagation()
      // Clicking commits to the photograph, at full size and pin-sharp.
      // On touch, where there is no hover to lean in with, this is the way in.
      if (useAlbumStore.getState().mode === MODES.ZOOM) unzoom()
      else zoom({ ...hit.slot, faceIndex })
      return
    }

    // Clicking bare paper turns the page, in the direction of the click.
    event.stopPropagation()
    if (useAlbumStore.getState().mode === MODES.ZOOM) { unzoom(); return }
    if (sheetIndex < delayedPage) prev(); else next()
  }, [mode, hitTest, delayedPage, prev, next, zoom, unzoom, takeStack, heldStack])

  useEffect(() => () => { clearTimers(); document.body.style.cursor = '' }, [])

  // ---- placement -----------------------------------------------------------

  const bookClosed = delayedPage === 0 || delayedPage === sheets.length

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

    </group>
  )
}

export { PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH }
