import { useEffect, useMemo, useState } from 'react'
import {
  BoxGeometry, CanvasTexture, ClampToEdgeWrapping, ImageBitmapLoader, LinearFilter,
  LinearMipmapLinearFilter, MeshStandardMaterial, PlaneGeometry, RepeatWrapping,
  SRGBColorSpace, Vector2,
} from 'three'
import {
  normalFromCanvas, paintCloth, paintHerringbone, paintPlaster, paintTimberDetail,
  paintWood, roughnessFromCanvas, seedFrom, vignette,
} from '../lib/material'
import { getAssetPath } from '../../../../utils/paths'
import {
  BAY_HEIGHT, BOARD, CASE_BACK_Z, CASE_FRONT_Z, CASE_TOP_Y, CEILING_Y, FLOOR_Y,
  METRE, PANEL_Z, ROOM_DEPTH, SHELF_FLOOR_Y, SLIDE_ROOM, WALL_Z, shelfBoards,
} from '../lib/room'
import { panelRect, roomWidth } from '../lib/wallPanel'

export { SHELF_FLOOR_Y, SLIDE_ROOM }

const box = new BoxGeometry(1, 1, 1)
const plane = new PlaneGeometry(1, 1)

/** How much floor one tile of parquet covers. */
const PARQUET_TILE = 3 * METRE

/** A canvas of the given size with `paint` run over it. */
const painted = (w, h, paint) => {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  // Every one of these is read straight back out again to derive relief from,
  // so say so up front rather than letting the browser guess wrong twice.
  paint(canvas.getContext('2d', { willReadFrequently: true }), w, h)
  return canvas
}

const wrapped = (canvas, repeat, { srgb = false } = {}) => {
  const tex = new CanvasTexture(canvas)
  if (srgb) tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(repeat[0], repeat[1])
  tex.anisotropy = 8
  tex.minFilter = LinearMipmapLinearFilter
  tex.magFilter = LinearFilter
  return tex
}

/**
 * A material with relief, not just a picture of one.
 *
 * A colour map on its own is what makes a surface read as plastic: every
 * square millimetre of a board shades identically under a point light, so the
 * grain looks printed on rather than cut in, and one roughness number lets the
 * highlight slide over the whole thing in a single piece. Differencing the
 * painted luminance gives a normal map, and remapping it gives a roughness
 * map, so the lamp breaks up across the grain the way it does on real timber.
 */
function useSurface({ seed, colour, repeat, paint, roughness = [0.5, 0.9], relief = 1.4, size = [1024, 1024] }) {
  const material = useMemo(() => {
    const canvas = painted(size[0], size[1], (ctx, w, h) => paint(ctx, w, h, colour, seedFrom(seed)))
    const map = wrapped(canvas, repeat, { srgb: true })
    const normalMap = wrapped(normalFromCanvas(canvas, relief), repeat)
    const roughnessMap = wrapped(roughnessFromCanvas(canvas, roughness[0], roughness[1]), repeat)
    return new MeshStandardMaterial({
      map,
      normalMap,
      normalScale: new Vector2(1, 1),
      roughnessMap,
      roughness: 1,
      metalness: 0,
    })
  }, [seed, colour, repeat[0], repeat[1], paint, roughness[0], roughness[1], relief, size[0], size[1]])

  useEffect(() => () => {
    material.map?.dispose()
    material.normalMap?.dispose()
    material.roughnessMap?.dispose()
    material.dispose()
  }, [material])

  return material
}

/** Sawn timber: figure, then the pores and planer marks that carry the relief. */
const timber = (ctx, w, h, colour, seed) => {
  paintWood(ctx, w, h, colour, seed)
  paintTimberDetail(ctx, w, h, seed + 7)
}

/**
 * The back of the bay, darkened toward its edges.
 *
 * There are no shadow maps here — they are what costs frames — so a box lit by
 * one lamp is as bright in its corners as at its mouth, which is the most
 * artificial thing left about the bookcase. Painting the occlusion in costs
 * nothing and is most of what the eye was missing.
 */
const bayBack = (ctx, w, h, colour, seed) => {
  timber(ctx, w, h, colour, seed)
  vignette(ctx, w, h, 0.6)
}

