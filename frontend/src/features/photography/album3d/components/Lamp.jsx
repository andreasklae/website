import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Color } from 'three'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'

/** Seconds of darkness before the lamp is switched on. */
const SWITCH_ON_AT = 2.2
/** How long the filament takes to come up to temperature. */
const WARM_UP = 1.5

const WARM = new Color('#ffc78e')

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
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += delta
    const since = elapsed.current - SWITCH_ON_AT
    // Eased so it swells rather than snapping on, with a small flicker as it
    // catches, the way a filament does.
    const t = Math.max(0, Math.min(1, since / WARM_UP))
    const eased = t * t * (3 - 2 * t)
    const catchFlicker = t > 0 && t < 0.4 ? 1 + Math.sin(since * 46) * 0.13 * (1 - t / 0.4) : 1
    const level = eased * catchFlicker

    if (light.current) light.current.intensity = level * LAMP_CANDELA
    if (bounce.current) bounce.current.intensity = level * BOUNCE_CANDELA
    if (filament.current) filament.current.material.emissiveIntensity = level * 3.2
    if (glow.current) glow.current.material.opacity = level * 0.24
  })

  const y = PAGE_HEIGHT * 0.62
  const z = PAGE_WIDTH * 1.15

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
    </group>
  )
}
