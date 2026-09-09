import { useEffect } from 'react'
import { useAlbumStore } from './store'
import { getAssetPath } from '../../../../utils/paths'

/** Loads the shelf manifest once, then each album on demand as it is chosen. */
export function useAlbumData() {
  const shelf = useAlbumStore((s) => s.shelf)
  const setShelf = useAlbumStore((s) => s.setShelf)
  const activeId = useAlbumStore((s) => s.activeId)
  const album = useAlbumStore((s) => s.album)
  const albumLoaded = useAlbumStore((s) => s.albumLoaded)

  useEffect(() => {
    let cancelled = false
    fetch(getAssetPath('content/albums/shelf.json'))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`shelf ${r.status}`))))
      .then((data) => { if (!cancelled) setShelf(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setShelf([]) })
    return () => { cancelled = true }
  }, [setShelf])

  useEffect(() => {
    if (!activeId || album?.id === activeId) return
    let cancelled = false
    fetch(getAssetPath(`content/albums/${activeId}.json`))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`album ${r.status}`))))
      .then((data) => { if (!cancelled) albumLoaded(data) })
      .catch(() => { if (!cancelled) albumLoaded(null) })
    return () => { cancelled = true }
  }, [activeId, album?.id, albumLoaded])

  return { shelf, album }
}
