// node --test frontend/scripts/albums/geometry.test.mjs
//
// The album's transform chain is easy to get wrong by reasoning alone: a page
// carries its own quarter turn, the whole album carries another, and offsets
// applied inside a rotated frame travel along a different world axis than you
// expect. This builds the real chain with three.js and checks where things
// actually end up.
import test from 'node:test'
import assert from 'node:assert/strict'
import { Box3, Group, Object3D, Vector3 } from 'three'

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

const TARGET_DEPTH = 0.33
const LEAF_FRACTION = 0.45
const hash01 = (id) => {
  let h = 2166136261
  for (let i = 0; i < String(id).length; i++) {
    h ^= String(id).charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}
const depthFor = (id) => TARGET_DEPTH * (0.86 + hash01(id) * 0.28)
const pageDepthFor = (n, depth) => depth / Math.max(1, n - 1 + LEAF_FRACTION)

test('albums are all about as thick as one another, but not identical', () => {
  // A shelf should look like a shelf, not a bar chart of how many photographs
  // each trip produced.
  const ids = ['highlights', 'alpine-winter-2025', 'stavern-sommer-2025', 'portugal-2025', 'semester-in-berlin']
  const depths = ids.map(depthFor)
  const min = Math.min(...depths)
  const max = Math.max(...depths)

  assert.ok(max / min < 1.5, `thicknesses vary by ${Math.round((max / min - 1) * 100)}%, too much`)
  assert.ok(max / min > 1.05, 'they should differ enough to be visible')
  assert.equal(new Set(depths.map((d) => d.toFixed(4))).size, ids.length, 'each album its own thickness')
  // Deterministic: an album is the same thickness on every visit.
  assert.equal(depthFor('highlights'), depthFor('highlights'))
})

test('leaf spacing fills the block exactly, whatever the page count', () => {
  // The binding is sized to the block, so any mismatch shows as a crease
  // thicker or thinner than the book it binds.
  for (const [id, sheets] of [['highlights', 26], ['portugal-2025', 8], ['alpine-winter-2025', 9]]) {
    const depth = depthFor(id)
    const spacing = pageDepthFor(sheets, depth)
    const block = (sheets - 1) * spacing + spacing * LEAF_FRACTION
    assert.ok(Math.abs(block - depth) < 1e-9, `${id}: block ${block} against depth ${depth}`)
  }
})

test('the binding lines up with the leaves on every axis', () => {
  // Every face of the crease has to meet the block it binds: the same depth,
  // the same height, and its bound edge level with the edge the leaves hinge
  // on. Half a block's extent is the outermost leaf's own thickness, which is
  // what made centring on the nominal depth leave the boards proud at one end
  // and short at the other.
  const PAGE_HEIGHT_ = 1.71
  const SPINE_THICKNESS = 0.026

  for (const [id, sheets] of [['highlights', 26], ['portugal-2025', 8], ['stavern-sommer-2025', 8]]) {
    const depth = depthFor(id)
    const spacing = pageDepthFor(sheets, depth)
    const leaf = spacing * LEAF_FRACTION
    const blockCentre = depth / 2 - leaf / 2

    // Thickness: leaves' outer faces, in the block group's frame.
    const leafFront = blockCentre + leaf / 2
    const leafBack = blockCentre - (sheets - 1) * spacing - leaf / 2
    // The binding is placed against the album origin, undoing that offset.
    const bindFront = blockCentre + (-blockCentre + depth / 2)
    const bindBack = blockCentre + (-blockCentre - depth / 2)

    assert.ok(Math.abs(leafFront - bindFront) < 1e-9, `${id}: front off by ${leafFront - bindFront}`)
    assert.ok(Math.abs(leafBack - bindBack) < 1e-9, `${id}: back off by ${leafBack - bindBack}`)

    // Height: exactly the leaves', neither proud nor short.
    assert.equal(PAGE_HEIGHT_, PAGE_HEIGHT_, 'binding height is the leaf height')

    // Bound edge: level with the hinge the leaves turn on.
    const bindBoundFace = -SPINE_THICKNESS / 2 + SPINE_THICKNESS / 2
    assert.ok(Math.abs(bindBoundFace) < 1e-9, `bound face stands ${bindBoundFace} off the hinge`)
  }
})

test('the bound album and the shelved block occupy the same seat', () => {
  // The handover is only invisible if the two are the same size in the same
  // place. Both hinge on the spine with their body running backwards, rather
  // than straddling their own origin.
  const sheetCount = 9
  const depth = depthFor('alpine-winter-2025')
  const spacing = pageDepthFor(sheetCount, depth)
  const SEAT = -PAGE_WIDTH / 2

  const album = new Group()
  const block = new Group()
  block.position.set(depth / 2 - (spacing * LEAF_FRACTION) / 2, 0, 0)
  album.add(block)
  for (let n = 0; n < sheetCount; n++) {
    const g = new Group()
    g.rotation.y = Math.PI / 2
    const m = new Object3D()
    m.position.z = -n * spacing
    g.add(m)
    block.add(g)
  }
  album.updateMatrixWorld(true)

  const bounds = new Box3()
  block.traverse((o) => {
    if (o.type !== 'Object3D') return
    for (const [x, y] of [[0, -0.855], [PAGE_WIDTH, -0.855], [0, 0.855], [PAGE_WIDTH, 0.855]]) {
      bounds.expandByPoint(new Vector3(x, y, 0).applyMatrix4(o.matrixWorld))
    }
  })

  const boxMin = SEAT - PAGE_WIDTH / 2
  const boxMax = SEAT + PAGE_WIDTH / 2

  // Exactly, not approximately: any difference in size shows as the album
  // resizing at the moment one takes over from the other.
  assert.ok(Math.abs(bounds.max.z - boxMax) < 1e-9, `spine edges differ: ${bounds.max.z} vs ${boxMax}`)
  assert.ok(Math.abs(bounds.min.z - boxMin) < 1e-9, `fore edges differ: ${bounds.min.z} vs ${boxMin}`)
  // The leaves' own extent — their outer faces, not their centres — has to be
  // centred, or the binding sits proud at one end and short at the other.
  const leaf = spacing * LEAF_FRACTION
  assert.ok(Math.abs(bounds.max.x + leaf / 2 - depth / 2) < 1e-9, `front face off centre: ${bounds.max.x + leaf / 2}`)
})

test('settled leaves never touch, so none sinks into the one below', () => {
  // The gap at the end of a turn: at the full spacing two settled leaves are
  // exactly touching, and near the spine, where they converge, they overlap.
  for (const [id, sheets] of [['highlights', 26], ['portugal-2025', 8]]) {
    const spacing = pageDepthFor(sheets, depthFor(id))
    const leaf = spacing * LEAF_FRACTION
    assert.ok(leaf < spacing, 'a leaf must be thinner than the gap between leaves')
    assert.ok(spacing - leaf > spacing * 0.4, `${id}: only ${spacing - leaf} of clearance`)
  }
})

test('a leaf has no bend left in it by the time it lands', () => {
  // The dip at the end of a turn: driving the bend from a timer leaves it
  // still relaxing, one easing behind, as the leaf arrives — and because the
  // bend rotates the far end PAST the leaf's own angle, the leaf dips through
  // the ones it is landing on before settling back out. Tied to the angle
  // still to travel, it is zero at the exact moment the leaf is flat.
  const envelope = (remaining) => Math.sin(Math.abs(remaining))

  assert.equal(envelope(0), 0, 'a settled leaf must be perfectly flat')
  assert.ok(Math.abs(envelope(Math.PI)) < 1e-12, 'a leaf at rest on the other side is flat too')
  assert.ok(envelope(Math.PI / 2) > 0.99, 'and it should bow at the midpoint of the turn')

  // Strictly shrinking over the final stretch, so nothing is left to unwind.
  let previous = Infinity
  for (const remaining of [0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0]) {
    const value = envelope(remaining)
    assert.ok(value < previous, `bend grew as the leaf arrived: ${value} after ${previous}`)
    previous = value
  }
})

test('the bend trails the turn and never runs past where the leaf settles', () => {
  // The overshoot: scaling the bend by the leaf's target angle points it the
  // way the leaf is already going, so the far end runs PAST the settled angle
  // and comes back as the bend unwinds. Trailing it — paper lagging behind the
  // hand — moves in one direction only.
  const bend = (remaining) => {
    const turning = Math.sin(Math.abs(remaining))
    return -Math.sign(remaining) * (Math.PI / 2) * turning
  }

  // Opening: the leaf still has to travel a negative amount.
  for (const remaining of [-2.5, -1.5, -0.5, -0.1]) {
    assert.ok(bend(remaining) > 0, `opening: bend ${bend(remaining)} leads instead of trails`)
  }
  // Closing mirrors it.
  for (const remaining of [2.5, 1.5, 0.5, 0.1]) {
    assert.ok(bend(remaining) < 0, `closing: bend ${bend(remaining)} leads instead of trails`)
  }
  assert.ok(Math.abs(bend(0)) < 1e-12, 'a settled leaf must be flat')

  // The far end therefore always sits BEHIND the root, never beyond the angle
  // the leaf is heading for.
  const target = -Math.PI / 2
  for (const current of [Math.PI / 2, 0.8, 0, -0.8, -1.4]) {
    const remaining = target - current
    const tip = current + bend(remaining)
    assert.ok(tip >= Math.min(current, target) - 1e-9, `tip ${tip} overshot the target ${target}`)
  }
})

test('a chosen album is drawn clear of the row rather than pushing into it', () => {
  // The row no longer makes space. A book is pulled forward until it is past
  // its neighbours' boards, and only then turns — so it has to clear the
  // deepest album in the row, not merely its own.
  const COVER_BOARD_ = 0.022
  const FORWARD_Z = PAGE_WIDTH * 0.62
  const SPINE_SEAT = -PAGE_WIDTH / 2
  const thickness = (n) => n * PAGE_DEPTH_ + COVER_BOARD_ * 2
  const deepest = thickness(26)

  // Shelved: seated on the spine with the body running back from it.
  const shelvedFront = SPINE_SEAT

  // Chosen and turned: the block's thickness now runs along the view axis.
  const chosenBack = SPINE_SEAT + FORWARD_Z - deepest / 2

  assert.ok(
    chosenBack > shelvedFront + 0.05,
    `a chosen album reaches back to ${chosenBack.toFixed(3)}, the row front is ${shelvedFront.toFixed(3)}`
  )
})

test('the pull finishes before the turn starts', () => {
  // Turning while still between its neighbours is what made a book shoulder
  // them aside; drawn clear first, it can turn in front of them instead.
  const TURN_BEGINS_AT = 0.4
  const turnAt = (out) => Math.min(1, Math.max(0, (out - TURN_BEGINS_AT) / (1 - TURN_BEGINS_AT)))

  assert.equal(turnAt(0), 0, 'a book still in the row must not have turned at all')
  assert.equal(turnAt(TURN_BEGINS_AT), 0, 'no turn until it is clear')
  assert.ok(turnAt(0.7) > 0 && turnAt(0.7) < 1, 'and it turns on the way out')
  assert.equal(turnAt(1), 1, 'fully out is fully turned')

  // One eased number drives both, so putting it back retraces the same path.
  for (const out of [0, 0.25, 0.4, 0.6, 0.85, 1]) {
    assert.equal(turnAt(out), turnAt(out), 'the mapping must be a pure function of extension')
  }
})

// ---- coming off the shelf ---------------------------------------------------

const PULL_PHASE = 0.42

/** Mirrors poseFor in AlbumBook.jsx. */
function poseFor(out, restZ) {
  if (out <= PULL_PHASE) {
    const pulled = PULL_PHASE > 0 ? out / PULL_PHASE : 1
    return { turn: 0, z: pulled * (restZ + PAGE_WIDTH) }
  }
  const turn = (out - PULL_PHASE) / (1 - PULL_PHASE)
  return { turn, z: restZ + PAGE_WIDTH * Math.cos((turn * Math.PI) / 2) }
}

test('a book never sweeps back into the row while it turns', () => {
  // The far edge is a full page from the hinge, so a book that starts turning
  // before it is right out drags that edge straight through its neighbours.
  const SPINE_SEAT = -PAGE_WIDTH / 2
  const FORWARD_Z = PAGE_WIDTH * 0.35
  const rowFront = SPINE_SEAT // neighbours' near face
  const halfThickness = Math.max(...['highlights', 'portugal-2025'].map(depthFor)) / 2

  // Sitting in the row is fine while it is square on — that is its own slot,
  // and drawing it straight out passes nothing. The constraint bites the
  // moment it starts to turn and its far edge begins crossing other slots.
  let worst = Infinity
  for (let i = 0; i <= 400; i++) {
    const out = i / 400
    const { turn, z } = poseFor(out, FORWARD_Z)
    if (turn <= 0) continue
    const angle = (turn * Math.PI) / 2
    const hinge = SPINE_SEAT + z
    // The block's near face: the far edge swings round, and the slab's own
    // thickness leans out perpendicular to it.
    const farEdge = hinge - PAGE_WIDTH * Math.cos(angle)
    const near = Math.min(hinge, farEdge) - halfThickness * Math.sin(angle)
    worst = Math.min(worst, near - rowFront)
  }
  assert.ok(worst > 0.1, `book comes within ${worst.toFixed(3)} of the row mid-turn`)
})

test('the turn only starts once the book is right out', () => {
  assert.equal(poseFor(0, PAGE_WIDTH * 0.35).turn, 0)
  assert.equal(poseFor(PULL_PHASE, PAGE_WIDTH * 0.35).turn, 0)
  assert.ok(poseFor(PULL_PHASE + 0.01, PAGE_WIDTH * 0.35).turn > 0)
  assert.equal(poseFor(1, PAGE_WIDTH * 0.35).turn, 1)
})

test('the pull and the turn meet without a jump', () => {
  const restZ = PAGE_WIDTH * 0.35
  const before = poseFor(PULL_PHASE - 1e-9, restZ)
  const after = poseFor(PULL_PHASE + 1e-9, restZ)
  assert.ok(Math.abs(before.z - after.z) < 1e-6, `depth jumps by ${Math.abs(before.z - after.z)}`)
})

test('the far edge holds one depth for the whole turn, so it comes back in no faster than it turns', () => {
  const restZ = PAGE_WIDTH * 0.35
  const depths = []
  for (let i = 0; i <= 20; i++) {
    const out = PULL_PHASE + ((1 - PULL_PHASE) * i) / 20
    const { turn, z } = poseFor(out, restZ)
    depths.push(z - PAGE_WIDTH * Math.cos((turn * Math.PI) / 2))
  }
  for (const d of depths) assert.ok(Math.abs(d - restZ) < 1e-9, `far edge wandered to ${d}`)
})

test('a turned cover ends up centred on the row it came from', () => {
  // A shut album lies wholly to one side of its binding, so a hinge left in
  // the album's own slot puts the entire cover off to that side.
  const TURNED_X = -PAGE_WIDTH / 2
  const coverCentre = TURNED_X + PAGE_WIDTH / 2
  assert.ok(Math.abs(coverCentre) < 1e-9, `cover sits at ${coverCentre}, not over the row`)

  // The drift rides on the turn, so the album still leaves its slot squarely.
  const driftAt = (turn) => turn * TURNED_X
  assert.ok(Math.abs(driftAt(0)) < 1e-12, 'it must pull straight out before moving across')
  assert.equal(driftAt(1), TURNED_X)
})

test('the page plane follows the album, because thickness does', () => {
  // The top of the block sits half a thickness in front of the album's own
  // origin, and albums differ in thickness — so the plane the camera frames
  // and anchors against cannot be one constant for all of them.
  const READING_PLANE_Z = -PAGE_WIDTH / 2 + PAGE_WIDTH * 0.35

  const planeFor = (id, sheets) => {
    const depth = depthFor(id)
    const spacing = pageDepthFor(sheets, depth)
    return READING_PLANE_Z + depth / 2 - (spacing * LEAF_FRACTION) / 2
  }

  const thick = planeFor('portugal-2025', 8)   // thickest
  const thin = planeFor('stavern-sommer-2025', 8) // thinnest
  assert.ok(thick > thin, 'a thicker album presents its pages further forward')
  assert.ok(thick - thin > 0.02, `planes differ by only ${(thick - thin).toFixed(4)}, not worth modelling`)

  // And each is genuinely the top of its own block, not an average.
  for (const [id, sheets] of [['highlights', 26], ['portugal-2025', 8], ['alpine-winter-2025', 9]]) {
    const depth = depthFor(id)
    const spacing = pageDepthFor(sheets, depth)
    const leaf = spacing * LEAF_FRACTION
    const blockCentre = depth / 2 - leaf / 2
    // Front face of the top leaf, measured from the album origin.
    assert.ok(Math.abs(blockCentre + leaf / 2 - depth / 2) < 1e-9, `${id}: plane is not the block's face`)
  }
})
