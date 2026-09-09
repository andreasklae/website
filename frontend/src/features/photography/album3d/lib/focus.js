// Maps a hit on a page face back into world space, so the camera can move in
// on the thing under the cursor rather than swapping it for an overlay.

import { FACE_W, FACE_H } from './faceCanvas'

export const PAGE_WIDTH = 1.28
export const PAGE_HEIGHT = 1.71

/** World-space point on the open album for a face UV. */
export function worldPointFor(u, v, sheetIndex, page) {
  const opened = sheetIndex < page
  return {
    x: opened ? -(1 - u) * PAGE_WIDTH : u * PAGE_WIDTH,
    y: (v - 0.5) * PAGE_HEIGHT,
  }
}

/**
 * How far the view may slide across a photograph, as a fraction of its
 * half-size. This is ALSO the feedback gain of the hover loop — the world
 * point under a stationary cursor moves with the camera one-for-one — so it
 * must stay below 1 for the framing to converge rather than run away.
 */
export const LEAN_PAN = 0.4

/**
 * How much of the way from the spread to a full-photo close-up the camera
 * actually travels. Fitting a photograph exactly is a ~60% cut in distance,
 * which reads as a jump rather than a lean, so only a fraction of it is taken.
 */
export const LEAN_DISTANCE = 0.3

/** How far the camera slides toward the photograph it is leaning on. */
export const LEAN_RECENTRE = 0.62

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

/**
 * Where the camera should look while the cursor rests at `point` inside the
 * photograph `box`. Returns the photograph's own size unchanged — how far to
 * actually move in is CameraRig's decision, via LEAN_DISTANCE.
 *
 * The camera does NOT centre on the cursor. Centring is divergent: moving the
 * camera moves the world point under a stationary cursor by the same amount,
 * so the target runs away and the photo slides out from under the pointer —
 * which is the oscillation this replaces.
 *
 * Instead the pan is proportional. The cursor's position within the photo,
 * as a fraction, maps onto a pan range of (1 - LEAN_VIEW) of the photo. The
 * loop gain is therefore (1 - LEAN_VIEW) < 1, so it converges on a steady
 * framing instead of drifting, while still letting the pointer reach every
 * corner of the photograph.
 */
export function leanTarget(box, point) {
  const relX = clamp((point.x - box.x) / (box.w / 2 || 1), -1, 1)
  const relY = clamp((point.y - box.y) / (box.h / 2 || 1), -1, 1)
  return {
    x: box.x + (relX * box.w * LEAN_PAN) / 2,
    y: box.y + (relY * box.h * LEAN_PAN) / 2,
    w: box.w,
    h: box.h,
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
export function focusBoxFor(rect, sheetIndex, page) {
  const opened = sheetIndex < page

  const u0 = rect.x / FACE_W
  const u1 = (rect.x + rect.w) / FACE_W
  // Canvas y runs downward; world y runs up.
  const v0 = 1 - (rect.y + rect.h) / FACE_H
  const v1 = 1 - rect.y / FACE_H

  const toWorldX = (u) => (opened ? -(1 - u) * PAGE_WIDTH : u * PAGE_WIDTH)

  const x0 = toWorldX(u0)
  const x1 = toWorldX(u1)

  return {
    x: (x0 + x1) / 2,
    y: ((v0 + v1) / 2 - 0.5) * PAGE_HEIGHT,
    w: Math.abs(x1 - x0),
    h: (v1 - v0) * PAGE_HEIGHT,
  }
}
