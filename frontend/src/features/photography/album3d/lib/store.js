import { create } from 'zustand'
import { ZOOM } from './shelfView.js'

/**
 * The scene is a small state machine. Every camera move and animation is
 * derived from `mode`, so nothing animates twice or fights over the camera.
 *
 *   shelf  albums stand side-on, spines readable
 *   cover  one album has turned to face you; the rest have parted to make room
 *   open   that album is open, pages turn
 *   zoom   one image is enlarged over the open page
 *
 * There is no pull-out state: an album turns in place rather than travelling
 * through its neighbours, which means switching between albums is one click.
 */
export const MODES = { SHELF: 'shelf', COVER: 'cover', OPEN: 'open', ZOOM: 'zoom' }

/** On narrow screens a two-page spread is unreadable, so we frame one page. */
export const SIDES = { LEFT: 'left', RIGHT: 'right' }

/**
 * The furthest you can read. Turning the final leaf would shut the album
 * against its back board, which reads as the book closing itself rather than
 * as the end of it — so the last spread is where it stops.
 */
export const lastSpread = (album) => Math.max(1, (album?.sheets.length ?? 1) - 1)

export const useAlbumStore = create((set, get) => ({
  mode: MODES.SHELF,
  shelf: [],
  activeId: null,
  album: null,

  /** Index of the sheet being read: 0 = closed, sheets.length = open at the back. */
  page: 0,
  /** Which half of the spread is framed. Only meaningful when `narrow`. */
  side: SIDES.LEFT,
  narrow: false,

  hoveredAlbum: null,
  hoveredSlot: null,
  /**
   * Depth of the page you are actually looking at. Albums differ in thickness,
   * and the top of the block sits half a thickness in front of the album's
   * own origin, so this cannot be a constant — the camera would frame and
   * anchor against a plane the pages are not on.
   */
  planeZ: 0,
  /** Where along the shelf the chosen album stands, so the camera can go to it. */
  activeX: 0,
  /** Where the album under the pointer stands, so the shelf view can lean toward it. */
  hoveredX: null,
  /** The room's lamp. Off when the page opens; it comes on by itself shortly after. */
  lampOn: false,

  /**
   * How close the shelf view sits: a divisor on the fitting distance, so
   * below 1 is further away. The wheel moves it.
   *
   * Named for the shelf, not just `zoom`, because `zoom` is already an action
   * further down this same object — enlarging one photograph over the page.
   * A duplicate key is not an error: the later one simply wins, so the camera
   * quietly divided its distance by a function, got NaN, and rendered a black
   * screen with everything still in the scene and nothing in the console.
   */
  shelfZoom: ZOOM.start,
  zoomShelfBy: (factor) => set((s) => ({
    shelfZoom: Math.min(ZOOM.max, Math.max(ZOOM.min, s.shelfZoom * factor)),
  })),

  /** A single photograph, enlarged over the page. */
  zoomed: null,
  /**
   * World-space box the camera should lean in on, set by hovering a
   * photograph or a stack. Hovering moves the camera; it never opens anything.
   */
  focus: null,
  /** A stack the reader has picked up to sift through. */
  heldStack: null,

  setShelf: (shelf) => set({ shelf }),
  setHoveredAlbum: (hoveredAlbum) => set({ hoveredAlbum }),
  setHoveredSlot: (hoveredSlot) => set({ hoveredSlot }),
  setNarrow: (narrow) => set({ narrow }),
  setPlaneZ: (planeZ) => set({ planeZ }),
  setActiveX: (activeX) => set({ activeX }),
  setHoveredX: (hoveredX) => set({ hoveredX }),
  setLamp: (lampOn) => set({ lampOn }),
  toggleLamp: () => set((s) => ({ lampOn: !s.lampOn })),

  /** Choosing an album, including swapping directly to another one. */
  selectAlbum: (id) => {
    const { mode, activeId } = get()
    if (mode === MODES.OPEN || mode === MODES.ZOOM) return
    if (activeId === id) return
    set({ activeId: id, mode: MODES.COVER, page: 0, side: SIDES.LEFT, album: null, zoomed: null, focus: null, heldStack: null })
  },

  albumLoaded: (album) => set({ album }),

  open: () => {
    const { mode, album } = get()
    if (mode !== MODES.COVER || !album) return
    set({ mode: MODES.OPEN, page: 1, side: SIDES.LEFT })
  },

  /** Shut the book but keep it facing you, ready to open again or swap. */
  closeBook: () => {
    const { mode } = get()
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return
    set({ mode: MODES.COVER, page: 0, side: SIDES.LEFT, zoomed: null, focus: null, heldStack: null, hoveredSlot: null })
  },

  next: () => {
    const { album, page, mode, narrow, side } = get()
    if ((mode !== MODES.OPEN && mode !== MODES.ZOOM) || !album) return
    if (narrow && side === SIDES.LEFT) return set({ side: SIDES.RIGHT, zoomed: null, focus: null, mode: MODES.OPEN })
    set({ page: Math.min(page + 1, lastSpread(album)), side: SIDES.LEFT, zoomed: null, focus: null, mode: MODES.OPEN })
  },

  prev: () => {
    const { page, mode, narrow, side } = get()
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return
    if (narrow && side === SIDES.RIGHT) return set({ side: SIDES.LEFT, zoomed: null, focus: null, mode: MODES.OPEN })
    set({ page: Math.max(page - 1, 0), side: narrow ? SIDES.RIGHT : SIDES.LEFT, zoomed: null, focus: null, mode: MODES.OPEN })
  },

  /** Lean the camera in on a photograph or stack under the cursor. */
  setFocus: (focus) => {
    if (get().heldStack) return
    set({ focus })
  },

  zoom: (slot) => {
    const { mode, heldStack } = get()
    if (heldStack || (mode !== MODES.OPEN && mode !== MODES.ZOOM)) return
    set({ mode: MODES.ZOOM, zoomed: slot })
  },
  unzoom: () => { if (get().mode === MODES.ZOOM) set({ mode: MODES.OPEN, zoomed: null }) },

  /** Lift a stack off the page so it can be sifted through. */
  takeStack: (slot) => {
    if (get().mode !== MODES.OPEN && get().mode !== MODES.ZOOM) return
    set({ heldStack: slot, zoomed: null, focus: null, mode: MODES.OPEN })
  },
  putBackStack: () => set({ heldStack: null }),

  /**
   * Put the album back on the shelf. The album DATA is deliberately kept: the
   * bound album has to stay on screen and turn all the way home before the
   * shelved block takes over, and dropping it here would make it vanish
   * mid-turn. selectAlbum clears it when a different one is chosen.
   */
  close: () => set({
    mode: MODES.SHELF, activeId: null,
    page: 0, side: SIDES.LEFT, zoomed: null, focus: null, heldStack: null, hoveredSlot: null,
  }),
}))

/** The two faces actually being read. Open at sheet `page` shows 2*page-1 and 2*page. */
export const spreadFaceIndices = (page, faceCount) =>
  [2 * page - 1, 2 * page].filter((i) => i >= 0 && i < faceCount)

/** Faces visible right now, plus their neighbours — drives texture residency. */
export const visibleFaceIndices = (page, faceCount) => {
  const centre = spreadFaceIndices(page, faceCount)
  const near = [2 * page - 3, 2 * page - 2, 2 * page + 1, 2 * page + 2]
  return [...centre, ...near].filter((i) => i >= 0 && i < faceCount)
}
