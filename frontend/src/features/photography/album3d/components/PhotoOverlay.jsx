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

/**
 * One card in the held stack. Only the front card is draggable.
 *
 * `fling` lets the buttons throw the card the same way a drag does, so
 * pressing an arrow and swiping produce the same motion rather than one
 * animating and the other cutting.
 */
function StackCard({ index, isFront, box, fling, onSendToBack, children }) {
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

  const thrown = isFront && fling
  return (
    <motion.div
      className={`absolute ${isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{
        width: box.w,
        height: box.h,
        x: isFront && !thrown ? x : 0,
        y: isFront && !thrown ? y : 0,
        rotateX: isFront && !thrown ? rotateX : 0,
        rotateY: isFront && !thrown ? rotateY : 0,
        zIndex: 100 - index,
      }}
      animate={thrown ? { x: fling * (box.w + 220), y: -40, rotate: fling * 18, opacity: 0.85 } : {}}
      drag={isFront && !thrown}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.55}
      onDragEnd={handleDragEnd}
      transition={{ type: 'spring', stiffness: STACK.springStiffness, damping: STACK.springDamping }}
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
  const [fling, setFling] = useState(0)

  useEffect(() => {
    setOrder(slot.photos.map((_, i) => i))
    setFling(0)
  }, [slot])

  const box = useMemo(printSize, [])
  const front = slot.photos[order[0]]

  // Turning the pile is what makes the front print upright: its image is
  // already rotated on the paper, so this cancels it out.
  const pileRotation = isLandscape(front) ? -90 : 0

  const settle = useCallback((nextOrder) => {
    setOrder(nextOrder)
    setFling(0)
  }, [])

  const sendToBack = useCallback(() => {
    settle([...order.slice(1), order[0]])
  }, [order, settle])

  const advance = useCallback((direction) => {
    if (fling) return
    setFling(direction)
    const current = order
    // Let the throw play out before the pile re-forms behind it.
    setTimeout(() => {
      settle(direction > 0
        ? [...current.slice(1), current[0]]
        : [current[current.length - 1], ...current.slice(0, -1)])
    }, 220)
  }, [fling, order, settle])

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
            fling={i === 0 ? fling : 0}
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
            onClick={() => advance(-1)}
            aria-label={getText({ en: 'Previous photo', no: 'Forrige bilde' })}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25
                       bg-black/45 text-white/90 backdrop-blur transition hover:bg-black/70 active:scale-95"
          >
            ←
          </button>
          <CloseButton onClick={onClose} label={getText({ en: 'Put back', no: 'Legg tilbake' })} />
          <button
            onClick={() => advance(1)}
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
