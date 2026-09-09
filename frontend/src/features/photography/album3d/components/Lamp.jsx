import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useRef, useState } from 'react'
import { Color } from 'three'
import { useAlbumStore } from '../lib/store'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'

/** Seconds of darkness before the lamp is switched on. */
const SWITCH_ON_AT = 2.2
/** How long the filament takes to come up to temperature. */
const WARM_UP = 1.5

const WARM = new Color('#ffc78e')

/** Length of the pull cord hanging from the shade. */
const CORD_LEN = 0.42

/**
 * Peak output, in candela.
 *
 * three.js has used physical light units since r155, so this is not a 0-to-1
 * dial: illuminance falls off with the square of the distance, and the lamp is
 * a couple of metres from the shelf. Small numbers here leave the room black.
 */
const LAMP_CANDELA = 46

/** A weaker warm bounce, standing in for light coming back off the room. */
const BOUNCE_CANDELA = 9

/**
 * The room's only real light: a warm lamp off to the right of the bookcase.
 *
 * It starts off. Everything is lit by a dim ambient until it comes on, so the
 * lamp genuinely does the lighting rather than adding a tint on top of a scene
 * that was already bright — the shelf is gloomy first, then warm.
 */
export default function Lamp({ x = 0 }) {
  const light = useRef()
  const bounce = useRef()
  const glow = useRef()
  const filament = useRef()
  const cord = useRef()
  const elapsed = useRef(0)
  const level = useRef(0)

  const lampOn = useAlbumStore((s) => s.lampOn)
  const setLamp = useAlbumStore((s) => s.setLamp)
  const toggleLamp = useAlbumStore((s) => s.toggleLamp)
  const [pulled, setPulled] = useState(0)

  // Comes on by itself shortly after the page opens, unless it has already
  // been switched by hand.
  const touched = useRef(false)
  useEffect(() => {
    const t = setTimeout(() => { if (!touched.current) setLamp(true) }, SWITCH_ON_AT * 1000)
    return () => clearTimeout(t)
  }, [setLamp])

  const pull = (e) => {
    e.stopPropagation()
    touched.current = true
    setPulled(1)
    toggleLamp()
    setTimeout(() => setPulled(0), 180)
  }

  useFrame((_, delta) => {
    elapsed.current += delta
    const since = elapsed.current - SWITCH_ON_AT
    // Swells rather than snapping on, with a small flicker as the filament
    // catches. Switching it off lets it die away a little faster than it came
    // up, which is roughly what a warm filament does.
    const target = lampOn ? 1 : 0
    const rate = delta / (lampOn ? WARM_UP : WARM_UP * 0.55)
    level.current += Math.sign(target - level.current) * Math.min(rate, Math.abs(target - level.current))

    const t = level.current
    const eased = t * t * (3 - 2 * t)
    const catching = lampOn && t > 0 && t < 0.45
    const flicker = catching ? 1 + Math.sin(elapsed.current * 46) * 0.14 * (1 - t / 0.45) : 1
    const out = eased * flicker

    if (light.current) light.current.intensity = out * LAMP_CANDELA
    if (bounce.current) bounce.current.intensity = out * BOUNCE_CANDELA
    if (filament.current) filament.current.material.emissiveIntensity = out * 3.2
    if (glow.current) glow.current.material.opacity = out * 0.24
    if (cord.current) easing.damp(cord.current.position, 'y', -CORD_LEN / 2 - pulled * 0.09, 0.12, delta)
  })

  // Hung clear of the case and high enough to be in shot, so the cord is
  // something you can actually see and reach for.
  const y = PAGE_HEIGHT * 0.95
  const z = PAGE_WIDTH * 0.95

  return (
    <group position={[x, y, z]}>
      <pointLight ref={light} color={WARM} intensity={0} decay={2} />
      {/* Off to the other side, so the shelf is not lit from one point only. */}
      <pointLight ref={bounce} color="#ffdcbb" intensity={0} decay={2} position={[-3.4, 0.6, 1.2]} />

      {/* The bulb itself, so the light has somewhere to come from. */}
      <mesh ref={filament}>
        <sphereGeometry args={[0.075, 20, 16]} />
        <meshStandardMaterial color="#ffd9a8" emissive={WARM} emissiveIntensity={0} toneMapped={false} />
      </mesh>
      <mesh ref={glow}>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshBasicMaterial color={WARM} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* A shade above it, which is what makes the light read as a lamp. */}
      <mesh position={[0, 0.17, 0]}>
        <coneGeometry args={[0.3, 0.26, 24, 1, true]} />
        <meshStandardMaterial color="#8d6a44" roughness={0.8} side={2} />
      </mesh>

      {/* The pull cord. Generously sized where you grab it, since a two-
          centimetre string is not something anyone can hit with a pointer. */}
      <group ref={cord} position={[0.055, -CORD_LEN / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.006, 0.006, CORD_LEN, 6]} />
          <meshStandardMaterial color="#d8c9ae" roughness={0.9} />
        </mesh>
        <mesh position={[0, -CORD_LEN / 2, 0]}>
          <sphereGeometry args={[0.032, 14, 12]} />
          <meshStandardMaterial color="#c9a86d" roughness={0.55} metalness={0.35} />
        </mesh>
        <mesh
          position={[0, -CORD_LEN / 2, 0]}
          onClick={pull}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
          onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = '' }}
        >
          <sphereGeometry args={[0.13, 10, 8]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    </group>
  )
}
