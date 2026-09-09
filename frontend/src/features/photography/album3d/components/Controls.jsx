import { useEffect } from 'react'
import { MODES, useAlbumStore } from '../lib/store'

const btn =
  'pointer-events-auto select-none rounded-full border border-black/15 bg-[#f6f2e9]/90 px-5 py-2 ' +
  'text-sm tracking-wide text-black/75 shadow-sm backdrop-blur transition ' +
  'hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-35'

export default function Controls({ getText }) {
  const mode = useAlbumStore((s) => s.mode)
  const page = useAlbumStore((s) => s.page)
  const album = useAlbumStore((s) => s.album)
  const next = useAlbumStore((s) => s.next)
  const prev = useAlbumStore((s) => s.prev)
  const close = useAlbumStore((s) => s.close)

  const reading = mode === MODES.OPEN || mode === MODES.ZOOM
  const sheets = album?.sheets.length ?? 0

  // Keyboard is the natural way to read a book; wire it up alongside the buttons.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, close])

  if (mode === MODES.SHELF) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <p className="text-sm italic tracking-wide text-black/45">
          {getText({ en: 'Pick an album from the shelf', no: 'Velg et album fra hyllen' })}
        </p>
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 px-4">
      {reading && sheets > 0 && (
        <div className="pointer-events-none flex items-center gap-3 text-xs tracking-widest text-black/40">
          <span>{String(page).padStart(2, '0')}</span>
          <span className="h-px w-24 bg-black/15">
            <span className="block h-px bg-black/45 transition-all" style={{ width: `${(page / sheets) * 100}%` }} />
          </span>
          <span>{String(sheets).padStart(2, '0')}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button className={btn} onClick={prev} disabled={!reading || page <= 0}>
          {getText({ en: '← Back', no: '← Tilbake' })}
        </button>
        <button className={btn} onClick={close}>
          {getText({ en: 'Put away', no: 'Legg tilbake' })}
        </button>
        <button className={btn} onClick={next} disabled={!reading || page >= sheets}>
          {getText({ en: 'Forward →', no: 'Fram →' })}
        </button>
      </div>
    </div>
  )
}
