import { lazy, Suspense, useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { supportsWebGL } from './album3d/supportsWebGL'
import LegacyPhotographyPage from '../../pages/PhotographyPage.jsx'

// three.js and the album scene are ~1 MB of the bundle. Nothing outside this
// route needs them, so they are fetched only once WebGL has been confirmed.
const AlbumPortfolio = lazy(() => import('./album3d/AlbumPortfolio'))

/**
 * The photography portfolio is a 3D shelf of albums. Devices without WebGL
 * fall back to the previous flat page, which stays a complete experience
 * rather than a stub.
 */
export default function PhotographyPage() {
  const { getText, language } = useLanguage()
  const [webgl, setWebgl] = useState(null)

  useEffect(() => { setWebgl(supportsWebGL()) }, [])

  if (webgl === null) return <div className="min-h-screen bg-[#14110e]" />
  if (!webgl) return <LegacyPhotographyPage />

  return (
    // The room is the page: it fills the viewport and everything else floats
    // over it, so the title reads as something in the room rather than a
    // banner sitting above a picture of one.
    <div className="relative h-screen w-full overflow-hidden bg-[#14110e] text-[#f2e7d6] animate-page-enter font-serif">
      <Suspense
        fallback={<div className="absolute inset-0 bg-[#14110e]" />}
      >
        <AlbumPortfolio language={language} getText={getText} />
      </Suspense>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-24 text-center lg:pt-28">
        <h1
          className="text-2xl font-extrabold tracking-[0.18em] text-[#f4e6cd] sm:text-3xl md:text-4xl"
          style={{
            fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
            // Lit from the lamp's side, and sitting on its own shadow so it
            // stays legible over whatever is behind it.
            textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 0 46px rgba(255,180,110,0.28)',
          }}
        >
          {getText({ en: 'Photography', no: 'Foto' }).toUpperCase()}
        </h1>
        <p
          className="pt-2 text-sm italic text-[#e9dcc7]/65 md:text-base"
          style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
        >
          {getText({
            en: 'Journals and highlights, kept as photo albums.',
            no: 'Journaler og høydepunkter, samlet som fotoalbum.',
          })}
        </p>
      </header>
    </div>
  )
}
