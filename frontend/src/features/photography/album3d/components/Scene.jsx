import { Suspense } from 'react'
import Shelf, { useShelfLayout } from './Shelf'
import ActiveAlbum from './ActiveAlbum'
import CameraRig from './CameraRig'
import { MODES, useAlbumStore } from '../lib/store'

export default function Scene({ shelf, album, language }) {
  const layout = useShelfLayout(shelf)
  const shelfWidth = layout.reduce((n, a) => n + a.thickness, 0) + 0.055 * Math.max(0, layout.length - 1)
  const activeId = useAlbumStore((s) => s.activeId)
  const mode = useAlbumStore((s) => s.mode)
  const slot = layout.find((a) => a.id === activeId)

  return (
    <>
      <CameraRig shelfWidth={shelfWidth} />

      {/*
        Deliberately cheap lighting: an ambient fill plus two directionals and
        no shadow maps at all. Shadow maps are what cost frames here, and the
        page curl already reads from geometry alone.
      */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.5} />
      <directionalLight position={[-3, 2, 2]} intensity={0.55} color="#ffe9d0" />

      <Suspense fallback={null}>
        <Shelf layout={layout} language={language} activeId={mode === MODES.SHELF ? null : activeId} />
        {slot && <ActiveAlbum album={album} slot={slot} language={language} />}
      </Suspense>
    </>
  )
}
