import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import { MathUtils, Vector3 } from 'three'
import { MODES, SIDES, useAlbumStore } from '../lib/store'
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
function shotFor(mode, { narrow, side, shelfWidth, focus }) {
  // Leaning in on a hovered photograph. Padded well past the photo's own edges
  // so this reads as moving closer to the page, not as replacing it.
  if (focus && (mode === MODES.OPEN || mode === MODES.ZOOM)) {
    return {
      box: [focus.w, focus.h],
      target: [focus.x, focus.y, PAGE_WIDTH * 0.5],
      // Level with the photograph, so leaning in also straightens the view.
      height: focus.y,
      pad: 1.45,
    }
  }

  switch (mode) {
    case MODES.COVER:
      return {
        box: [PAGE_WIDTH * 1.14, PAGE_HEIGHT * 1.1],
        target: [0, 0, PAGE_WIDTH * 0.16],
        height: 0.02,
        pad: 1.16,
      }
    case MODES.OPEN:
    case MODES.ZOOM: {
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

export default function CameraRig({ shelfWidth = 1.4 }) {
  const mode = useAlbumStore((s) => s.mode)
  const narrow = useAlbumStore((s) => s.narrow)
  const side = useAlbumStore((s) => s.side)
  const focus = useAlbumStore((s) => s.focus)
  const { camera, size } = useThree()
  const current = useRef(new Vector3(0, 0, 0))

  useFrame((_, delta) => {
    const shot = shotFor(mode, { narrow, side, shelfWidth, focus })
    const aspect = size.width / Math.max(size.height, 1)
    const distance = fitDistance(camera.fov, aspect, shot.box, shot.pad)

    // Leaning in is quicker than pulling back out, which keeps hovering
    // responsive without the camera feeling twitchy when the cursor leaves.
    const smooth = focus ? 0.3 : 0.45

    easing.damp3(
      camera.position,
      [shot.target[0], shot.height, distance + shot.target[2]],
      smooth,
      delta
    )
    easing.damp3(current.current, shot.target, smooth, delta)
    lookTarget.copy(current.current)
    camera.lookAt(lookTarget)
  })

  return null
}
