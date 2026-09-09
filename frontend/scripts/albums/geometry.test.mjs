// node --test frontend/scripts/albums/geometry.test.mjs
//
// The album's transform chain is easy to get wrong by reasoning alone: a page
// carries its own quarter turn, the whole album carries another, and offsets
// applied inside a rotated frame travel along a different world axis than you
// expect. This builds the real chain with three.js and checks where things
// actually end up.
import test from 'node:test'
import assert from 'node:assert/strict'
import { Group, Object3D, Vector3 } from 'three'

const PAGE_WIDTH = 1.28
const PAGE_DEPTH = 0.012
const READING_ROTATION = -Math.PI / 2

/**
 * Builds one leaf exactly as the scene does: album group (reading turn) ->
 * page group (its own turn) -> mesh (depth offset).
 */
function leaf({ number, page, sheetCount }) {
  const album = new Group()
  album.rotation.y = READING_ROTATION

  const pageGroup = new Group()
  const opened = page > number
  const bookClosed = page === 0 || page === sheetCount
  pageGroup.rotation.y = opened ? -Math.PI / 2 : Math.PI / 2

  const mesh = new Object3D()
  mesh.position.z = (page - number) * PAGE_DEPTH

  album.add(pageGroup)
  pageGroup.add(mesh)
  album.updateMatrixWorld(true)

  // Where the leaf's far edge and its outward normal end up in world space.
  const tip = new Vector3(PAGE_WIDTH, 0, 0).applyMatrix4(mesh.matrixWorld)
  const origin = new Vector3(0, 0, 0).applyMatrix4(mesh.matrixWorld)
  const normal = new Vector3(0, 0, 1)
    .applyMatrix4(mesh.matrixWorld)
    .sub(origin)
    .normalize()
  return { origin, tip, normal, opened, bookClosed }
}

const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps

test('a closed album faces the viewer', () => {
  const front = leaf({ number: 0, page: 0, sheetCount: 9 })
  assert.ok(near(front.normal.z, 1, 1e-6), `cover normal ${front.normal.toArray()}`)
  // And it extends to one side of the hinge, which is why it needs centring.
  assert.ok(front.tip.x > 1, `closed book should lie off to one side, tip.x=${front.tip.x}`)
})

test('an open spread puts one leaf either side of the hinge', () => {
  const left = leaf({ number: 4, page: 5, sheetCount: 9 })   // last one turned
  const right = leaf({ number: 5, page: 5, sheetCount: 9 })  // next one waiting
  assert.ok(left.tip.x < -1, `left leaf should extend to -x, got ${left.tip.x}`)
  assert.ok(right.tip.x > 1, `right leaf should extend to +x, got ${right.tip.x}`)
  // Both hinge on x = 0: that line is the gutter the binding has to fill.
  assert.ok(Math.abs(left.origin.x) < 1e-9 && Math.abs(right.origin.x) < 1e-9)
})

test('the two halves of a spread sit level', () => {
  // The regression this guards: offsetting turned and untouched leaves
  // separately, rather than shifting the whole block, steps the two visible
  // pages apart by the depth of everything turned so far.
  for (const page of [1, 3, 5, 8]) {
    const left = leaf({ number: page - 1, page, sheetCount: 9 })
    const right = leaf({ number: page, page, sheetCount: 9 })
    const step = Math.abs(left.origin.z - right.origin.z)
    assert.ok(step <= PAGE_DEPTH + 1e-9, `page ${page}: halves ${step.toFixed(4)} apart`)
  }
})

test('both visible leaves face the viewer', () => {
  const left = leaf({ number: 4, page: 5, sheetCount: 9 })
  const right = leaf({ number: 5, page: 5, sheetCount: 9 })
  assert.ok(right.normal.z > 0.99, `right normal ${right.normal.toArray()}`)
  assert.ok(left.normal.z < -0.99, 'the left leaf shows its back face, as it should')
})

test('the block stacks away from the viewer, never toward them', () => {
  // Leaves must pile up behind the spread, or the top of the pile would sit
  // in front of the page being read.
  const sheetCount = 12
  for (const page of [0, 4, 12]) {
    for (let n = 0; n < sheetCount; n++) {
      const { origin } = leaf({ number: n, page, sheetCount })
      assert.ok(origin.z <= 1e-9, `page ${page}, leaf ${n} sits at z=${origin.z}`)
    }
  }
})

