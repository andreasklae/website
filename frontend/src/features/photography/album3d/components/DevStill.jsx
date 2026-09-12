// A development aid: steps the render loop from a timer. ?still=1 to use it.
//
// The automated browser reports the page hidden, so requestAnimationFrame
// never fires and R3F draws exactly one frame — before Suspense has even
// resolved. Advancing the loop by hand runs every useFrame callback for real,
// so the camera eases to its shot and the lamp warms up, and a screenshot is
// then of the settled scene rather than of a camera caught mid-move. Without
// it there is no way to see this scene in an automated browser at all — the
// one frame that does render is drawn before Suspense has resolved, so the
// room is not even in it.
//
// It also switches the lamp on immediately, since the scene is otherwise dark
// for the first couple of seconds. Delete this file if it stops being useful;
// nothing but the query flag refers to it.
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useAlbumStore } from '../lib/store'

export default function Still() {
  const advance = useThree((s) => s.advance)
  const setFrameloop = useThree((s) => s.setFrameloop)

  useEffect(() => {
    setFrameloop('never')
    useAlbumStore.getState().setLamp(true)
    let t = performance.now()
    const id = setInterval(() => { t += 33; advance(t) }, 16)
    return () => { clearInterval(id); setFrameloop('always') }
  }, [advance, setFrameloop])

  return null
}
