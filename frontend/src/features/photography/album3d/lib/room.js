// The room's real dimensions.
//
// Everything here is derived from one decision — how big an album actually is
// — so the room is a room rather than a backdrop sized by eye. A photograph
// album of this shape stands about 32 cm tall, which fixes the scale of the
// scene; the ceiling, the height of the shelf off the floor and the tapestry
// hanging on the wall all follow from it.
//
// Plain data in a plain module, so the tests can check the framing against the
// same numbers the scene is built from.

import { PAGE_HEIGHT, PAGE_WIDTH } from './dimensions.js'

/** Scene units in a metre, from the album's own height. */
export const METRE = PAGE_HEIGHT / 0.32

/** Where the books stand: the bay's floor. */
export const SHELF_FLOOR_Y = -PAGE_HEIGHT / 2

/** A comfortable height to read a shelf at. */
export const SHELF_ABOVE_FLOOR = 0.95 * METRE

export const FLOOR_Y = SHELF_FLOOR_Y - SHELF_ABOVE_FLOOR
export const CEILING_HEIGHT = 2.7 * METRE
export const CEILING_Y = FLOOR_Y + CEILING_HEIGHT

/** How tall the bookcase stands. */
export const CASE_HEIGHT = 2.0 * METRE
export const CASE_TOP_Y = FLOOR_Y + CASE_HEIGHT

/** Thickness of the case's boards. */
export const BOARD = 0.075

/** Headroom enough for an album to be lifted and turned inside the bay. */
export const BAY_HEIGHT = PAGE_HEIGHT * 1.42

/** Room for the row to slide sideways when an album is picked out. */
export const SLIDE_ROOM = 1.15

const SPINE_Z = -PAGE_WIDTH / 2
export const CASE_FRONT_Z = SPINE_Z + 0.16
export const CASE_BACK_Z = SPINE_Z - PAGE_WIDTH - 0.1

/** The wall behind the case, and the hanging a hair in front of it. */
export const WALL_Z = CASE_BACK_Z - 0.14
export const PANEL_Z = WALL_Z + 0.07

/**
 * How deep the room runs forward. The camera backs away from the shelf until
 * the row fits ACROSS the frame, so a tall phone puts it four times as far out
 * as a laptop does — and if the room ends short of that, the viewer is stood
 * outside their own walls.
 */
export const ROOM_DEPTH = 34

/**
 * Where the case's boards sit: a plinth at the bottom, the album bay, and
 * ordinary shelves filling what is left above and below it.
 */
export function shelfBoards() {
  const bayBottom = SHELF_FLOOR_Y - BOARD / 2
  const bayTop = SHELF_FLOOR_Y + BAY_HEIGHT + BOARD / 2
  const plinth = FLOOR_Y + BOARD / 2

  // Two shelves between the plinth and the bay, evenly spaced.
  const below = []
  const gap = (bayBottom - plinth) / 3
  for (let i = 1; i <= 2; i++) below.push(plinth + gap * i)

  const top = CASE_TOP_Y - BOARD / 2
  // One more between the bay and the top, if there is room for a book.
  const above = top - bayTop > BAY_HEIGHT * 0.6 ? [(bayTop + top) / 2] : []

  return [plinth, ...below, bayBottom, bayTop, ...above, top]
}
