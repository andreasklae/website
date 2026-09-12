// How big the tapestry on the back wall has to be.
//
// It runs the full height of the wall, floor to ceiling, which is how a
// verdure hanging of this kind was actually used — and it settles a problem
// that sizing by eye did not: the shelf shot frames the bay by WIDTH, so a
// narrow window drives the camera backwards until the row fits across it, and
// a portrait phone therefore sees roughly three times as much wall vertically
// as a laptop does. A hanging sized against a 16:9 window falls off the top
// and bottom of a phone.

import { CEILING_HEIGHT, CEILING_Y, FLOOR_Y } from './room.js'

/** The supplied tapestry's own proportions; it is never stretched. */
export const TAPESTRY_ASPECT = 2000 / 811

/**
 * Where it hangs across the wall. The camera stands to the right of the case
 * and looks back across it, so what it can see of the wall sits well to the
 * left of the bay's own centre.
 */
export const PANEL_OFFSET_X = -2.5

/** Floor to ceiling, at the image's own proportions. */
export function panelRect(midX) {
  const height = CEILING_HEIGHT
  const width = height * TAPESTRY_ASPECT
  const cx = midX + PANEL_OFFSET_X
  const cy = (FLOOR_Y + CEILING_Y) / 2
  return {
    width,
    height,
    cx,
    cy,
    x0: cx - width / 2,
    x1: cx + width / 2,
    y0: FLOOR_Y,
    y1: CEILING_Y,
  }
}

/** The room has to be at least big enough to hold the hanging. */
export const roomWidth = (interiorW) =>
  Math.max(interiorW + 16, panelRect(0).width + 6)
