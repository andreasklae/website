// The tapestry has to cover the wall the camera can actually see.
//
// It did not, and the reason is worth keeping a test for: the shelf shot
// frames the row by WIDTH, so a narrow window drives the camera backwards
// until the row fits across it — and a portrait phone therefore sees roughly
// three times as much wall vertically as a laptop does. A hanging sized
// against a 16:9 window falls off the top and bottom of a phone, which is
// exactly what shipped.

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three'
import { ZOOM, cameraPose, shelfShot } from '../../src/features/photography/album3d/lib/shelfView.js'
import { depthFor } from '../../src/features/photography/album3d/lib/albumDepth.js'
import { panelRect, roomWidth } from '../../src/features/photography/album3d/lib/wallPanel.js'
import { CASE_BACK_Z, CEILING_Y, FLOOR_Y, PANEL_Z, ROOM_DEPTH, SLIDE_ROOM } from '../../src/features/photography/album3d/lib/room.js'
import { PAGE_HEIGHT } from '../../src/features/photography/album3d/lib/dimensions.js'

const FOV = 30
const BAY_H = PAGE_HEIGHT * 1.42
const SHELF_GAP = 0.004

/** The real row, from the real album list and the real thicknesses. */
function shelf() {
  const raw = JSON.parse(readFileSync(new URL('../../public/content/albums/shelf.json', import.meta.url), 'utf8'))
  const list = Array.isArray(raw) ? raw : (raw.albums ?? raw.shelf)
  const thicknesses = list.map((a) => depthFor(typeof a === 'string' ? a : a.id))
  const total = thicknesses.reduce((n, t) => n + t, 0) + SHELF_GAP * (thicknesses.length - 1)
  const interiorLeft = -total / 2 - 0.02
  const interiorRight = total / 2 + SLIDE_ROOM
  return {
    total,
    interiorW: interiorRight - interiorLeft,
    midX: (interiorLeft + interiorRight) / 2,
  }
}

/** The rectangle of wall inside the frame, at the tapestry's depth. */
function seenWall(aspect, { total }, zoom) {
  const pose = cameraPose(shelfShot({ shelfWidth: total + SLIDE_ROOM, bayHeight: BAY_H }), FOV, aspect, zoom)
  const camera = new PerspectiveCamera(FOV, aspect, 0.1, 60)
  camera.position.set(...pose.position)
  camera.lookAt(new Vector3(...pose.lookAt))
  camera.updateMatrixWorld(true)
  camera.updateProjectionMatrix()

  const ray = new Raycaster()
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([nx, ny]) => {
    ray.setFromCamera(new Vector2(nx, ny), camera)
    const t = (PANEL_Z - ray.ray.origin.z) / ray.ray.direction.z
    return ray.ray.origin.clone().addScaledVector(ray.ray.direction, t)
  })
  const xs = corners.map((c) => c.x)
  const ys = corners.map((c) => c.y)
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}

// A tall phone through an ultrawide desktop.
const ASPECTS = []
for (let a = 0.4; a <= 3.0001; a += 0.05) ASPECTS.push(a)

test('no bare wall shows around the tapestry, at any viewport or zoom', () => {
  const bay = shelf()
  const panel = panelRect(bay.midX)
  // Zoomed right out is the case that matters: that is when the most wall is
  // in frame.
  for (const aspect of ASPECTS) {
    for (const zoom of [ZOOM.min, ZOOM.start, ZOOM.max]) {
      const seen = seenWall(aspect, bay, zoom)
      assert.ok(
        seen.x0 >= panel.x0 && seen.x1 <= panel.x1 && seen.y0 >= panel.y0 && seen.y1 <= panel.y1,
        `aspect ${aspect.toFixed(2)} zoom ${zoom} sees wall ` +
        `x ${seen.x0.toFixed(2)}..${seen.x1.toFixed(2)} y ${seen.y0.toFixed(2)}..${seen.y1.toFixed(2)}, ` +
        `outside the panel x ${panel.x0.toFixed(2)}..${panel.x1.toFixed(2)} ` +
        `y ${panel.y0.toFixed(2)}..${panel.y1.toFixed(2)}`
      )
    }
  }
})

test('the camera stays inside the room at every zoom and viewport', () => {
  const bay = shelf()
  for (const aspect of ASPECTS) {
    for (const zoom of [ZOOM.min, ZOOM.start, ZOOM.max]) {
      const pose = cameraPose(shelfShot({ shelfWidth: bay.total + SLIDE_ROOM, bayHeight: BAY_H }), FOV, aspect, zoom)
      const z = pose.position[2]
      assert.ok(z < CASE_BACK_Z + ROOM_DEPTH, `camera at z ${z.toFixed(1)} is outside the room`)
      assert.ok(pose.position[1] > FLOOR_Y && pose.position[1] < CEILING_Y, 'camera is through the floor or ceiling')
    }
  }
})

test('the room is wider than the hanging on it', () => {
  const bay = shelf()
  const panel = panelRect(bay.midX)
  const width = roomWidth(bay.interiorW)
  assert.ok(width >= panel.width + 4, `room ${width.toFixed(1)} vs panel ${panel.width}`)
  assert.ok(bay.midX - width / 2 <= panel.x0, 'the hanging runs off the left of the wall')
  assert.ok(bay.midX + width / 2 >= panel.x1, 'the hanging runs off the right of the wall')
})

test('the tapestry keeps its own proportions', () => {
  const panel = panelRect(shelf().midX)
  assert.ok(Math.abs(panel.width / panel.height - 2000 / 811) < 1e-9, 'the image is being stretched')
})

test('the tapestry runs the full height of the wall', () => {
  const panel = panelRect(shelf().midX)
  assert.equal(panel.y0, FLOOR_Y)
  assert.equal(panel.y1, CEILING_Y)
})
