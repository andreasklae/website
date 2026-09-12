/** Cheap WebGL capability probe, kept free of any three.js import. */

let cached = null

/**
 * Whether this browser can render the album scene.
 *
 * Two things here are deliberate, and both were bugs.
 *
 * The probe RELEASES its context. A browser allows only a handful of live
 * WebGL contexts per page — around sixteen in Chrome — and a context created
 * by `getContext` stays alive until it is collected, which may be a long time.
 * Probing on every visit to the route therefore burns through the budget, and
 * once it is gone `getContext` starts returning null for everyone, including
 * the scene itself.
 *
 * And the answer is CACHED, so a single unlucky probe cannot condemn the rest
 * of the session to the fallback page. Whether a browser supports WebGL does
 * not change while it is open; whether a context can be created right now
 * does, and that is not the question being asked.
 */
export function supportsWebGL() {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    cached = Boolean(gl)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return cached
  } catch {
    cached = false
    return false
  }
}
