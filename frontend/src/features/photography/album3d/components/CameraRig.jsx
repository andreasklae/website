import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import { MathUtils, Vector3 } from 'three'
import { MODES, useAlbumStore } from '../lib/store'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'

// One place decides where the camera is. Each mode names the box it has to
// frame and where to look; the distance is then solved from the live canvas
// aspect, so nothing is ever cropped on a short window or a phone.
const SHOTS = {
  [MODES.SHELF]:   { height: 0.10, target: [0, -0.02, 0],   box: null, pad: 1.18 },
  [MODES.PULLING]: { height: 0.10, target: [0, 0, 0.30],    box: null, pad: 1.18 },
  [MODES.COVER]:   { height: 0.02, target: [0, 0, 0.55],    box: [PAGE_WIDTH * 1.15, PAGE_HEIGHT * 1.1], pad: 1.16 },
  [MODES.OPEN]:    { height: 0.75, target: [0, -0.05, 0],   box: [PAGE_WIDTH * 2.1, PAGE_HEIGHT * 1.05], pad: 1.12 },
  [MODES.ZOOM]:    { height: 0.30, target: [0, 0, 0.30],    box: [PAGE_WIDTH * 1.9, PAGE_HEIGHT * 1.15], pad: 1.10 },
}

const lookTarget = new Vector3()

/** Distance at which a w x h box exactly fills the frame, with padding. */
function fitDistance(camera, aspect, [w, h], pad) {
  const vFov = MathUtils.degToRad(camera.fov)
  const forHeight = (h * pad) / 2 / Math.tan(vFov / 2)
  const forWidth = (w * pad) / 2 / (Math.tan(vFov / 2) * aspect)
  return Math.max(forHeight, forWidth)
}

export default function CameraRig({ shelfWidth = 1.4 }) {
  const mode = useAlbumStore((s) => s.mode)
  const { camera, size } = useThree()
  const current = useRef(new Vector3(0, 0, 0))

  useFrame((_, delta) => {
    const shot = SHOTS[mode] || SHOTS[MODES.SHELF]
    const aspect = size.width / Math.max(size.height, 1)
    const box = shot.box || [shelfWidth + 0.35, PAGE_HEIGHT * 1.14]
    const distance = fitDistance(camera, aspect, box, shot.pad)

    easing.damp3(camera.position, [0, shot.height, distance + shot.target[2]], 0.42, delta)
    easing.damp3(current.current, shot.target, 0.42, delta)
    lookTarget.copy(current.current)
    camera.lookAt(lookTarget)
  })

  return null
}
