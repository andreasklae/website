import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useEffect, useRef, useState } from 'react'
import { Color } from 'three'
import { MODES, useAlbumStore } from '../lib/store'
import { lampLevel } from '../lib/lampLevel'
import { PAGE_HEIGHT, PAGE_WIDTH } from './Page'

/** Seconds of darkness before the lamp is switched on. */
const SWITCH_ON_AT = 2.2
/** How long the filament takes to come up to temperature. */
const WARM_UP = 1.5

const WARM = new Color('#ffc78e')

/** Length of the pull cord hanging from the shade. */
const CORD_LEN = 0.42

/** How far the fitting rises out of shot while an album is being read. */
const STOW_HEIGHT = 2.6

/**
 * Peak output, in candela.
 *
 * three.js has used physical light units since r155, so this is not a 0-to-1
 * dial: illuminance falls off with the square of the distance, and the lamp is
 * a couple of metres from the shelf. Small numbers here leave the room black.
 */
const LAMP_CANDELA = 58

/** A weaker warm bounce, standing in for light coming back off the room. */
const BOUNCE_CANDELA = 12

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
  const fixture = useRef()
  const elapsed = useRef(0)
  const level = useRef(0)

  const lampOn = useAlbumStore((s) => s.lampOn)
  const mode = useAlbumStore((s) => s.mode)
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

    lampLevel.value = out

    if (light.current) light.current.intensity = out * LAMP_CANDELA
    if (bounce.current) bounce.current.intensity = out * BOUNCE_CANDELA
    if (filament.current) filament.current.material.emissiveIntensity = out * 3.2
    if (glow.current) glow.current.material.opacity = out * 0.24
    if (cord.current) easing.damp(cord.current.position, 'y', -CORD_LEN / 2 - pulled * 0.09, 0.12, delta)

    // Once an album is out of the shelf the camera is looking past the lamp,
    // and a shade hanging across the page you are reading is just in the way.
    // The fitting lifts up out of shot; its light stays exactly where it was,
    // so nothing about the room's lighting changes as it goes.
    if (fixture.current) {
      const stowed = mode !== MODES.SHELF
      easing.damp(fixture.current.position, 'y', stowed ? STOW_HEIGHT : 0, 0.5, delta)
    }
  })

  // Hung clear of the case, high on the left, where it is in shot and the cord
  // can be reached. Off to one side rather than overhead so the shelf is lit
  // across its face rather than straight down it.
  // Low enough to clear the navbar floating at the top of the page, and far
  // enough forward to hang beside the case rather than inside it.
  const y = PAGE_HEIGHT * 0.08
  const z = PAGE_WIDTH * 1.3

  return (
    <group position={[x, y, z]}>
      {/* Both lights sit OUTSIDE the fitting, which rises out of shot while an
          album is being read — the room's lighting must not change when it
          does. */}
      <pointLight ref={light} color={WARM} intensity={0} decay={2} />
      {/* Off to the other side, so the shelf is not lit from one point only. */}
      <pointLight ref={bounce} color="#ffdcbb" intensity={0} decay={2} position={[-4.2, 0.6, 1.2]} />

      <group ref={fixture}>
        {/* The bulb itself, so the light has somewhere to come from. */}
        <mesh ref={filament}>
          <sphereGeometry args={[0.075, 20, 16]} />
          <meshStandardMaterial color="#ffd9a8" emissive={WARM} emissiveIntensity={0} toneMapped={false} />
        </mesh>
        <mesh ref={glow}>
          <sphereGeometry args={[0.2, 20, 16]} />
          <meshBasicMaterial color={WARM} transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* The flex it hangs by, running up out of shot. */}
        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 3.4, 6]} />
          <meshStandardMaterial color="#2e2721" roughness={0.9} />
        </mesh>

        {/* A shade above it, which is what makes the light read as a lamp. */}
        <mesh position={[0, 0.19, 0]}>
          <coneGeometry args={[0.33, 0.3, 24, 1, true]} />
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
    </group>
  )
}
