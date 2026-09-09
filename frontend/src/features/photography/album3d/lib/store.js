import { create } from 'zustand'

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
  /** A single photograph, enlarged over the page. */
  zoomed: null,
  /**
   * How the zoom was opened. A hover zoom is dismissed by moving off the
   * photograph, so its overlay must stay transparent to the pointer; a tap
   * zoom is dismissed deliberately and owns the pointer.
   */
  zoomSource: null,
  /** A stack the reader has picked up to sift through. */
  heldStack: null,

  setShelf: (shelf) => set({ shelf }),
  setHoveredAlbum: (hoveredAlbum) => set({ hoveredAlbum }),
  setHoveredSlot: (hoveredSlot) => set({ hoveredSlot }),
  setNarrow: (narrow) => set({ narrow }),

  /** Choosing an album, including swapping directly to another one. */
  selectAlbum: (id) => {
    const { mode, activeId } = get()
    if (mode === MODES.OPEN || mode === MODES.ZOOM) return
    if (activeId === id) return
    set({ activeId: id, mode: MODES.COVER, page: 0, side: SIDES.LEFT, album: null, zoomed: null, zoomSource: null, heldStack: null })
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
    set({ mode: MODES.COVER, page: 0, side: SIDES.LEFT, zoomed: null, zoomSource: null, heldStack: null, hoveredSlot: null })
  },

  next: () => {
    const { album, page, mode, narrow, side } = get()
    if ((mode !== MODES.OPEN && mode !== MODES.ZOOM) || !album) return
    if (narrow && side === SIDES.LEFT) return set({ side: SIDES.RIGHT, zoomed: null, mode: MODES.OPEN })
    set({ page: Math.min(page + 1, album.sheets.length), side: SIDES.LEFT, zoomed: null, mode: MODES.OPEN })
  },

  prev: () => {
    const { page, mode, narrow, side } = get()
    if (mode !== MODES.OPEN && mode !== MODES.ZOOM) return
    if (narrow && side === SIDES.RIGHT) return set({ side: SIDES.LEFT, zoomed: null, mode: MODES.OPEN })
    set({ page: Math.max(page - 1, 0), side: narrow ? SIDES.RIGHT : SIDES.LEFT, zoomed: null, mode: MODES.OPEN })
  },

  zoom: (slot, source = 'hover') => {
    const { mode, heldStack } = get()
    if (heldStack || (mode !== MODES.OPEN && mode !== MODES.ZOOM)) return
    set({ mode: MODES.ZOOM, zoomed: slot, zoomSource: source })
  },
  unzoom: () => {
    if (get().mode === MODES.ZOOM) set({ mode: MODES.OPEN, zoomed: null, zoomSource: null })
  },
  /**
   * Dismissal driven by the pointer leaving the page. Only a hover zoom may be
   * closed this way: a tap zoom's own overlay steals the pointer from the
   * canvas, and honouring that leave would close it the instant it opened.
   */
  unzoomIfHovered: () => {
    const { mode, zoomSource } = get()
    if (mode === MODES.ZOOM && zoomSource === 'hover') {
      set({ mode: MODES.OPEN, zoomed: null, zoomSource: null })
    }
  },

  /** Lift a stack off the page so it can be sifted through. */
  takeStack: (slot) => {
    if (get().mode !== MODES.OPEN && get().mode !== MODES.ZOOM) return
    set({ heldStack: slot, zoomed: null, zoomSource: null, mode: MODES.OPEN })
  },
  putBackStack: () => set({ heldStack: null }),

  /** Put the album back on the shelf. */
  close: () => set({
    mode: MODES.SHELF, activeId: null, album: null,
    page: 0, side: SIDES.LEFT, zoomed: null, zoomSource: null, heldStack: null, hoveredSlot: null,
  }),
}))

/** Faces visible right now, plus their neighbours — drives texture residency. */
export const visibleFaceIndices = (page, faceCount) => {
  // Open at sheet `page` shows face 2*page-1 (left) and 2*page (right).
  const centre = [2 * page - 1, 2 * page]
  const near = [2 * page - 3, 2 * page - 2, 2 * page + 1, 2 * page + 2]
  return [...centre, ...near].filter((i) => i >= 0 && i < faceCount)
}
