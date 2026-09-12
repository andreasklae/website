// Where the lamp hangs.
//
// Separate from the component so the framing can be checked outside a running
// canvas. A screenshot cannot settle this: in a headless browser only one
// frame renders, so the camera is caught part-way through easing toward its
// shot and never reaches it — which is how the lamp came to be placed twice
// by eye, wrongly in both directions. The position is solved instead, by
// projecting these points through a real camera at the settled shot.

import { PAGE_HEIGHT, PAGE_WIDTH } from './dimensions.js'

/**
 * How high the fitting hangs. As high as it can go while the bead on the end
 * of the cord — the thing you have to be able to hit with a pointer — stays
 * inside the frame at every aspect ratio the page is read at.
 */
export const LAMP_Y = PAGE_HEIGHT * 0.42

/** How far forward of the spines it hangs, so it is beside the case not in it. */
export const LAMP_Z = PAGE_WIDTH * 1.3

/** Clear of the case's right-hand upright, measured from the books' right edge. */
export const LAMP_CLEARANCE = 0.85

/** Length of the pull cord hanging from the shade. */
export const CORD_LEN = 0.42

/** Radius of the glass dome. */
export const SHADE_RADIUS = 0.33

/** The points that have to stay in frame, relative to the fitting's origin. */
export const LAMP_EXTENT = {
  shadeTop: [0, 0.1 + SHADE_RADIUS * 0.55, 0],
  shadeLeft: [-SHADE_RADIUS, 0.1, 0],
  shadeRight: [SHADE_RADIUS, 0.1, 0],
  bead: [0.055, -CORD_LEN, 0],
}

export const lampX = (booksRight, slideRoom) => booksRight + slideRoom + LAMP_CLEARANCE
