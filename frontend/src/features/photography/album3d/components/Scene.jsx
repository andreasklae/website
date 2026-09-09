import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import Shelf, { useShelfLayout } from './Shelf'
import CameraRig from './CameraRig'
import { useAlbumStore } from '../lib/store'

/**
 * Slides the whole row so the chosen album ends up dead centre. Panning the
 * shelf rather than the camera keeps framing identical whichever album is
 * picked — which matters most on a phone, where there is no room to spare.
 */
function ShelfPan({ targetX, children }) {
  const group = useRef()
  useFrame((_, delta) => {
    if (group.current) easing.damp(group.current.position, 'x', targetX, 0.4, delta)
  })
  return <group ref={group}>{children}</group>
}

export default function Scene({ shelf, album, language }) {
  const layout = useShelfLayout(shelf)
  const shelfWidth = layout.reduce((n, a) => n + a.thickness, 0) + 0.055 * Math.max(0, layout.length - 1)
  const activeId = useAlbumStore((s) => s.activeId)
  const hoveredId = useAlbumStore((s) => s.hoveredAlbum)
  const slot = layout.find((a) => a.id === activeId)

  return (
    <>
      <CameraRig shelfWidth={shelfWidth} />

      {/*
        Deliberately cheap lighting: an ambient fill plus two directionals and
        no shadow maps at all. Shadow maps are what cost frames here, and the
        leaf curl already reads from geometry alone.
      */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.5} />
      <directionalLight position={[-3, 2, 2]} intensity={0.55} color="#ffe9d0" />

      <Suspense fallback={null}>
        <ShelfPan targetX={slot ? -slot.x : 0}>
          <Shelf
            layout={layout}
            language={language}
            activeId={activeId}
            hoveredId={hoveredId}
            full={album}
          />
        </ShelfPan>
      </Suspense>
    </>
  )
}
