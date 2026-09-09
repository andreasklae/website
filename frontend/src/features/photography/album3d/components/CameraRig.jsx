import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import { MathUtils, Vector3 } from 'three'
import { MODES, SIDES, useAlbumStore } from '../lib/store'
import { LEAN_DISTANCE, anchoredTarget } from '../lib/focus'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'

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
function shotFor(mode, { narrow, side, shelfWidth, closedSide }) {
  // Leaning in on a hovered photograph. Padded well past the photo's own edges
  // so this reads as moving closer to the page, not as replacing it.
  switch (mode) {
    case MODES.COVER:
      return {
        box: [PAGE_WIDTH * 1.14, PAGE_HEIGHT * 1.1],
        // A shut album lies wholly to one side of its binding, so the cover's
        // middle is half a page off the hinge. The camera moves to meet it
        // rather than the book sliding to meet the camera.
        target: [PAGE_WIDTH / 2, 0, PAGE_WIDTH * 0.16],
        height: 0.02,
        pad: 1.16,
      }
    case MODES.OPEN:
    case MODES.ZOOM: {
      // Read right through to the back and the album is shut again, lying on
      // the other side of its binding.
      if (closedSide) {
        return {
          box: [PAGE_WIDTH * 1.14, PAGE_HEIGHT * 1.1],
          target: [closedSide * (PAGE_WIDTH / 2), 0, PAGE_WIDTH * 0.5],
          height: 0.02,
          pad: 1.16,
        }
      }
      if (narrow) {
        const x = side === SIDES.RIGHT ? PAGE_WIDTH / 2 : -PAGE_WIDTH / 2
        return {
          box: [PAGE_WIDTH * 1.1, PAGE_HEIGHT * 1.06],
          target: [x, -0.02, PAGE_WIDTH * 0.5],
          height: 0.18,
          pad: 1.1,
        }
      }
      return {
        box: [PAGE_WIDTH * 2.12, PAGE_HEIGHT * 1.06],
        target: [0, -0.05, PAGE_WIDTH * 0.5],
        height: mode === MODES.ZOOM ? 0.3 : 0.7,
        pad: mode === MODES.ZOOM ? 1.04 : 1.12,
      }
    }
    default:
      return {
        box: [shelfWidth + 0.35, PAGE_HEIGHT * 1.14],
        target: [0, -0.02, 0],
        height: 0.1,
        pad: 1.18,
      }
  }
}

/** How far in the camera goes when leaning on a photograph. */
function leanDistance(shot, focus, fov, aspect) {
  const resting = fitDistance(fov, aspect, shot.box, shot.pad)
  const closeUp = fitDistance(fov, aspect, [focus.box.w, focus.box.h], 1.08)
  return resting + (closeUp - resting) * LEAN_DISTANCE
}

export default function CameraRig({ shelfWidth = 1.4 }) {
  const mode = useAlbumStore((s) => s.mode)
  const narrow = useAlbumStore((s) => s.narrow)
  const side = useAlbumStore((s) => s.side)
  const focus = useAlbumStore((s) => s.focus)
  const page = useAlbumStore((s) => s.page)
  const sheetCount = useAlbumStore((s) => s.album?.sheets.length ?? 0)
  const { camera, size } = useThree()
  const current = useRef(new Vector3(0, 0, 0))
  // Kept across frames so the lean eases from the resting distance.
  const dist = useRef({ value: 4 }).current

  useFrame((_, delta) => {
    // +1 shut at the front, -1 shut at the back, 0 open somewhere in between.
    const closedSide = page === 0 ? 1 : sheetCount && page === sheetCount ? -1 : 0
    const shot = shotFor(mode, { narrow, side, shelfWidth, closedSide })
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
      easing.damp3(camera.position, [shot.target[0], shot.height, distance + shot.target[2]], 0.45, delta)
      easing.damp3(current.current, shot.target, 0.45, delta)
    }

    lookTarget.copy(current.current)
    camera.lookAt(lookTarget)
  })

  return null
}