/**
 * A verdure tapestry hung on the wall behind the bookcase, floor to ceiling.
 *
 * Its relief is the weave, not the picture: embossing the colour map would
 * emboss the trees and the sky along with it. So the normal map is a separate
 * procedural linen, tiled far finer than the image, and wool takes a high flat
 * roughness with no specular of its own to speak of.
 *
 * Loaded imperatively rather than through useLoader, which suspends: the whole
 * room is one Suspense boundary, and hanging the bookcase, the walls and the
 * books on half a megabyte of tapestry means the room stays black until it
 * lands. The wall simply gets its hanging a moment later instead.
 *
 * Decoded as an ImageBitmap rather than an <img>, which keeps a two-megapixel
 * decode off the main thread while the scene is coming up.
 */
function Tapestry({ rect }) {
  const [map, setMap] = useState(null)

  useEffect(() => {
    let live = true
    const loader = new ImageBitmapLoader()
    // Three's textures expect their first row at the bottom, so the decoder is
    // asked to flip. The renderer would otherwise flip it again on upload —
    // it sets UNPACK_FLIP_Y from texture.flipY whatever the source is — so
    // flipY has to be turned off below to stop the two cancelling into an
    // upside-down wall.
    loader.setOptions({ imageOrientation: 'flipY' })
    loader.load(getAssetPath('textures/wall-tapestry.webp'), (bitmap) => {
      // A stale load is dropped rather than closed. React runs this effect,
      // tears it down and runs it again, so there are always at least two in
      // flight, and a loader is free to hand the same decoded bitmap to both
      // callbacks — closing it in one would destroy what the other is about
      // to upload. Letting it be collected costs a frame's worth of memory
      // and cannot take the live texture down with it.
      if (!live) return
      const texture = new CanvasTexture(bitmap)
      texture.flipY = false
      texture.colorSpace = SRGBColorSpace
      texture.wrapS = texture.wrapT = ClampToEdgeWrapping
      texture.anisotropy = 8
      setMap(texture)
    }, undefined, () => {
      // The wall falls back to bare plaster, which is a fine degradation —
      // but silently, so say something.
      console.warn('[album3d] the wall tapestry failed to load')
    })
    return () => { live = false }
  }, [])

  const material = useMemo(() => {
    if (!map) return null
    const weave = painted(512, 512, (ctx, w, h) => paintCloth(ctx, w, h, '#808080', seedFrom('tapestry-weave')))
    return new MeshStandardMaterial({
      map,
      normalMap: wrapped(normalFromCanvas(weave, 2.2), [rect.width * 2.4, rect.height * 2.4]),
      normalScale: new Vector2(0.7, 0.7),
      roughness: 0.94,
      metalness: 0,
    })
  }, [map, rect.width, rect.height])

  useEffect(() => () => {
    material?.map?.dispose()
    material?.normalMap?.dispose()
    material?.dispose()
  }, [material])

  if (!material) return null
  return (
    <mesh
      geometry={plane}
      material={material}
      position={[rect.cx, rect.cy, PANEL_Z]}
      scale={[rect.width, rect.height, 1]}
    />
  )
}

/**
 * The bookcase and the room it stands in.
 *
 * Everything is at one scale, set by how big a photograph album actually is —
 * see lib/room.js. The case stands on the floor with its album bay at reading
 * height, under a two-and-a-half metre ceiling, rather than floating in a box
 * sized to whatever happened to be in frame.
 */
