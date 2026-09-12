import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ACESFilmicToneMapping, Color } from 'three'
import Scene from './components/Scene'
import Controls from './components/Controls'
import PhotoOverlay from './components/PhotoOverlay'
import { useAlbumData } from './lib/useAlbumData'
import { ensureFonts } from './lib/fonts'
import { MODES, useAlbumStore } from './lib/store'
import { lampLevel } from './lib/lampLevel'

/** True when the device says the viewer prefers less motion. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function AlbumPortfolio({ language = 'en', getText = (t) => t.en }) {
  const { shelf, album } = useAlbumData()
  const mode = useAlbumStore((s) => s.mode)
  const setNarrow = useAlbumStore((s) => s.setNarrow)

  useEffect(() => { ensureFonts() }, [])

  // A two-page spread is unreadable below roughly a tablet, so the scene
  // switches to framing one page at a time. Driven by the canvas box rather
  // than a device sniff.
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 820 || window.innerWidth / window.innerHeight < 1.1)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [setNarrow])

  // Reset the scene when leaving the page so no textures outlive the route.
  useEffect(() => () => useAlbumStore.getState().close(), [])

  // Hand the WebGL context back when the route is left. A browser allows only
  // a handful at a time, and one left alive per visit eventually exhausts them
  // — after which nothing on the page can get a context at all and the whole
  // scene silently falls back to the flat page.
  const renderer = useRef(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => () => {
    renderer.current?.forceContextLoss?.()
    renderer.current?.dispose?.()
    renderer.current = null
  }, [])

  const dpr = useMemo(() => [1, prefersReducedMotion() ? 1.25 : 2], [])

  return (
    <div className="absolute inset-0 touch-pan-y">
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        camera={{ fov: 30, position: [0, 0.10, 3.35], near: 0.1, far: 40 }}
        key={attempt}
        onCreated={({ gl, scene, camera }) => {
          renderer.current = gl

          // A lost context is the one failure here that looks like nothing at
          // all: three carries on, draws nothing, and reports no error, so the
          // page is simply dark. It happens when a browser runs out of
          // contexts — it drops the oldest — or when the driver resets. Say so,
          // and build the scene again.
          const canvas = gl.domElement
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('[album3d] the WebGL context was lost; rebuilding the scene')
            setAttempt((n) => (n < 3 ? n + 1 : n))
          })

          if (import.meta.env?.DEV) {
            // Somewhere to look from the console when the scene is not
            // showing what it should.
            window.__album = { gl, scene, camera, lampLevel, store: useAlbumStore }
          }
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
          // An unlit room, not the page showing through the canvas.
          scene.background = new Color('#0b0a09')
        }}
      >
        <Scene shelf={shelf} album={album} language={language} />
      </Canvas>

      <Controls getText={getText} />
      <PhotoOverlay getText={getText} />

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
