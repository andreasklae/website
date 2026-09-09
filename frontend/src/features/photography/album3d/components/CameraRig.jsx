import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import { MathUtils, Vector3 } from 'three'
import { MODES, SIDES, useAlbumStore } from '../lib/store'
import { LEAN_DISTANCE, anchoredTarget } from '../lib/focus'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'
import { TURNED_X } from './AlbumBook'

// One place decides where the camera is. Each mode names the box it has to
// frame; the distance is then solved from the live canvas aspect, so nothing
// is ever cropped — on a short desktop window or a tall phone.
const lookTarget = new Vector3()

/** Distance at which a w x h box exactly fills the frame, with padding. */
function fitDistance(fov, aspect, [w, h], pad) {
  const vFov = MathUtils.degToRad(fov)
  const forHeight = (h * pad) / 2 / Math.tan(vFov / 2)
  const forWidth = (w * pad) / 2 / (Math.tan(vFov / 2) * aspect)
  return Math.max(forHeight, forWidth)
}

/**
 * The box and look-at point for the current mode.
 *
 * The open-album case is the one that matters on a phone: a two-page spread is
 * ~2.7 units wide, which on a portrait screen would be framed so small the
 * photographs are unreadable. Narrow viewports therefore frame a single page
 * and step through them one at a time.
 */
function shotFor(mode, { narrow, side, shelfWidth, closedSide, planeZ, activeX, hoveredX }) {
  // Leaning in on a hovered photograph. Padded well past the photo's own edges
  // so this reads as moving closer to the page, not as replacing it.
  switch (mode) {
    case MODES.COVER:
      return {
        box: [PAGE_WIDTH * 1.14, PAGE_HEIGHT * 1.1],
        // A shut album lies wholly to one side of its binding, so the cover's
        // middle is half a page off the hinge. The camera moves to meet it
        // rather than the book sliding to meet the camera.
        // The cover's own middle: half a page along from the hinge.
        target: [activeX + TURNED_X + PAGE_WIDTH / 2, 0, planeZ],
        height: 0.02,
        pad: 1.16,
      }
    case MODES.OPEN:
    case MODES.ZOOM: {
      // Still shut: the cover lies wholly to one side of the binding.
      if (closedSide) {
        return {
          box: [PAGE_WIDTH * 1.14, PAGE_HEIGHT * 1.1],
          target: [activeX + TURNED_X + closedSide * (PAGE_WIDTH / 2), 0, planeZ],
          height: 0.02,
          pad: 1.16,
        }
      }
      if (narrow) {
        const x = TURNED_X + (side === SIDES.RIGHT ? PAGE_WIDTH / 2 : -PAGE_WIDTH / 2)
        return {
          box: [PAGE_WIDTH * 1.1, PAGE_HEIGHT * 1.06],
          target: [activeX + x, -0.02, planeZ],
          height: 0.18,
          pad: 1.1,
        }
      }
      return {
        box: [PAGE_WIDTH * 2.12, PAGE_HEIGHT * 1.06],
        target: [activeX + TURNED_X, -0.05, planeZ],
        // Below the spread looking slightly up: from above, an open album
        // reads as being looked down on rather than held.
        height: mode === MODES.ZOOM ? -0.16 : -0.34,
        pad: mode === MODES.ZOOM ? 1.04 : 1.12,
      }
    }
    default:
      // Resting on an album draws the camera along the row toward it and in a
      // little, so you are looking at that book rather than at the shelf.
      const leaning = hoveredX != null
      const lean = leaning ? SHELF_VIEW.lean : 0
      return {
        box: [
          (shelfWidth + 0.35) * (1 - lean * SHELF_VIEW.closeIn),
          PAGE_HEIGHT * 1.42 * (1 - lean * SHELF_VIEW.closeIn),
        ],
        target: [
          SHELF_VIEW.lookX + (leaning ? (hoveredX - SHELF_VIEW.lookX) * lean : 0),
          SHELF_VIEW.lookY,
          0,
        ],
        // Near enough level with the books: from above you look down onto the
        // shelf board rather than along the row.
        height: -0.02,
        // Loose enough to take in the lamp and some of the room, not just
        // the bay — the lamp has a cord you are meant to be able to reach.
        pad: 1.32,
        offsetX: SHELF_VIEW.offsetX * (1 - lean * 0.35),
      }
  }
}

