import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAlbumStore } from '../lib/store'
import { variantUrl } from '../lib/assetUrl'

// The stack's drag/tilt/send-to-back behaviour is adapted from the
// image-stack-carousel component, ported off Next.js and TypeScript (this app
// is Vite + JSX) and restyled to match the printed photographs on the album
// pages rather than the original rounded dark cards.
const STACK = {
  swipeThreshold: 110,
  stackRotation: 5,
  stackScale: 0.035,
  tiltStrength: 22,
  springStiffness: 300,
  springDamping: 30,
}

/** The white print border the album uses, as a DOM frame. */
function PrintFrame({ children, className = '', style }) {
  return (
    <div
      className={`bg-[#fffdf8] p-[2.4%] pb-[3.4%] shadow-[0_18px_50px_rgba(0,0,0,0.45)] ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

function CloseButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto flex h-12 min-w-12 items-center justify-center gap-2 rounded-full
                 border border-white/25 bg-black/45 px-5 text-sm tracking-wide text-white/90
                 backdrop-blur transition hover:bg-black/70 active:scale-95"
    >
      {label}
    </button>
  )
}

/**
 * A single photograph, whole and uncropped. Only ever opened by a deliberate
 * click or tap — hovering leans the camera in on the page instead — so this
 * always owns the pointer and always offers a way out.
 */
function ZoomView({ slot, onClose, getText }) {
  return (
    <motion.div
      key="zoom"
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#171512]/78 backdrop-blur-[3px]" />
      <motion.div
        className="relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <PrintFrame>
          {/* Sized so the WHOLE frame — border included — fits the viewport. */}
          <img
            src={variantUrl(slot, 'zoom', 'page', 'thumb')}
            alt=""
            draggable={false}
            className="block max-h-[76vh] max-w-[88vw] object-contain"
          />
        </PrintFrame>
      </motion.div>
      <div className="relative">
        <CloseButton onClick={onClose} label={getText({ en: 'Close', no: 'Lukk' })} />
      </div>
    </motion.div>
  )
}

/** Where a print sits once it has been thrown clear of the pile. */
const flungPose = (direction, box) => ({
  x: direction * (box.w + 220),
  y: -40,
  rotate: direction * 18,
  opacity: 0.9,
})

const RESTING = { x: 0, y: 0, rotate: 0, opacity: 1 }

/**
 * One print in the pile.
 *
 * Three states, because a print is doing one of three things: sitting in the
 * pile, being dragged off the top of it, or travelling. Only the top print
 * carries the drag motion values — leaving them on a print that is travelling
 * pins it where the pointer left it, which is what made a thrown print fly out
 * and then simply vanish instead of landing at the back.
 */
function StackCard({ index, isFront, box, thrown, entering, direction, onSendToBack, children }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-200, 200], [STACK.tiltStrength, -STACK.tiltStrength])
  const rotateY = useTransform(x, [-200, 200], [-STACK.tiltStrength, STACK.tiltStrength])

  const handleDragEnd = (_, info) => {
    const far =
      Math.abs(info.offset.x) > STACK.swipeThreshold ||
      Math.abs(info.offset.y) > STACK.swipeThreshold
    if (far) onSendToBack()
    else { x.set(0); y.set(0) }
  }

  const draggable = isFront && !thrown && !entering

  return (
    <motion.div
      className={`absolute ${draggable ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{
        width: box.w,
        height: box.h,
        zIndex: 100 - index,
        ...(draggable ? { x, y, rotateX, rotateY } : null),
      }}
      animate={thrown || entering === 'out' ? flungPose(direction, box) : draggable ? undefined : RESTING}
      // An arriving print is placed at the throw position with no animation and
      // then eased home: the same movement as a throw, run backwards.
      transition={
        entering === 'out'
          ? { duration: 0 }
          : { type: 'spring', stiffness: STACK.springStiffness, damping: STACK.springDamping }
      }
      drag={draggable}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.55}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        className="h-full w-full"
        animate={{
          rotateZ: index * STACK.stackRotation,
          scale: 1 - index * STACK.stackScale,
          transformOrigin: '85% 85%',
        }}
        initial={false}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

const isLandscape = (photo) => (photo?.aspect || 1.5) >= 1

/**
 * The pile's physical print size. Every print in a stack is the same piece of
 * paper, so this never changes — what changes is which way up the pile is
 * being held.
 */
function printSize() {
  const maxW = Math.min(window.innerWidth * 0.62, 420)
  const maxH = Math.min(window.innerHeight * 0.56, 600)
  let w = maxW
  let h = w / (2 / 3)
  if (h > maxH) { h = maxH; w = h * (2 / 3) }
  return { w: Math.round(w), h: Math.round(h) }
}

/**
 * One print in the pile.
 *
 * Prints are stored portrait, so a landscape photograph lies on its side on
 * the paper — turned a quarter turn to fit, exactly as it would in a real
 * album. Its image element is therefore sized to the card's swapped dimensions
 * and rotated back.
 */
function StackPrint({ photo, box }) {
  const pad = Math.round(box.w * 0.028)
  const lip = Math.round(box.w * 0.055)
  const inner = { w: box.w - pad * 2, h: box.h - pad - lip }
  const turned = isLandscape(photo)

  return (
    <div
      className="h-full w-full bg-[#fffdf8] shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
      style={{ padding: `${pad}px ${pad}px ${lip}px` }}
    >
      <div className="relative overflow-hidden" style={{ width: inner.w, height: inner.h }}>
        <img
          src={variantUrl(photo, 'page', 'thumb')}
          alt=""
          draggable={false}
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none object-cover"
          style={{
            width: turned ? inner.h : inner.w,
            height: turned ? inner.w : inner.h,
            transform: `translate(-50%, -50%) rotate(${turned ? 90 : 0}deg)`,
          }}
        />
      </div>
    </div>
  )
}

/**
 * A stack lifted off the page. Drag or swipe the top print away to reach the
 * one beneath; the arrows fling it the same way, so a phone needs no gesture.
 *
 * Mixed orientations work the way they would in your hands: landscape shots
 * lie sideways on their portrait paper, and when one reaches the top the whole
 * pile is turned a quarter turn to read it — which leaves the portrait shots
 * behind it lying sideways instead. Turning back happens on the way out.
 */
function StackView({ slot, onClose, getText }) {
  const [order, setOrder] = useState(() => slot.photos.map((_, i) => i))
  /**
   * Whichever print is travelling, and which way.
   *
   * Forward and back are the same movement in opposite senses: forward throws
   * the top print clear and it lands at the back; back takes the print at the
   * back and runs that same throw in reverse to bring it to the front. Playing
   * the forward animation for "back" looks like taking a photograph off the
   * front of the pile to reach one that was behind it, which is not what
   * happened.
   */
  const [travel, setTravel] = useState(null)

  useEffect(() => {
    setOrder(slot.photos.map((_, i) => i))
    setTravel(null)
  }, [slot])

  const box = useMemo(printSize, [])
  const front = slot.photos[order[0]]
  const pileRotation = isLandscape(front) ? -90 : 0

  const forward = useCallback(() => {
    if (travel) return
    const leaving = order[0]
    setTravel({ id: leaving, phase: 'throwing', direction: 1 })
    setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]])
      setTravel(null) // now at the back, and eases home from where it was thrown
    }, 200)
  }, [travel, order])

  const back = useCallback(() => {
    if (travel) return
    const arriving = order[order.length - 1]
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)])
    // Placed where a thrown print ends up, then eased in: the throw, reversed.
    setTravel({ id: arriving, phase: 'out', direction: 1 })
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setTravel({ id: arriving, phase: 'in', direction: 1 }))
    )
    setTimeout(() => setTravel(null), 420)
  }, [travel, order])

  const sendToBack = useCallback(() => {
    setOrder((o) => [...o.slice(1), o[0]])
    setTravel(null)
  }, [])

  const visible = order.slice(0, 5)
  // Square frame so the row below does not shift as the pile turns.
  const side = Math.max(box.w, box.h)

  return (
    <motion.div
      key="stack"
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#171512]/80 backdrop-blur-[3px]" />

      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: side, height: side, perspective: 1200 }}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: pileRotation }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {visible.map((photoIndex, i) => (
          <StackCard
            key={photoIndex}
            index={i}
            isFront={i === 0}
            box={box}
            thrown={travel?.id === photoIndex && travel.phase === 'throwing'}
            entering={travel?.id === photoIndex && travel.phase !== 'throwing' ? travel.phase : null}
            direction={travel?.direction ?? 1}
            onSendToBack={sendToBack}
          >
            <StackPrint photo={slot.photos[photoIndex]} box={box} />
          </StackCard>
        ))}
      </motion.div>

      <div className="relative flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs tracking-widest text-white/45">
          {`${(order[0] ?? 0) + 1} / ${slot.photos.length}`}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            aria-label={getText({ en: 'Previous photo', no: 'Forrige bilde' })}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25
                       bg-black/45 text-white/90 backdrop-blur transition hover:bg-black/70 active:scale-95"
          >
            ←
          </button>
          <CloseButton onClick={onClose} label={getText({ en: 'Put back', no: 'Legg tilbake' })} />
          <button
            onClick={forward}
            aria-label={getText({ en: 'Next photo', no: 'Neste bilde' })}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25
                       bg-black/45 text-white/90 backdrop-blur transition hover:bg-black/70 active:scale-95"
          >
            →
          </button>
        </div>
        <p className="hidden text-[11px] tracking-wide text-white/30 sm:block">
          {getText({ en: 'Drag the top photo away to see the next', no: 'Dra det øverste bildet vekk for å se det neste' })}
        </p>
      </div>
    </motion.div>
  )
}

/**
 * Enlarged photographs and picked-up stacks live in the DOM rather than the
 * 3D scene: it keeps them pixel-sharp, guarantees they fit the viewport, and
 * gives phones real buttons to dismiss with.
 */
export default function PhotoOverlay({ getText }) {
  const zoomed = useAlbumStore((s) => s.zoomed)
  const heldStack = useAlbumStore((s) => s.heldStack)
  const unzoom = useAlbumStore((s) => s.unzoom)
  const putBackStack = useAlbumStore((s) => s.putBackStack)

  const active = heldStack ? 'stack' : zoomed ? 'zoom' : null
  const close = useCallback(() => {
    if (heldStack) putBackStack()
    else unzoom()
  }, [heldStack, putBackStack, unzoom])

  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [active, close])

  return (
    <AnimatePresence>
      {active === 'stack' && <StackView slot={heldStack} onClose={close} getText={getText} />}
      {active === 'zoom' && <ZoomView slot={zoomed} onClose={close} getText={getText} />}
    </AnimatePresence>
  )
}
