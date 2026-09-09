// Maps a hit on a page face back into world space, so the camera can move in
// on the thing under the cursor rather than swapping it for an overlay.

import { FACE_W, FACE_H } from './faceCanvas'

export const PAGE_WIDTH = 1.28
export const PAGE_HEIGHT = 1.71

/**
 * World-space point on the open album for a face UV.
 *
 * `hingeX` is where the binding actually sits: the album drifts across as it
 * turns, and everything below is measured from the hinge, so leaving it out
 * puts every anchor half a page from the photograph it belongs to.
 */
export function worldPointFor(u, v, sheetIndex, page, hingeX = 0) {
  const opened = sheetIndex < page
  return {
    x: hingeX + (opened ? -(1 - u) * PAGE_WIDTH : u * PAGE_WIDTH),
    y: (v - 0.5) * PAGE_HEIGHT,
  }
}

/**
 * How much of the way from the spread to a full-photo close-up the camera
 * actually travels. Fitting a photograph exactly is a ~60% cut in distance,
 * which reads as a jump rather than a lean, so only a fraction of it is taken.
 */
export const LEAN_DISTANCE = 0.45

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

/**
 * How much of the pointer's movement becomes pan, once the lean has settled.
 *
 * Above 1 the view outruns the pointer, so a small movement crosses the whole
 * photograph rather than needing the pointer at the edge of the screen — and
 * the photograph slides out from under the pointer rather than following it
 * forever, so moving away still releases it. (At exactly 1 it would be pinned
 * and impossible to leave.)
 */
export const LEAN_PAN_GAIN = 1.7

/** The camera is never allowed to wander further than the open spread. */
const BOUNDS = { x: PAGE_WIDTH, y: PAGE_HEIGHT * 0.5 }

/** Centre of the spread the focus sits on, so the bounds travel with it. */
const boundsCentre = (focus) => focus.box?.hingeX ?? 0

/**
 * Where the camera must look for the world point `anchor` to sit under the
 * pointer, given where the pointer is on screen and how much world the camera
 * currently spans.
 *
 * This is solved, not iterated. `ndc` is the pointer in normalised device
 * coordinates — pure screen space, owing nothing to where the camera is — so
 * the answer never feeds back into its own input. That is what makes it
 * stable, and it is precisely where the earlier attempts went wrong: they
 * derived the target from a world point picked through the very camera they
 * were then moving.
 *
 * At the pointer position the anchor was captured at, the spot is held
 * exactly, so zooming keeps it under the cursor. Movement away from that
 * position pans, damped by LEAN_PAN_GAIN.
 *
 * @param halfW,halfH  half the world extent the camera spans at its distance
 */
export function anchoredTarget(focus, halfW, halfH) {
  const { anchor, ndc, ndc0 } = focus
  // Holding the anchor under the pointer is the `- ndc0 * half` term. The pan
  // is ADDED on top: moving the pointer right walks the camera right, so the
  // view follows the pointer rather than sliding away from it.
  const x = anchor.x - ndc0.x * halfW + (ndc.x - ndc0.x) * LEAN_PAN_GAIN * halfW
  const y = anchor.y - ndc0.y * halfH + (ndc.y - ndc0.y) * LEAN_PAN_GAIN * halfH
  const cx = boundsCentre(focus)
  return {
    x: clamp(x, cx - BOUNDS.x, cx + BOUNDS.x),
    y: clamp(y, -BOUNDS.y, BOUNDS.y),
  }
}

/**
 * Converts a rectangle in face-canvas pixels to a world-space box on the open
 * album.
 *
 * Pages hinge at x=0. An unopened sheet lies to the right and shows its FRONT
 * face; an opened one lies to the left, flipped, and shows its BACK. Three.js
 * builds the +Z face with u increasing along +x and the -Z face with u
 * increasing along -x, and the left page is additionally mirrored by its own
 * half-turn — the two cancel, so u always runs left-to-right on screen and the
 * left page simply occupies negative x.
 *
 * @param rect  {x,y,w,h} in canvas pixels, as returned by paintFace
 * @param sheetIndex  which sheet the face belongs to
 * @param page  the sheet the album is currently open at
 */
export function focusBoxFor(rect, sheetIndex, page, hingeX = 0) {
  const opened = sheetIndex < page

  const u0 = rect.x / FACE_W
  const u1 = (rect.x + rect.w) / FACE_W
  // Canvas y runs downward; world y runs up.
  const v0 = 1 - (rect.y + rect.h) / FACE_H
  const v1 = 1 - rect.y / FACE_H

  const toWorldX = (u) => hingeX + (opened ? -(1 - u) * PAGE_WIDTH : u * PAGE_WIDTH)

  const x0 = toWorldX(u0)
  const x1 = toWorldX(u1)

  return {
    x: (x0 + x1) / 2,
    y: ((v0 + v1) / 2 - 0.5) * PAGE_HEIGHT,
    w: Math.abs(x1 - x0),
    h: (v1 - v0) * PAGE_HEIGHT,
    hingeX,
  }
}
