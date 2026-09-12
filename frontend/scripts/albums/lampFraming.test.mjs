// The lamp has to be IN the shot, and its cord has to be reachable.
//
// This cannot be checked from a screenshot. In a headless browser the page
// reports itself hidden, requestAnimationFrame never fires, and only a single
// frame renders — so the camera is always caught part-way through easing
// toward its shot and is never where it will actually settle. Every framing
// judgement made from such a screenshot is a judgement of a half-eased camera,
// which is how the lamp was placed by eye twice and wrongly both times.
//
// So it is solved instead: the real shot maths and the real lamp pose are
// imported, a real three.js camera is put where the rig will put it, and the
// lamp's extremities are projected through it.

import test from 'node:test'
import assert from 'node:assert/strict'
import { PerspectiveCamera, Vector3 } from 'three'
import { cameraPose, shelfShot } from '../../src/features/photography/album3d/lib/shelfView.js'
import { LAMP_EXTENT, LAMP_Y, LAMP_Z, lampX } from '../../src/features/photography/album3d/lib/lampPose.js'
import { PAGE_HEIGHT } from '../../src/features/photography/album3d/lib/dimensions.js'

const FOV = 30
const BAY_H = PAGE_HEIGHT * 1.42
const SLIDE_ROOM = 1.15

// 16:9, a laptop window, and the narrowest the scene still frames the row at.
const ASPECTS = [16 / 9, 2.1, 1.3]

/** Normalised device coordinates of a world point in the settled shelf shot. */
function project(point, aspect, { shelfWidth, booksRight }) {
  const shot = shelfShot({ shelfWidth, bayHeight: BAY_H })
  const pose = cameraPose(shot, FOV, aspect)

  const camera = new PerspectiveCamera(FOV, aspect, 0.1, 40)
  camera.position.set(...pose.position)
  camera.lookAt(new Vector3(...pose.lookAt))
  camera.updateMatrixWorld(true)
  camera.updateProjectionMatrix()

  const x = lampX(booksRight, SLIDE_ROOM)
  return new Vector3(point[0] + x, point[1] + LAMP_Y, point[2] + LAMP_Z).project(camera)
}

// A representative row: five albums a little over a page wide in total.
const SHELF = { booksRight: 0.62, shelfWidth: 0.62 - -0.62 + SLIDE_ROOM }

test('the whole lamp is in frame at every aspect the page is read at', () => {
  for (const aspect of ASPECTS) {
    for (const [name, point] of Object.entries(LAMP_EXTENT)) {
      const ndc = project(point, aspect, SHELF)
      assert.ok(
        Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1,
        `${name} is off screen at aspect ${aspect.toFixed(2)}: ndc ${ndc.x.toFixed(2)}, ${ndc.y.toFixed(2)}`
      )
    }
  }
})

test('the cord bead clears the navbar floating over the top of the page', () => {
  // The header occupies roughly the top eighth of the viewport. A pull cord
  // underneath it cannot be clicked.
  for (const aspect of ASPECTS) {
    const ndc = project(LAMP_EXTENT.bead, aspect, SHELF)
    assert.ok(ndc.y < 0.72, `bead sits under the navbar at aspect ${aspect.toFixed(2)}: y ${ndc.y.toFixed(2)}`)
  }
})

test('the lamp hangs clear of the bookcase, not in front of the bay', () => {
  const x = lampX(SHELF.booksRight, SLIDE_ROOM)
  const bayRight = SHELF.booksRight + SLIDE_ROOM + 0.075
  assert.ok(
    x - LAMP_EXTENT.shadeLeft[0] * -1 > bayRight,
    `the shade overlaps the case: left edge ${(x - 0.33).toFixed(2)} vs bay ${bayRight.toFixed(2)}`
  )
})