export default function Room({ booksLeft, booksRight }) {
  const interiorLeft = booksLeft - 0.02
  const interiorRight = booksRight + SLIDE_ROOM
  const interiorW = interiorRight - interiorLeft
  const midX = (interiorLeft + interiorRight) / 2
  const depth = CASE_FRONT_Z - CASE_BACK_Z
  const midZ = (CASE_FRONT_Z + CASE_BACK_Z) / 2
  const caseMidY = (FLOOR_Y + CASE_TOP_Y) / 2
  const caseH = CASE_TOP_Y - FLOOR_Y

  const panel = panelRect(midX)
  const ROOM_W = roomWidth(interiorW)
  const roomMidZ = CASE_BACK_Z + ROOM_DEPTH / 2
  const wallH = CEILING_Y - FLOOR_Y
  const wallMidY = (FLOOR_Y + CEILING_Y) / 2

  // Sizes are kept as small as each surface can stand: deriving relief means
  // walking every pixel of every map in JS, and that is paid on the main
  // thread while the page is coming up. A tiled surface can be small — it is
  // repeated many times over — so only the boards, which are read close to,
  // are given the long dimension.
  const boardMat = useSurface({
    seed: 'shelf-boards', colour: '#6b4a2c', repeat: [4, 1], paint: timber,
    relief: 1.7, size: [1024, 512],
  })
  const uprightMat = useSurface({
    seed: 'shelf-uprights', colour: '#634327', repeat: [1, 3], paint: timber,
    relief: 1.7, size: [512, 1024],
  })
  const backMat = useSurface({
    seed: 'shelf-back', colour: '#4e3520', repeat: [1, 1], paint: bayBack,
    relief: 1.2, roughness: [0.62, 0.94], size: [512, 512],
  })
  const wall = useSurface({
    seed: 'wall', colour: '#6d6455', repeat: [6, 3], paint: paintPlaster,
    relief: 1.1, roughness: [0.8, 0.99], size: [512, 512],
  })
  // Whitewashed, and flat: a ceiling is the one surface in a room with nothing
  // going on, and it is what tells you the room has a top at all.
  const ceiling = useSurface({
    seed: 'ceiling', colour: '#e8e4dc', repeat: [8, 6], paint: paintPlaster,
    relief: 0.8, roughness: [0.88, 1.0], size: [512, 512],
  })
  // Varnished parquet, so the lamp finds it. The tile is square because the
  // pattern only wraps when both its periods divide the canvas exactly.
  const floor = useSurface({
    seed: 'floor', colour: '#7a5330', repeat: [ROOM_W / PARQUET_TILE, ROOM_DEPTH / PARQUET_TILE],
    paint: paintHerringbone, relief: 1.3, roughness: [0.26, 0.55], size: [1024, 1024],
  })

  return (
    <group>
      {/* --- the room ------------------------------------------------------ */}
      <mesh geometry={box} material={wall}
        position={[midX, wallMidY, WALL_Z]}
        scale={[ROOM_W, wallH, 0.12]} />
      <mesh geometry={box} material={wall}
        position={[midX - ROOM_W / 2, wallMidY, roomMidZ]}
        scale={[0.12, wallH, ROOM_DEPTH]} />
      <mesh geometry={box} material={wall}
        position={[midX + ROOM_W / 2, wallMidY, roomMidZ]}
        scale={[0.12, wallH, ROOM_DEPTH]} />
      <mesh geometry={box} material={floor}
        position={[midX, FLOOR_Y - 0.05, roomMidZ]}
        scale={[ROOM_W, 0.1, ROOM_DEPTH]} />
      <mesh geometry={box} material={ceiling}
        position={[midX, CEILING_Y + 0.05, roomMidZ]}
        scale={[ROOM_W, 0.1, ROOM_DEPTH]} />

      <Tapestry rect={panel} />

      {/* --- bookcase ------------------------------------------------------ */}
      {shelfBoards().map((y) => (
        <mesh key={y} geometry={box} material={boardMat}
          position={[midX, y, midZ]}
          scale={[interiorW + BOARD * 2, BOARD, depth]} />
      ))}
      {/* the uprights, running the full height of the case */}
      <mesh geometry={box} material={uprightMat}
        position={[interiorLeft - BOARD / 2, caseMidY, midZ]}
        scale={[BOARD, caseH, depth]} />
      <mesh geometry={box} material={uprightMat}
        position={[interiorRight + BOARD / 2, caseMidY, midZ]}
        scale={[BOARD, caseH, depth]} />
      {/* back panel: the album bay only, which is the part you see into */}
      <mesh geometry={box} material={backMat}
        position={[midX, SHELF_FLOOR_Y + BAY_HEIGHT / 2, CASE_BACK_Z - 0.02]}
        scale={[interiorW + BOARD * 2, BAY_HEIGHT, 0.04]} />
      {/* and a plain back behind the rest of it */}
      <mesh geometry={box} material={uprightMat}
        position={[midX, caseMidY, CASE_BACK_Z - 0.03]}
        scale={[interiorW + BOARD * 2, caseH, 0.03]} />
    </group>
  )
}
