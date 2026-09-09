import { useEffect } from 'react'
import { MODES, lastSpread, useAlbumStore } from '../lib/store'

// Touch targets are >=44px tall; the shelf is usable with a thumb.
const btn =
  'pointer-events-auto select-none rounded-full border border-white/20 bg-black/40 ' +
  'px-5 py-3 text-sm tracking-wide text-[#f2e7d6] shadow-sm backdrop-blur transition ' +
  'hover:bg-black/65 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-35'

const primary =
  'pointer-events-auto select-none rounded-full border border-[#ffc78e]/50 bg-[#ffc78e]/90 ' +
  'px-6 py-3 text-sm tracking-wide text-[#2b2117] shadow-md transition ' +
  'hover:bg-[#ffd6a8] active:scale-95'

export default function Controls({ getText }) {
  const mode = useAlbumStore((s) => s.mode)
  const page = useAlbumStore((s) => s.page)
  const album = useAlbumStore((s) => s.album)
  const narrow = useAlbumStore((s) => s.narrow)
  const side = useAlbumStore((s) => s.side)
  const next = useAlbumStore((s) => s.next)
  const prev = useAlbumStore((s) => s.prev)
  const open = useAlbumStore((s) => s.open)
  const closeBook = useAlbumStore((s) => s.closeBook)
  const close = useAlbumStore((s) => s.close)

  const reading = mode === MODES.OPEN || mode === MODES.ZOOM
  const sheets = album ? lastSpread(album) : 0

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Enter' && mode === MODES.COVER) open()
      else if (e.key === 'Escape') reading ? closeBook() : close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, open, close, closeBook, mode, reading])

  const atStart = page <= 0 && (!narrow || side === 'left')
  const atEnd = page >= sheets && (!narrow || side === 'right')

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-3 px-4 sm:bottom-8">
      {mode === MODES.SHELF && (
        <p className="text-sm italic tracking-wide text-[#e9dcc7]/70">
          {getText({ en: 'Pick an album from the shelf', no: 'Velg et album fra hyllen' })}
        </p>
      )}

      {mode === MODES.COVER && (
        <>
          <p className="text-center text-xs italic tracking-wide text-[#e9dcc7]/55">
            {getText({
              en: 'Or pick another album from the shelf',
              no: 'Eller velg et annet album fra hyllen',
            })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className={primary} onClick={open} disabled={!album}>
              {getText({ en: 'Open album', no: 'Åpne albumet' })}
            </button>
            <button className={btn} onClick={close}>
              {getText({ en: 'Put back', no: 'Sett tilbake' })}
            </button>
          </div>
        </>
      )}

      {reading && (
        <>
          {sheets > 0 && (
            <div className="flex items-center gap-3 text-xs tracking-widest text-[#e9dcc7]/55">
              <span>{String(page).padStart(2, '0')}</span>
              <span className="block h-px w-20 bg-black/15 sm:w-24">
                <span
                  className="block h-px bg-[#ffc78e]/80 transition-all"
                  style={{ width: `${(page / sheets) * 100}%` }}
                />
              </span>
              <span>{String(sheets).padStart(2, '0')}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button className={btn} onClick={prev} disabled={atStart}>
              {getText({ en: '← Back', no: '← Tilbake' })}
            </button>
            <button className={btn} onClick={closeBook}>
              {getText({ en: 'Close album', no: 'Lukk albumet' })}
            </button>
            <button className={btn} onClick={next} disabled={atEnd}>
              {getText({ en: 'Forward →', no: 'Fram →' })}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
