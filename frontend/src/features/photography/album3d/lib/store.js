import { create } from 'zustand'

/**
 * The scene is a small state machine. Every camera move and animation is
 * derived from `mode`, so nothing animates twice or fights over the camera.
 *
 *   shelf    albums stand side-on, spines readable
 *   pulling  the chosen album slides out of the row
 *   cover    it faces the viewer; the front is held for a beat
 *   open     the album is open, pages turn
 *   zoom     one image is enlarged over the open page
 */
export const MODES = { SHELF: 'shelf', PULLING: 'pulling', COVER: 'cover', OPEN: 'open', ZOOM: 'zoom' }

/** How long the cover is held before the album opens itself. */
export const COVER_HOLD_MS = 1600

export const useAlbumStore = create((set, get) => ({
  mode: MODES.SHELF,
  shelf: [],
  activeId: null,
  album: null,
  loading: false,

  /** Index of the sheet being read: 0 = closed, sheets.length = fully open at the back. */
  page: 0,
  hoveredAlbum: null,
  hoveredSlot: null,
  zoomed: null,
  quality: 'high',

  setShelf: (shelf) => set({ shelf }),
  setHoveredAlbum: (hoveredAlbum) => set({ hoveredAlbum }),
  setHoveredSlot: (hoveredSlot) => set({ hoveredSlot }),
  setQuality: (quality) => set({ quality }),

  selectAlbum: (id) => {
    if (get().mode !== MODES.SHELF) return
    set({ activeId: id, mode: MODES.PULLING, loading: true, page: 0 })
  },

  albumLoaded: (album) => set({ album, loading: false }),

  /** Called by the pull-out animation when the album has cleared the shelf. */
  reachedCover: () => { if (get().mode === MODES.PULLING) set({ mode: MODES.COVER }) },

  open: () => { if (get().mode === MODES.COVER) set({ mode: MODES.OPEN, page: 1 }) },

  next: () => {
    const { album, page, mode } = get()
    if (mode !== MODES.OPEN || !album) return
    set({ page: Math.min(page + 1, album.sheets.length) })
  },

  prev: () => {
    const { page, mode } = get()
    if (mode !== MODES.OPEN) return
    set({ page: Math.max(page - 1, 0) })
  },

  goToPage: (n) => {
    const { album } = get()
    if (!album) return
    set({ page: Math.max(0, Math.min(n, album.sheets.length)) })
  },

  zoom: (slot) => { if (get().mode === MODES.OPEN) set({ mode: MODES.ZOOM, zoomed: slot }) },
  unzoom: () => { if (get().mode === MODES.ZOOM) set({ mode: MODES.OPEN, zoomed: null }) },

  /** Put the album back on the shelf. */
  close: () => set({ mode: MODES.SHELF, activeId: null, album: null, page: 0, zoomed: null, hoveredSlot: null }),
}))

/** Faces visible right now, plus their neighbours — drives texture residency. */
export const visibleFaceIndices = (page, faceCount) => {
  // Open at sheet `page` shows face 2*page-1 (left) and 2*page (right).
  const centre = [2 * page - 1, 2 * page]
  const near = [2 * page - 3, 2 * page - 2, 2 * page + 1, 2 * page + 2]
  return [...centre, ...near].filter((i) => i >= 0 && i < faceCount)
}
