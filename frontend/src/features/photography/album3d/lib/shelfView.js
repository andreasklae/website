// Where the camera stands when it is looking at the shelf.
//
// Pulled out of the rig so it can be reasoned about outside a running canvas.
// Framing cannot be judged from a screenshot in a headless browser: only one
// frame renders, so the camera is always caught part-way through easing toward
// its shot and is never where it will actually settle. Anything that has to
// be IN that shot — the lamp, and the cord you are meant to be able to pull —
// is therefore checked by projecting through a real camera at the settled
// position, which means this maths has to live somewhere importable.

import { MathUtils } from 'three'

/**
 * How far to the right of the shelf the camera stands, and how far the row is
 * off the middle of the bay. Straight on you see nothing but spines; from the
 * side the front board of whichever album has turned to look at you is
 * readable, which is the point of the hover.
 */
export const SHELF_VIEW = {
  offsetX: 2.35,
  // Looking to the right of the case puts it over on the left of the frame,
  // which leaves the right-hand side to the lamp and the room.
  lookX: 0.92,
  // Looking above it drops it down the frame, clear of the navbar and clear of
  // a book that has been lifted out.
  lookY: 0.62,
  lean: 0.42,
  closeIn: 0.2,
  // Loose enough to take in the lamp and some of the room, not just the bay.
  pad: 1.32,
  // Near enough level with the books: from above you look down onto the shelf
  // board rather than along the row.
  height: -0.02,
}

/** Distance at which a w x h box exactly fills the frame, with padding. */
export function fitDistance(fov, aspect, [w, h], pad) {
  const vFov = MathUtils.degToRad(fov)
  const forHeight = (h * pad) / 2 / Math.tan(vFov / 2)
  const forWidth = (w * pad) / 2 / (Math.tan(vFov / 2) * aspect)
  return Math.max(forHeight, forWidth)
}

/**
 * The shelf shot. Resting on an album draws the camera along the row toward it
 * and in a little, so you are looking at that book rather than at the shelf.
 */
export function shelfShot({ shelfWidth, hoveredX = null, bayHeight }) {
  const leaning = hoveredX != null
  const lean = leaning ? SHELF_VIEW.lean : 0
  return {
    box: [
      (shelfWidth + 0.35) * (1 - lean * SHELF_VIEW.closeIn),
      bayHeight * (1 - lean * SHELF_VIEW.closeIn),
    ],
    target: [
      SHELF_VIEW.lookX + (leaning ? (hoveredX - SHELF_VIEW.lookX) * lean : 0),
      SHELF_VIEW.lookY,
      0,
    ],
    height: SHELF_VIEW.height,
    pad: SHELF_VIEW.pad,
    offsetX: SHELF_VIEW.offsetX * (1 - lean * 0.35),
  }
}

/** Where the camera ends up, and what it looks at, for a given shot. */
export function cameraPose(shot, fov, aspect) {
  const distance = fitDistance(fov, aspect, shot.box, shot.pad)
  return {
    position: [shot.target[0] + (shot.offsetX ?? 0), shot.height, distance + shot.target[2]],
    lookAt: shot.target,
    distance,
  }
}
