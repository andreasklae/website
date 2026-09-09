import { LEAF_FRACTION } from './albumDepth.js'
import { PAGE_HEIGHT } from './dimensions.js'

/**
 * Where the leaves and the binding sit relative to each other.
 *
 * This lives here, rather than inline in the components, so the tests measure
 * the placement the scene actually uses. Mirroring it in the test file instead
 * checks the intention and quietly passes when an edit fails to land — which
 * is how the binding came to sit half a leaf to the left of both boards while
 * a test asserted it was flush.
 */

/**
 * How far the binding stands out past the leaves' bound edges.
 *
 * A spine wraps the block rather than butting up against it, and the geometry
 * needs it to: every leaf presents a face on the hinge line, so a binding that
 * ends exactly there is coplanar with all of them and they fight for depth —
 * the leaves show through the spine in stripes. Standing it proud buries their
 * edges inside it, which is where a bound edge belongs anyway.
 */
export const SPINE_PROUD = 0.02

/** How far the binding is tucked inside the boards, to avoid coplanar faces. */
export const TUCK = 0.0035

/**
 * How far it reaches back behind the hinge, under the leaves that have not
 * been turned yet.
 *
 * Turned leaves lie one side of the hinge and untouched ones the other, so a
 * binding weighted to one side leaves the crease open on the other — which
 * shows as a gap between the pages part-way through a turn, when the leaf that
 * would have covered it is standing up in the air.
 */
export const SPINE_BEHIND = 0.04

export const SPINE_THICKNESS = SPINE_PROUD + SPINE_BEHIND

/**
 * Offset that puts the leaf block's OUTER FACES either side of the album's
 * origin. Half the block's extent is the outermost leaf's own thickness, so
 * centring on the nominal depth leaves the boards proud at one end and short
 * at the other.
 */
export const blockCentre = (depth, pageDepth) => depth / 2 - (pageDepth * LEAF_FRACTION) / 2

/**
 * The binding, in the block group's frame — which carries `blockCentre`, so
 * the placement undoes it and sits the binding on the album's own origin.
 * Same depth as the block and the same height as the leaves; only along the
 * hinge does it deliberately stand a little proud of them.
 */
export const bindingPose = (depth, pageDepth) => ({
  position: [-blockCentre(depth, pageDepth), 0, (SPINE_PROUD - SPINE_BEHIND) / 2],
  // A shade narrower and shorter than the block. Exactly flush puts the
  // binding's sides in the same plane as the boards and its top in the same
  // plane as their edges, and coplanar faces fight for depth — which shows as
  // the binding flickering through the cover along the join.
  scale: [depth - TUCK * 2, PAGE_HEIGHT - TUCK * 2, SPINE_THICKNESS],
})

/** Outer faces of the leaf block, measured from the album's origin. */
export const leafSpan = (depth, pageDepth, leaves) => {
  const centre = blockCentre(depth, pageDepth)
  const leaf = pageDepth * LEAF_FRACTION
  return { front: centre + leaf / 2, back: centre - (leaves - 1) * pageDepth - leaf / 2 }
}

/**
 * Outer faces of the binding, measured from the album's origin.
 *
 * Taken from the pose the mesh actually uses rather than from `depth`, or this
 * reports where the binding was meant to be instead of where it is.
 */
export const bindingSpan = (depth, pageDepth) => {
  const centre = blockCentre(depth, pageDepth)
  const { position, scale } = bindingPose(depth, pageDepth)
  return {
    front: centre + position[0] + scale[0] / 2,
    back: centre + position[0] - scale[0] / 2,
  }
}