/** How far in the camera goes when leaning on a photograph. */
function leanDistance(shot, focus, fov, aspect) {
  const resting = fitDistance(fov, aspect, shot.box, shot.pad)
  const closeUp = fitDistance(fov, aspect, [focus.box.w, focus.box.h], 1.08)
  return resting + (closeUp - resting) * LEAN_DISTANCE
}

/** How far the shelf drifts with the pointer, as a share of what is on screen. */
const SHELF_PARALLAX = { x: 0.3, y: 0.12 }

/**
 * How far to the right of the shelf the camera stands, and how far the row is
 * off the middle of the bay. Straight on you see nothing but spines; from the
 * side the front board of whichever album has turned to look at you is
 * readable, which is the point of the hover.
 */
const SHELF_VIEW = {
  offsetX: 2.35,
  // Looking to the right of the case puts it over on the left of the frame,
  // which leaves the right-hand side to the lamp and the room.
  lookX: 0.92,
  // Looking above it drops it down the frame, clear of the navbar and clear of
  // a book that has been lifted out.
  lookY: 0.62,
  lean: 0.42,
  closeIn: 0.2,
}

export default function CameraRig({ shelfWidth = 1.4 }) {
  const mode = useAlbumStore((s) => s.mode)
  const narrow = useAlbumStore((s) => s.narrow)
  const side = useAlbumStore((s) => s.side)
  const focus = useAlbumStore((s) => s.focus)
  const page = useAlbumStore((s) => s.page)
  const planeZ = useAlbumStore((s) => s.planeZ)
  const activeX = useAlbumStore((s) => s.activeX)
  const hoveredX = useAlbumStore((s) => s.hoveredX)
  const { camera, size, pointer } = useThree()
  const current = useRef(new Vector3(0, 0, 0))
  // Kept across frames so the lean eases from the resting distance.
  const dist = useRef({ value: 4 }).current

  useFrame((_, delta) => {
    // 1 while the album is still shut, 0 once it is open. There is no shut-at-
    // the-back case any more: reading stops at the last spread, so the album
    // never closes against its own back board — and treating the last spread
    // as "shut" put the camera on the left-hand page instead of the middle.
    const closedSide = page === 0 ? 1 : 0
    const shot = shotFor(mode, { narrow, side, shelfWidth, closedSide, planeZ, activeX, hoveredX })
    const aspect = size.width / Math.max(size.height, 1)
    const leaning = focus && (mode === MODES.OPEN || mode === MODES.ZOOM)

    if (leaning) {
      // Ease the distance, then solve the look-at from wherever it has got to,
      // so the anchored spot stays under the pointer throughout the move and
      // not merely once it settles.
      easing.damp(dist, 'value', leanDistance(shot, focus, camera.fov, aspect), 0.3, delta)
      const halfH = dist.value * Math.tan(MathUtils.degToRad(camera.fov) / 2)
      const halfW = halfH * aspect
      const { x, y } = anchoredTarget(focus, halfW, halfH)

      // Square on to the page while leaning: an anchored zoom only holds if
      // the camera is looking straight down its own axis.
      easing.damp3(camera.position, [x, y, focus.z + dist.value], 0.18, delta)
      easing.damp3(current.current, [x, y, focus.z], 0.18, delta)
    } else {
      const distance = fitDistance(camera.fov, aspect, shot.box, shot.pad)
      dist.value = distance

      // On the shelf the camera drifts with the pointer, which lets you look
      // along the row and gives the books some parallax against each other.
      const drift = mode === MODES.SHELF
        ? [pointer.x * SHELF_PARALLAX.x, pointer.y * SHELF_PARALLAX.y]
        : [0, 0]

      easing.damp3(
        camera.position,
        [
          shot.target[0] + (shot.offsetX ?? 0) + drift[0],
          shot.height + drift[1],
          distance + shot.target[2],
        ],
        0.45,
        delta
      )
      easing.damp3(current.current, [shot.target[0] + drift[0] * 0.35, shot.target[1] + drift[1] * 0.35, shot.target[2]], 0.45, delta)
    }

    lookTarget.copy(current.current)
    camera.lookAt(lookTarget)
  })

  return null
}
