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

  if (webgl === null) return <div className="min-h-screen bg-[#f7f4ee]" />
  if (!webgl) return <LegacyPhotographyPage />

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f7f4ee] text-black animate-page-enter font-serif">
      <header className="mx-auto w-full max-w-6xl shrink-0 select-none px-6 pt-24 lg:pt-28">
        <div className="border-y border-black/80 py-3 text-center">
          <h1
            className="px-2 text-2xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            {getText({ en: 'Photography', no: 'Foto' }).toUpperCase()}
          </h1>
        </div>
        <p className="pt-3 text-center text-sm italic md:text-base" style={{ fontFamily: 'Georgia, serif' }}>
          {getText({
            en: 'Journals and highlights, kept as photo albums.',
            no: 'Journaler og høydepunkter, samlet som fotoalbum.',
          })}
        </p>
      </header>

      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <p className="text-sm italic tracking-wide text-black/40">
              {getText({ en: 'Opening the shelf…', no: 'Åpner hyllen…' })}
            </p>
          </div>
        }
      >
        <AlbumPortfolio language={language} getText={getText} />
      </Suspense>
    </div>
  )
}
