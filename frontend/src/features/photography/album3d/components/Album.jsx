import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Page, { PAGE_WIDTH, PAGE_HEIGHT } from './Page'
import Binding from './Binding'
import { blockCentre } from '../lib/blockLayout'
import { FaceTextureManager } from '../lib/textures'
import { FACE_W, FACE_H } from '../lib/faceCanvas'
import { focusBoxFor, worldPointFor } from '../lib/focus'
import { MODES, useAlbumStore, visibleFaceIndices } from '../lib/store'

// Every sheet is a real mesh — the page geometry is shared, so the cost of a
// long album is draw calls, not memory. What is windowed is TEXTURES, which
// are the expensive part: only sheets within WINDOW of the current spread
// carry a painted face, the rest render as blank paper.
const WINDOW = 3



/** Touch devices have no hover, so every hover affordance needs a tap path. */
const isTouch = (event) => event.pointerType === 'touch' || event.pointerType === 'pen'

/**
 * The bound album: leaves, binding and boards.
 *
 * Rendered for EVERY album on the shelf, selected or not, so choosing one adds
 * nothing to the scene — it only starts animating and starts painting faces.
 * Building the leaves at the moment of selection, which is what this used to
 * do, puts a hitch in the middle of the turn no amount of easing can hide.
 *
 * `full` is the album's compiled layout, which only the chosen album needs;
 * without it the leaves render as blank paper with the cover on the front.
 */
export default function Album({
  full, sheetCount, active, language, planeZ = 0, hingeX = 0,
  depth, pageDepth, cloth, albumId,
  coverTexture = null, backCoverTexture = null, spineTexture = null,
}) {
  const mode = useAlbumStore((s) => s.mode)
  // The reading state belongs to whichever album is in your hands. Every album
  // reads from the same store, so an unchosen one has to be pinned shut or
  // they all open together.
  const page = useAlbumStore((s) => (active ? s.page : 0))
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

  // Only the chosen album paints faces; the rest are blank paper, which is all
  // you can see of a shelved album anyway.
  const manager = useMemo(
    () => (active && full
      ? new FaceTextureManager(full, {
          language,
          budget: (WINDOW * 2 + 2) * 2,
          onUpdate: () => { forceRepaint((n) => n + 1); invalidate() },
        })
      : null),
    [active, full, invalidate]
  )

  useEffect(() => () => manager?.dispose(), [manager])
  useEffect(() => { manager?.setLanguage(language) }, [manager, language])

  const leaves = full ? full.sheets.length : sheetCount
  const faceCount = manager?.faceCount() ?? 0

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
    if (!manager) return
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
    const entry = manager?.entries.get(faceIndex)
    if (!entry || !event.uv) return null
    const x = event.uv.x * FACE_W
    const y = (1 - event.uv.y) * FACE_H
    return entry.hitboxes.find(
      (h) => x >= h.rect.x && x <= h.rect.x + h.rect.w && y >= h.rect.y && y <= h.rect.y + h.rect.h
    ) || null
  }, [manager])

  const handlePointerMove = useCallback((event, sheetIndex) => {
    if (isTouch(event)) return // a touch "move" is a drag, not a hover
    if (!manager || heldStack) return
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return

    // Claim the event for the NEAREST leaf, hit or miss. Every leaf is
    // raycastable, so bailing out early without claiming it lets the pointer
    // fall through bare paper to a leaf behind — which then leans in on a
    // photograph the pointer is nowhere near.
    event.stopPropagation()
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

    if (!sameSlot) setHoveredSlot({ faceIndex, ...hit })

    // Anything with something to read or look at closely.
    const leanable = hit.slot.kind !== 'cover' && hit.slot.kind !== 'back-cover'
    if (!sameSlot) document.body.style.cursor = 'pointer'

    if (!leanable) { setFocus(null); return }

    // The anchor — the spot on the page you actually pointed at — is captured
    // once, when the pointer arrives on a slot. Picking it again every frame
    // would read it back through the camera that is moving because of it,
    // which is the feedback that made earlier versions oscillate.
    const previous = useAlbumStore.getState().focus
    const keep = sameSlot && previous
    const ndc = { x: event.pointer.x, y: event.pointer.y }

    setFocus({
      // Captured once, together with the screen position it was captured at,
      // so the zoom can hold that exact spot under the pointer.
      anchor: keep
        ? previous.anchor
        : worldPointFor(event.uv.x, event.uv.y, sheetIndex, delayedPage, hingeX),
      ndc0: keep ? previous.ndc0 : ndc,
      // Live pointer, in normalised device coordinates: pure screen space, so
      // it cannot feed back into the camera that consumes it.
      ndc,
      box: focusBoxFor(hit.rect, sheetIndex, delayedPage, hingeX),
      // The plane the anchor lives on. Without it the camera solves against
      // an undefined depth and the whole rig goes to NaN.
      z: planeZ,
    })
  }, [mode, hitTest, setHoveredSlot, setFocus, delayedPage, heldStack, manager, planeZ, hingeX])

  const handlePointerOut = useCallback(() => {
    currentHit.current = null
    clearTimers()
    setHoveredSlot(null)
    document.body.style.cursor = ''
    setFocus(null)
  }, [setHoveredSlot, setFocus])

  const handleClick = useCallback((event, sheetIndex) => {
    if (!manager || heldStack) return
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return
    event.stopPropagation() // nearest leaf only, as above

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
  }, [mode, hitTest, delayedPage, prev, next, zoom, unzoom, takeStack, heldStack, manager])

  useEffect(() => () => { clearTimers(); document.body.style.cursor = '' }, [])

  // ---- placement -----------------------------------------------------------

  const bookClosed = delayedPage === 0 || delayedPage === leaves

  // The binding stays put and the leaves move around it — the book never
  // translates, in any state. Centring on the block's bounding box instead,
  // as this used to, slides the whole body half a page sideways the moment
  // the first leaf swings across, which is a book teleporting rather than a
  // book opening.
  //
  // Only the thickness is centred, and that is constant: leaves pile along -x
  // from the hinge, and the binding spans the full depth.


  // Centre the block on the leaves' own extent. Half a leaf of that extent is
  // the outermost leaf's own thickness, so centring on the nominal depth
  // instead leaves the boards proud at the front and short at the back — the
  // binding then reads as not quite flush with the book it binds.
  const centre = blockCentre(depth, pageDepth)

  return (
    <group ref={group}>
     <group position={[centre, 0, 0]}>
      <Binding
        depth={depth}
        pageDepth={pageDepth}
        cloth={cloth}
        albumId={albumId}
        spineTexture={spineTexture}
      />

      {Array.from({ length: leaves }, (_, sheetIndex) => {
        const front = manager?.entries.get(sheetIndex * 2)
        const back = manager?.entries.get(sheetIndex * 2 + 1)
        // The outermost leaves are the boards: stiff, and printed on the
        // outside even when the album's own pages have not been loaded.
        const isBoard = sheetIndex === 0 || sheetIndex === leaves - 1
        return (
          <Page
            key={sheetIndex}
            number={sheetIndex}
            page={delayedPage}
            sheetCount={leaves}
            pageDepth={pageDepth}
            opened={delayedPage > sheetIndex}
            bookClosed={bookClosed}
            rigid={isBoard}
            frontTexture={front?.texture || (sheetIndex === 0 ? coverTexture : null)}
            backTexture={back?.texture || (sheetIndex === leaves - 1 ? backCoverTexture : null)}
            onPointerMove={active ? (e) => handlePointerMove(e, sheetIndex) : undefined}
            onPointerOut={active ? handlePointerOut : undefined}
            onClick={active ? (e) => handleClick(e, sheetIndex) : undefined}
          />
        )
      })}
      </group>
    </group>
  )
}

export { PAGE_WIDTH, PAGE_HEIGHT }
