import { useEffect, useMemo, useState } from 'react'
import {
  BoxGeometry, CanvasTexture, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter,
  ImageBitmapLoader, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace, Vector2,
} from 'three'
import {
  normalFromCanvas, paintCloth, paintPlaster, paintTimberDetail, paintWood,
  roughnessFromCanvas, seedFrom, vignette,
} from '../lib/material'
import { getAssetPath } from '../../../../utils/paths'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'

// The books' own footprint, which everything here is built around rather than
// guessed at. They stand on y = -PAGE_HEIGHT/2 and run back from their spines.
export const SHELF_FLOOR_Y = -PAGE_HEIGHT / 2
const SPINE_Z = -PAGE_WIDTH / 2
const BOOK_BACK_Z = SPINE_Z - PAGE_WIDTH

/** Room for the row to slide sideways when an album is picked out. */
export const SLIDE_ROOM = 1.15

const BOARD = 0.075
// Headroom enough for an album to be lifted and turned inside the bay.
const INTERIOR_H = PAGE_HEIGHT * 1.42
const FRONT_Z = SPINE_Z + 0.16
const BACK_Z = BOOK_BACK_Z - 0.1

const box = new BoxGeometry(1, 1, 1)
const plane = new PlaneGeometry(1, 1)

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
 * A verdure tapestry hung on the wall behind the bookcase.
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
function Tapestry({ x, y, z, width }) {
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
      if (!live) return bitmap.close?.()
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
      normalMap: wrapped(normalFromCanvas(weave, 2.2), [width * 7, (width / 2.466) * 7]),
      normalScale: new Vector2(0.7, 0.7),
      roughness: 0.94,
      metalness: 0,
    })
  }, [map, width])

  useEffect(() => () => { material?.map?.dispose(); material?.normalMap?.dispose(); material?.dispose() }, [material])

  if (!material) return null
  const height = width / (map.image.width / map.image.height)
  return <mesh geometry={plane} material={material} position={[x, y, z]} scale={[width, height, 1]} />
}

/**
 * The bookcase and the room it stands in.
 *
 * Sized from where the books actually are — they sit on the bottom board, back
 * against the left upright, with the rest of the bay left clear so the row has
 * somewhere to go when one is picked out.
 */
export default function Room({ booksLeft, booksRight }) {
  const interiorLeft = booksLeft - 0.02
  const interiorRight = booksRight + SLIDE_ROOM
  const interiorW = interiorRight - interiorLeft
  const midX = (interiorLeft + interiorRight) / 2
  const depth = FRONT_Z - BACK_Z
  const midZ = (FRONT_Z + BACK_Z) / 2
  const topY = SHELF_FLOOR_Y + INTERIOR_H

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
    seed: 'wall', colour: '#6d6455', repeat: [5, 5], paint: paintPlaster,
    relief: 1.1, roughness: [0.8, 0.99], size: [512, 512],
  })
  const floor = useSurface({
    seed: 'floor', colour: '#4a3520', repeat: [7, 7], paint: timber,
    relief: 1.5, size: [512, 512],
  })

  const ROOM_W = interiorW + 16
  const ROOM_H = 9
  const ROOM_D = 14
  const WALL_Z = BACK_Z - 0.14

  return (
    <group>
      {/* --- the room, behind everything ----------------------------------- */}
      <mesh geometry={box} material={wall}
        position={[midX, SHELF_FLOOR_Y + 0.4, WALL_Z]}
        scale={[ROOM_W, ROOM_H * 2, 0.12]} />
      <mesh geometry={box} material={wall}
        position={[midX - ROOM_W / 2, SHELF_FLOOR_Y + 0.4, midZ + ROOM_D / 2]}
        scale={[0.12, ROOM_H * 2, ROOM_D]} />
      <mesh geometry={box} material={wall}
        position={[midX + ROOM_W / 2, SHELF_FLOOR_Y + 0.4, midZ + ROOM_D / 2]}
        scale={[0.12, ROOM_H * 2, ROOM_D]} />
      <mesh geometry={box} material={floor}
        position={[midX, SHELF_FLOOR_Y - BOARD - INTERIOR_H * 0.9 - BOARD / 2 - 0.4, midZ + ROOM_D / 2]}
        scale={[ROOM_W, 0.1, ROOM_D]} />

      {/* Hung a hair clear of the plaster, wide enough to fill the wall the
          camera can actually see on either side of the case. */}
      <Tapestry x={midX} y={SHELF_FLOOR_Y + 1.1} z={WALL_Z + 0.07} width={interiorW + 9.5} />

      {/* --- bookcase ------------------------------------------------------ */}
      {/* bottom board: what the books actually stand on */}
      <mesh geometry={box} material={boardMat}
        position={[midX, SHELF_FLOOR_Y - BOARD / 2, midZ]}
        scale={[interiorW + BOARD * 2, BOARD, depth]} />
      {/* top board */}
      <mesh geometry={box} material={boardMat}
        position={[midX, topY + BOARD / 2, midZ]}
        scale={[interiorW + BOARD * 2, BOARD, depth]} />
      {/* left upright — the row rests against this */}
      <mesh geometry={box} material={uprightMat}
        position={[interiorLeft - BOARD / 2, SHELF_FLOOR_Y + INTERIOR_H / 2, midZ]}
        scale={[BOARD, INTERIOR_H, depth]} />
      {/* right upright */}
      <mesh geometry={box} material={uprightMat}
        position={[interiorRight + BOARD / 2, SHELF_FLOOR_Y + INTERIOR_H / 2, midZ]}
        scale={[BOARD, INTERIOR_H, depth]} />
      {/* back panel */}
      <mesh geometry={box} material={backMat}
        position={[midX, SHELF_FLOOR_Y + INTERIOR_H / 2, BACK_Z - 0.02]}
        scale={[interiorW + BOARD * 2, INTERIOR_H, 0.04]} />
      {/* a shelf above and below, so it reads as a bookcase rather than a box */}
      <mesh geometry={box} material={boardMat}
        position={[midX, topY + BOARD + INTERIOR_H * 0.9, midZ]}
        scale={[interiorW + BOARD * 2, BOARD, depth]} />
      <mesh geometry={box} material={boardMat}
        position={[midX, SHELF_FLOOR_Y - BOARD - INTERIOR_H * 0.9, midZ]}
        scale={[interiorW + BOARD * 2, BOARD, depth]} />
    </group>
  )
}
