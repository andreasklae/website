import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import Album from './Album'
import { PAGE_WIDTH } from './Page'
import { paintFace } from '../lib/faceCanvas'
import { ensureFonts } from '../lib/fonts'
import { imageCache } from '../lib/textures'
import { useSpineTexture } from '../lib/useSpineTexture'
import { MODES, useAlbumStore } from '../lib/store'
import { depthFor, pageDepthFor } from '../lib/albumDepth'
import { blockCentre } from '../lib/blockLayout'
import { clothFor } from '../lib/cloth'
import { easing } from 'maath'

// Shelved, an album's spine faces the viewer. A quarter turn brings its front
// board round — the same frame the leaves are authored in, so opening simply
// continues from where the turn leaves off.
export const SHELF_ROTATION = 0
export const READING_ROTATION = -Math.PI / 2

/** Where the chosen album finally sits, turned and clear of the row. */
export const FORWARD_Z = PAGE_WIDTH * 0.35

/** Fraction of the movement spent drawing the album straight out. */
const PULL_PHASE = 0.42

// Hovering: lifted off the shelf, eased forward and turned enough to read the
// board. The turn is what needs the room the neighbours make to its right.
const HOVER_LIFT = 0.34
const HOVER_FORWARD = 0.22
const HOVER_SHIFT_X = 0.05
const HOVER_TURN = -0.3

/**
 * Where the album's hinge sits, and how far it has turned, for one eased
 * number running 0 (shelved) to 1 (facing you).
 *
 * A book comes off a shelf in two moves: out, then round. Turning while still
 * between its neighbours sweeps its far edge through them — the edge is a full
 * page from the hinge, so nothing short of drawing it right out will clear.
 *
 * During the turn the hinge tracks PAGE_WIDTH * cos(angle), which holds the
 * far edge at exactly one depth for the whole rotation: the album pivots on
 * its own outer edge, coming back in only as fast as turning allows. That is
 * the constraint the "don't pull it back in faster than it turns" rule
 * describes, solved rather than tuned.
 *
 * Being a pure function of `out`, putting the album back retraces it exactly.
 */
export function poseFor(out, restZ) {
  if (out <= PULL_PHASE) {
    const pulled = PULL_PHASE > 0 ? out / PULL_PHASE : 1
    return { turn: 0, z: pulled * (restZ + PAGE_WIDTH) }
  }
  const turn = (out - PULL_PHASE) / (1 - PULL_PHASE)
  return { turn, z: restZ + PAGE_WIDTH * Math.cos((turn * Math.PI) / 2) }
}

/** Shared by the turn out and the turn back, so one is the reverse of the other. */
export const TURN_SMOOTHING = 0.42

/**
 * The bound album hinges on its spine and its body runs backwards from there,
 * so it is seated on that edge rather than straddling its own origin.
 */
const SPINE_SEAT = -PAGE_WIDTH / 2

/** Depth the chosen album settles at, which is what the camera frames. */
export const READING_PLANE_Z = -PAGE_WIDTH / 2 + PAGE_WIDTH * 0.35

/**
 * Where the hinge ends up once the album has turned.
 *
 * A shut album lies wholly to one side of its binding, so leaving the hinge in
 * the album's own slot puts the whole cover off to that side of the row. Half
 * a page to the left and the cover is centred over the shelf it came from.
 * Applied with the turn, so the album still pulls straight out of its slot
 * before drifting across.
 */
export const TURNED_X = -PAGE_WIDTH / 2

// Covers are painted at a fraction of page resolution. They are never read
// like a page, and five full-size boards would cost ~28MB of texture.
const COVER_SCALE = 0.62

/**
 * Paints a board on mount, so an album's cover is already there the moment it
 * turns rather than appearing once something touches it. The same call makes
 * the back board, which is otherwise bare paper on a shelved album.
 */
function useBoardTexture(album, language, kind, colours) {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    let cancelled = false
    const canvas = document.createElement('canvas')
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.minFilter = tex.magFilter = LinearFilter
    tex.generateMipmaps = false
    tex.anisotropy = 4

    // The same face description the album's own page 0 is built from, so the
    // board and the first leaf are the same image. The cloth is passed to the
    // painter rather than smuggled through the slot.
    const face = kind === 'back-cover'
      ? { role: 'back-cover', slots: [{ kind: 'back-cover', title: album.title }] }
      : {
          role: 'cover',
          slots: [{
            kind: 'cover',
            title: album.title,
            subtitle: album.camera,
            dates: album.dates,
            photo: album.cover,
          }],
        }

    const paint = () => {
      if (cancelled) return
      paintFace(canvas, face, { language, images: imageCache.map, scale: COVER_SCALE, ...colours })
      tex.needsUpdate = true
    }

    ensureFonts().then(() => {
      paint()
      if (kind !== 'back-cover' && album.cover) imageCache.load(album.cover, 'page').then(paint)
    })

    setTexture(tex)
    return () => { cancelled = true; tex.dispose(); canvas.width = canvas.height = 1 }
  }, [album, language, kind, colours])

  return texture
}

