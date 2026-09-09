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
 * A single photograph, whole and uncropped.
 *
 * A hover zoom must not take the pointer. This overlay sits on top of the
 * canvas, so capturing pointer events would fire pointerleave on the page
 * beneath, dismiss the zoom, remount the canvas hover and re-open it — a
 * flicker loop. Hover zooms are therefore inert and dismissed by moving off
 * the photograph; tap zooms own the pointer and get a real close button.
 */
function ZoomView({ slot, source, onClose, getText }) {
  const byHover = source === 'hover'
  return (
    <motion.div
      key="zoom"
      className={`absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 p-4 ${
        byHover ? 'pointer-events-none' : ''
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={byHover ? undefined : onClose}
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
      {!byHover && (
        <div className="relative">
          <CloseButton onClick={onClose} label={getText({ en: 'Close', no: 'Lukk' })} />
        </div>
      )}
    </motion.div>
  )
}

/** One card in the held stack. Only the front card is draggable. */
function StackCard({ photo, index, isFront, box, onSendToBack, children }) {
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

  return (
    <motion.div
      className={`absolute ${isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{
        width: box.w,
        height: box.h,
        x: isFront ? x : 0,
        y: isFront ? y : 0,
        rotateX: isFront ? rotateX : 0,
        rotateY: isFront ? rotateY : 0,
        zIndex: 100 - index,
      }}
      drag={isFront}
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

/**
 * A stack lifted off the page. Drag or swipe the top print away to reach the
 * one beneath; on a phone the arrows do the same thing without a gesture.
 */
function StackView({ slot, onClose, getText }) {
  const [order, setOrder] = useState(() => slot.photos.map((_, i) => i))

  useEffect(() => { setOrder(slot.photos.map((_, i) => i)) }, [slot])

  const sendToBack = useCallback(() => {
    setOrder((prev) => (prev.length < 2 ? prev : [...prev.slice(1), prev[0]]))
  }, [])

  const bringToFront = useCallback(() => {
    setOrder((prev) => (prev.length < 2 ? prev : [prev[prev.length - 1], ...prev.slice(0, -1)]))
  }, [])

  const front = slot.photos[order[0]]

  // The card box takes the front photograph's own shape, so nothing is
  // cropped, and it is capped to the viewport on both axes.
  const box = useMemo(() => {
    const aspect = front?.aspect || 1.5
    const maxW = Math.min(window.innerWidth * 0.78, 560)
    const maxH = Math.min(window.innerHeight * 0.6, 620)
    let w = maxW
    let h = w / aspect
    if (h > maxH) { h = maxH; w = h * aspect }
    return { w: Math.round(w), h: Math.round(h) }
  }, [front])

  // Only the nearest few cards are mounted; a 40-photo stack does not need 40
  // DOM nodes to look like a pile.
  const visible = order.slice(0, 5)

  return (
    <motion.div
      key="stack"
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#171512]/80 backdrop-blur-[3px]" />

      <motion.div
        className="relative"
        style={{ width: box.w, height: box.h, perspective: 1200 }}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        {visible.map((photoIndex, i) => (
          <StackCard
            key={photoIndex}
            photo={slot.photos[photoIndex]}
            index={i}
            isFront={i === 0}
            box={box}
            onSendToBack={sendToBack}
          >
            <PrintFrame className="h-full w-full">
              <img
                src={variantUrl(slot.photos[photoIndex], 'page', 'thumb')}
                alt=""
                draggable={false}
                className="pointer-events-none h-full w-full object-cover"
              />
            </PrintFrame>
          </StackCard>
        ))}
      </motion.div>

      <div className="relative flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs tracking-widest text-white/45">
          {order.length ? `${(order[0] ?? 0) + 1} / ${slot.photos.length}` : ''}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={bringToFront}
            aria-label={getText({ en: 'Previous photo', no: 'Forrige bilde' })}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25
                       bg-black/45 text-white/90 backdrop-blur transition hover:bg-black/70 active:scale-95"
          >
            ←
          </button>
          <CloseButton onClick={onClose} label={getText({ en: 'Put back', no: 'Legg tilbake' })} />
          <button
            onClick={sendToBack}
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
  const zoomSource = useAlbumStore((s) => s.zoomSource)
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
      {active === 'zoom' && (
        <ZoomView slot={zoomed} source={zoomSource} onClose={close} getText={getText} />
      )}
    </AnimatePresence>
  )
}
