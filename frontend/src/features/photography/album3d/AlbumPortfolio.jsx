import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { ACESFilmicToneMapping } from 'three'
import Scene from './components/Scene'
import Controls from './components/Controls'
import { useAlbumData } from './lib/useAlbumData'
import { ensureFonts } from './lib/fonts'
import { MODES, useAlbumStore } from './lib/store'

/** True when the device says the viewer prefers less motion. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function AlbumPortfolio({ language = 'en', getText = (t) => t.en }) {
  const { shelf, album } = useAlbumData()
  const mode = useAlbumStore((s) => s.mode)

  useEffect(() => { ensureFonts() }, [])

  // Reset the scene when leaving the page so no textures outlive the route.
  useEffect(() => () => useAlbumStore.getState().close(), [])

  const dpr = useMemo(() => [1, prefersReducedMotion() ? 1.25 : 2], [])

  return (
    <div className="relative min-h-0 w-full flex-1">
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        camera={{ fov: 30, position: [0, 0.10, 3.35], near: 0.1, far: 40 }}
        onCreated={({ gl }) => { gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
      >
        <Scene shelf={shelf} album={album} language={language} />
      </Canvas>

      <Controls getText={getText} />

      {shelf.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-sm italic tracking-wide text-black/40">
            {getText({ en: 'Opening the shelf…', no: 'Åpner hyllen…' })}
          </p>
        </div>
      )}

      {mode !== MODES.SHELF && !album && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-sm italic tracking-wide text-black/40">
            {getText({ en: 'Fetching the album…', no: 'Henter albumet…' })}
          </p>
        </div>
      )}
    </div>
  )
}
