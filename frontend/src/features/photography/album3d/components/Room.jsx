import { useEffect, useMemo } from 'react'
import {
  BoxGeometry, CanvasTexture, Color, LinearFilter, MeshStandardMaterial,
  RepeatWrapping, SRGBColorSpace,
} from 'three'
import { paintPlaster, paintWood, seedFrom } from '../lib/material'
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

/** One shared wood texture, tiled per board so the grain runs along it. */
function useWood(seed, colour, repeat) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 256
    paintWood(canvas.getContext('2d'), canvas.width, canvas.height, colour, seedFrom(seed))
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.minFilter = tex.magFilter = LinearFilter
    tex.generateMipmaps = false
    tex.wrapS = tex.wrapT = RepeatWrapping
    tex.repeat.set(repeat[0], repeat[1])
    return tex
  }, [seed, colour, repeat[0], repeat[1]])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function useSurface(seed, colour, repeat, roughness, paint) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    paint(canvas.getContext('2d'), canvas.width, canvas.height, colour, seedFrom(seed))
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.minFilter = tex.magFilter = LinearFilter
    tex.generateMipmaps = false
    tex.wrapS = tex.wrapT = RepeatWrapping
    tex.repeat.set(repeat[0], repeat[1])
    return tex
  }, [seed, colour, repeat[0], repeat[1], paint])

  const material = useMemo(
    () => new MeshStandardMaterial({ map: texture, roughness, color: new Color('#ffffff') }),
    [texture, roughness]
  )
  useEffect(() => () => { texture.dispose(); material.dispose() }, [texture, material])
  return material
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

  const wood = useWood('shelf-boards', '#6b4a2c', [3, 1])
  const woodUpright = useWood('shelf-uprights', '#634327', [1, 2])
  const backWood = useWood('shelf-back', '#4e3520', [2, 1])

  const boardMat = useMemo(() => new MeshStandardMaterial({ map: wood, roughness: 0.72 }), [wood])
  const uprightMat = useMemo(() => new MeshStandardMaterial({ map: woodUpright, roughness: 0.74 }), [woodUpright])
  const backMat = useMemo(() => new MeshStandardMaterial({ map: backWood, roughness: 0.85 }), [backWood])
  useEffect(() => () => [boardMat, uprightMat, backMat].forEach((m) => m.dispose()), [boardMat, uprightMat, backMat])

  const wall = useSurface('wall', '#6d6455', [1, 1], 0.95, paintPlaster)
  const floor = useSurface('floor', '#4a3520', [4, 4], 0.8, paintWood)

  const ROOM_W = interiorW + 16
  const ROOM_H = 9
  const ROOM_D = 14

  return (
    <group>
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

      {/* --- room ---------------------------------------------------------- */}
      <mesh geometry={box} material={wall}
        position={[midX, SHELF_FLOOR_Y + 0.4, BACK_Z - 0.14]}
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
    </group>
  )
}
