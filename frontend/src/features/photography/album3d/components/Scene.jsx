import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import Shelf, { useShelfLayout } from './Shelf'
import ActiveAlbum from './ActiveAlbum'
import CameraRig from './CameraRig'
import { MODES, useAlbumStore } from '../lib/store'

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
  const mode = useAlbumStore((s) => s.mode)

  // The bound album outlives the selection: after it is put back it has to
  // turn all the way home before the shelved block takes over again. Without
  // this it would vanish mid-turn and the block would pop in square-on.
  const [residentId, setResidentId] = useState(null)
  useEffect(() => { if (activeId) setResidentId(activeId) }, [activeId])
  const retire = useCallback(() => setResidentId(null), [])

  const slot = layout.find((a) => a.id === residentId)
  // The block only stands down once there is a bound album ready to take its
  // place — the album's own data is fetched, so for a moment there is nothing
  // to hand over to.
  const handedOver = Boolean(slot && album && album.id === residentId)
  const slotIndex = slot ? layout.indexOf(slot) : -1
  const isActive = Boolean(activeId) && residentId === activeId

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
        <ShelfPan targetX={slot && isActive ? -slot.x : 0}>
          <Shelf
            layout={layout}
            language={language}
            activeId={mode === MODES.SHELF ? null : activeId}
            hiddenId={handedOver ? residentId : null}
            spread={mode === MODES.OPEN || mode === MODES.ZOOM}
          />
          {handedOver && (
            <group position={[slot.x, 0, 0]}>
              <ActiveAlbum
                album={album}
                language={language}
                index={slotIndex}
                active={isActive}
                onRetired={retire}
              />
            </group>
          )}
        </ShelfPan>
      </Suspense>
    </>
  )
}
