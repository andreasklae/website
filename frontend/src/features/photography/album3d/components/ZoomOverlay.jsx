import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useRef, useState } from 'react'
import { SRGBColorSpace, TextureLoader } from 'three'
import { assetUrl } from '../lib/textures'
import { PAGE_HEIGHT } from './Page'

const loader = new TextureLoader()

/** The overlay is decoration: it must never win a raycast. */
const NO_RAYCAST = () => null

/**
 * The hovered photograph, lifted off the page. Loads the 2400px derivative on
 * demand — these are large, so they are never fetched until something is
 * actually being looked at closely.
 */
export default function ZoomOverlay({ slot }) {
  const [texture, setTexture] = useState(null)
  const group = useRef()
  const { invalidate } = useThree()

  useEffect(() => {
    let cancelled = false
    const rel = slot.variants?.zoom || slot.variants?.page
    if (!rel) return
    loader.load(assetUrl(`albums/${rel}`), (tex) => {
      if (cancelled) { tex.dispose(); return }
      tex.colorSpace = SRGBColorSpace
      tex.anisotropy = 8
      setTexture(tex)
      invalidate()
    })
    return () => { cancelled = true }
  }, [slot, invalidate])

  useEffect(() => () => texture?.dispose(), [texture])

  // Grow into place rather than popping in.
  useFrame((_, delta) => {
    if (!group.current) return
    easing.damp3(group.current.scale, [1, 1, 1], 0.18, delta)
    easing.damp(group.current.position, 'z', 0.55, 0.18, delta)
  })

  const height = PAGE_HEIGHT * 1.02
  const width = height * (slot.aspect || 1.5)
  const border = Math.min(width, height) * 0.035

  return (
    <group ref={group} scale={[0.85, 0.85, 0.85]} position={[0, 0, 0.2]}>
      {/* Print border */}
      <mesh position={[0, -border * 0.3, -0.002]} raycast={NO_RAYCAST} renderOrder={10}>
        <planeGeometry args={[width + border * 2, height + border * 2.6]} />
        <meshBasicMaterial color="#fffdf8" toneMapped={false} depthTest={false} />
      </mesh>
      <mesh raycast={NO_RAYCAST} renderOrder={11}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture || null}
          color={texture ? '#ffffff' : (slot.color || '#cccccc')}
          toneMapped={false}
          depthTest={false}
        />
      </mesh>
    </group>
  )
}