test('the binding fills the gutter and shows on the bound edge', () => {
  // Binding is authored in album-local space: it spans the block along local
  // x and straddles the hinge along local z.
  const album = new Group()
  album.rotation.y = READING_ROTATION
  const depth = 9 * PAGE_DEPTH + 0.044
  const binding = new Object3D()
  binding.position.set(-depth / 2, 0, 0.004)
  binding.scale.set(depth, 1.76, 0.024)
  album.add(binding)
  album.updateMatrixWorld(true)

  const centre = new Vector3().applyMatrix4(binding.matrixWorld)
  // It has to sit on the hinge line in world x, which is where the gap is.
  assert.ok(Math.abs(centre.x) < 0.02, `binding centre off the gutter: x=${centre.x}`)
  // And run backwards from the spread, not toward the viewer.
  assert.ok(centre.z < 0, `binding sits in front of the pages: z=${centre.z}`)
})

// ---- which way a leaf turns ------------------------------------------------

const PAGE_DEPTH_ = 0.012
const degToRad = (d) => (d * Math.PI) / 180

/** The rest pose of a leaf, matching Page.jsx. */
function restRotation({ number, opened, bookClosed }) {
  const fan = degToRad(1.5 + Math.min(number, 20) * 0.3)
  const base = opened ? -Math.PI / 2 : Math.PI / 2
  return bookClosed ? base : base + (opened ? fan : -fan)
}

/** Shortest signed way round, which is what easing.dampAngle takes. */
const shortestDelta = (from, to) => {
  let d = (to - from) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

test('a leaf turns over the front of the book, never round the back', () => {
  // The bug this catches: at exactly 180 degrees apart there IS no shortest
  // way, so leaves picked a side arbitrarily and some swept behind the book.
  for (const number of [0, 1, 5, 12, 25]) {
    const from = restRotation({ number, opened: false, bookClosed: false })
    const to = restRotation({ number, opened: true, bookClosed: false })
    const delta = shortestDelta(from, to)

    assert.ok(Math.abs(delta) < Math.PI - 1e-6, `leaf ${number}: exactly 180 apart, direction undefined`)
    // Half way round must land near 0 — the leaf standing up toward the
    // reader — and nowhere near 180, which is flat behind the book.
    const midway = from + delta / 2
    assert.ok(Math.abs(midway) < 0.2, `leaf ${number}: passes through ${midway.toFixed(3)}, not the front`)
  }
})

test('every leaf turns the same way as every other', () => {
  const directions = [0, 1, 5, 12, 25].map((number) =>
    Math.sign(
      shortestDelta(
        restRotation({ number, opened: false, bookClosed: false }),
        restRotation({ number, opened: true, bookClosed: false })
      )
    )
  )
  assert.equal(new Set(directions).size, 1, `leaves turn different ways: ${directions}`)
})

// ---- the block centres itself ---------------------------------------------

test('the block occupies the same volume however the album is opened', () => {
  // The shelved block is centred on the album's origin, so the bound album has
  // to be too — otherwise the handover jumps by half a page.
  const sheetCount = 9
  const COVER_BOARD_ = 0.022
  const depth = sheetCount * PAGE_DEPTH_ + COVER_BOARD_ * 2

  for (const page of [0, 1, 4, 8, 9]) {
    const minZ = page < sheetCount ? -PAGE_WIDTH : 0
    const maxZ = page > 0 ? PAGE_WIDTH : 0
    const offset = { x: depth / 2, z: -(minZ + maxZ) / 2 }

    // Leaf extremes in album-local space, plus the centring offset.
    const bounds = { minX: Infinity, maxX: -Infinity }
    for (let n = 0; n < sheetCount; n++) {
      const opened = page > n
      const x = (opened ? -1 : 1) * (page - n) * PAGE_DEPTH_ * (opened ? -1 : 1)
      bounds.minX = Math.min(bounds.minX, x)
      bounds.maxX = Math.max(bounds.maxX, x)
    }

    const centredZ = (minZ + maxZ) / 2 + offset.z
    assert.ok(Math.abs(centredZ) < 1e-9, `page ${page}: block sits at z=${centredZ}, not centred`)
    // The binding spans the full thickness and is what x-centring is measured
    // against, so that offset is constant.
    assert.equal(offset.x, depth / 2)
  }
})