/**
 * One album on the shelf — the real, bound thing, whether or not it has been
 * chosen. Choosing it turns it and starts painting its faces; it never swaps
 * for a different object, because there is no other object.
 */
export default function AlbumBook({ album, full, index, language, active, partX = 0, shelfX = 0, isLast = false }) {
  const leaves = full ? full.sheets.length : album.sheetCount
  const depth = depthFor(album.id)
  const pageDepth = pageDepthFor(leaves, depth)
  // Where the top of the block ends up once the album has turned: half its own
  // thickness in front of its origin, less half a leaf. Thicker albums sit
  // further forward, so this travels with the album rather than being fixed.
  const pagePlaneZ = READING_PLANE_Z + blockCentre(depth, pageDepth)

  const colours = clothFor(index)
  const { cloth } = colours

  const coverTexture = useBoardTexture(album, language, 'cover', colours)
  const backCoverTexture = useBoardTexture(album, language, 'back-cover', colours)
  const group = useRef()
  const mode = useAlbumStore((s) => s.mode)
  const hoveredAlbum = useAlbumStore((s) => s.hoveredAlbum)
  const setHoveredAlbum = useAlbumStore((s) => s.setHoveredAlbum)
  const setPlaneZ = useAlbumStore((s) => s.setPlaneZ)
  const setActiveX = useAlbumStore((s) => s.setActiveX)
  const setHoveredX = useAlbumStore((s) => s.setHoveredX)
  const selectAlbum = useAlbumStore((s) => s.selectAlbum)


  const spineTexture = useSpineTexture(album, language, index, depth)

  const reading = active && (mode === MODES.OPEN || mode === MODES.ZOOM)
  const hovered = hoveredAlbum === album.id && !active && mode !== MODES.OPEN && mode !== MODES.ZOOM

  // One eased number drives both the pull and the turn, so putting the album
  // back is the exact reverse of taking it out — two separately damped
  // channels drift apart and the reverse never quite matches. The hover lift
  // is eased separately because it is not part of that movement.
  const motion = useRef({ out: 0, lift: 0, part: 0 }).current

  // Tell the camera which plane this album's pages sit on.
  useEffect(() => {
    if (!active) return
    setPlaneZ(pagePlaneZ)
    setActiveX(shelfX)
  }, [active, pagePlaneZ, shelfX, setPlaneZ, setActiveX])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    easing.damp(motion, 'out', active ? 1 : 0, TURN_SMOOTHING, delta)
    easing.damp(motion, 'lift', hovered ? 1 : 0, 0.24, delta)
    easing.damp(motion, 'part', partX, 0.3, delta)

    const { turn, z } = poseFor(motion.out, FORWARD_Z)
    // Hovering tips the album up and turns it partway, far enough to read the
    // front board without committing to picking it up.
    // The lift is what carries a turning album clear of the one beside it, so
    // the last album on the shelf — which has nothing to its right — does not
    // need as much of it.
    const peek = motion.lift * (1 - turn)
    const lift = peek * (isLast ? HOVER_LIFT * 0.45 : HOVER_LIFT)
    g.rotation.y = SHELF_ROTATION + (READING_ROTATION - SHELF_ROTATION) * turn + peek * HOVER_TURN
    g.position.set(
      motion.part + turn * TURNED_X + peek * HOVER_SHIFT_X,
      lift,
      SPINE_SEAT + z + peek * HOVER_FORWARD
    )
  })

  return (
    <group
      ref={group}
      position={[0, 0, SPINE_SEAT]}
      onPointerOver={(e) => {
        if (reading || mode === MODES.OPEN || mode === MODES.ZOOM) return
        e.stopPropagation()
        setHoveredAlbum(album.id)
        setHoveredX(shelfX)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHoveredAlbum(null)
        setHoveredX(null)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        if (mode === MODES.OPEN || mode === MODES.ZOOM) return
        e.stopPropagation()
        document.body.style.cursor = ''
        if (active) useAlbumStore.getState().open()
        else selectAlbum(album.id)
      }}
    >
      <Album
        planeZ={pagePlaneZ}
        hingeX={shelfX + TURNED_X}
        full={active ? full : null}
        sheetCount={album.sheetCount}
        depth={depth}
        pageDepth={pageDepth}
        colours={colours}
        albumId={album.id}
        active={active}
        language={language}
        coverTexture={coverTexture}
        backCoverTexture={backCoverTexture}
        spineTexture={spineTexture}
      />
    </group>
  )
}
