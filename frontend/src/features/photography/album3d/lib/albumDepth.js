/**
 * How thick each album is, and what leaf spacing produces that thickness.
 *
 * A shelf of albums should look like a shelf, not a bar chart of how many
 * photographs each trip produced — so they are all about as thick as one
 * another, and the leaf spacing is solved backwards from that rather than the
 * thickness falling out of the page count. The variation is deterministic per
 * album, so an album is the same thickness on every visit.
 */

/** Roughly the thickness of the fattest album under the old reckoning. */
export const TARGET_DEPTH = 0.33

/**
 * Fraction of the spacing a leaf itself occupies; the rest is the gap that
 * keeps two settled leaves from interpenetrating.
 *
 * Kept high: at 0.45 the block was more air than paper, and at the crease —
 * where you look along the leaves rather than at them — you could see between
 * them and out the other side. A fifth of the spacing is ample clearance and
 * leaves the block reading as solid.
 */
export const LEAF_FRACTION = 0.8

const hash01 = (id) => {
  let h = 2166136261
  for (let i = 0; i < String(id).length; i++) {
    h ^= String(id).charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

/** Thickness of an album: near the target, varied a little either way. */
export const depthFor = (id) => TARGET_DEPTH * (0.86 + hash01(id) * 0.28)

/**
 * Leaf spacing that fills `depth` with `sheetCount` leaves.
 *
 * The block is (n - 1) gaps plus one leaf's own thickness, so this inverts
 * that — keeping the binding exactly flush with the leaves it binds however
 * many there are.
 */
export const pageDepthFor = (sheetCount, depth) =>
  depth / Math.max(1, sheetCount - 1 + LEAF_FRACTION)
