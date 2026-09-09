// Maps a hit on a page face back into world space, so the camera can move in
// on the thing under the cursor rather than swapping it for an overlay.

import { FACE_W, FACE_H } from './faceCanvas'

export const PAGE_WIDTH = 1.28
export const PAGE_HEIGHT = 1.71

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
