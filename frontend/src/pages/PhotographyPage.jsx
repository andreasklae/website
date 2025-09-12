import { useLanguage } from '../contexts/LanguageContext'

const PhotographyPage = () => {
  const { getText } = useLanguage()

  return (
    <div className="min-h-screen bg-white animate-page-enter">
      <div className="max-w-4xl mx-auto px-6 pt-32 lg:pt-40 pb-12">
        {/* Old School Newspaper Style Header */}
        <div className="text-center mb-12">
          <div className="border-t-4 border-b-4 border-black py-4 mb-8">
            <h1 className="text-6xl md:text-8xl font-black text-black tracking-wider" style={{ fontFamily: 'serif' }}>
              {getText({ en: 'PHOTOGRAPHY', no: 'FOTO' })}
            </h1>
          </div>
          
          <div className="text-2xl md:text-3xl font-bold text-black mb-4" style={{ fontFamily: 'serif' }}>
            {getText({ en: 'UNDER CONSTRUCTION', no: 'UNDER OPPBYGGING' })}
          </div>
          
          <div className="text-lg text-black" style={{ fontFamily: 'serif' }}>
            {getText({ 
              en: 'Est. Completion: TBD', 
              no: 'Est. Ferdigstillelse: TBD' 
            })}
          </div>
        </div>

        {/* Newspaper Style Content */}
        <div className="border-t-2 border-b-2 border-black py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="border-l-4 border-black pl-4">
                <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'serif' }}>
                  {getText({ en: 'BREAKING NEWS', no: 'DAGENS NYHETER' })}
                </h3>
                <p className="text-sm text-black leading-relaxed" style={{ fontFamily: 'serif' }}>
                  {getText({ 
                    en: 'Photography portfolio undergoing complete reconstruction. New features and galleries coming soon.',
                    no: 'Fotoportefølje gjennomgår fullstendig rekonstruksjon. Nye funksjoner og gallerier kommer snart.'
                  })}
                </p>
              </div>
              
              <div className="border-l-4 border-black pl-4">
                <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'serif' }}>
                  {getText({ en: 'COMING SOON', no: 'KOMMER SNART' })}
                </h3>
                <ul className="text-sm text-black space-y-1" style={{ fontFamily: 'serif' }}>
                  <li>• {getText({ en: 'Interactive galleries', no: 'Interaktive gallerier' })}</li>
                  <li>• {getText({ en: 'Photo stories', no: 'Fotohistorier' })}</li>
                  <li>• {getText({ en: 'Behind the scenes', no: 'Bak kulissene' })}</li>
                  <li>• {getText({ en: 'Equipment showcase', no: 'Utstyrsshowcase' })}</li>
                </ul>
              </div>
            </div>

            {/* Center Column */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-black flex items-center justify-center mb-4">
                  <span className="text-white text-4xl font-bold" style={{ fontFamily: 'serif' }}>
                    📷
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-2" style={{ fontFamily: 'serif' }}>
                  {getText({ en: 'WORK IN PROGRESS', no: 'ARBEID PÅGÅR' })}
                </h3>
                <p className="text-sm text-black" style={{ fontFamily: 'serif' }}>
                  {getText({ 
                    en: 'Please check back later for updates.',
                    no: 'Vennligst sjekk tilbake senere for oppdateringer.'
                  })}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="border-r-4 border-black pr-4 text-right">
                <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'serif' }}>
                  {getText({ en: 'STATUS REPORT', no: 'STATUSRAPPORT' })}
                </h3>
                <p className="text-sm text-black leading-relaxed" style={{ fontFamily: 'serif' }}>
                  {getText({ 
                    en: 'Current phase: Design and development. Expected completion: To be announced.',
                    no: 'Nåværende fase: Design og utvikling. Forventet ferdigstillelse: TBA.'
                  })}
                </p>
              </div>
              
              <div className="border-r-4 border-black pr-4 text-right">
                <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: 'serif' }}>
                  {getText({ en: 'CONTACT', no: 'KONTAKT' })}
                </h3>
                <p className="text-sm text-black" style={{ fontFamily: 'serif' }}>
                  {getText({ 
                    en: 'For inquiries about photography services, please use the main contact form.',
                    no: 'For henvendelser om fototjenester, vennligst bruk hovedkontaktskjemaet.'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="text-4xl font-bold text-black mb-4" style={{ fontFamily: 'serif' }}>
            {getText({ en: 'THANK YOU FOR YOUR PATIENCE', no: 'TAKK FOR TÅLMODIGHETEN' })}
          </div>
          <div className="text-sm text-black" style={{ fontFamily: 'serif' }}>
            {getText({ 
              en: 'This section will be back online soon with exciting new content.',
              no: 'Denne seksjonen vil være tilbake på nettet snart med spennende nytt innhold.'
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotographyPage
