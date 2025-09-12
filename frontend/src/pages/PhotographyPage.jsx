import { useLanguage } from '../contexts/LanguageContext'

const PhotographyPage = () => {
  const { getText } = useLanguage()

  return (
    <div className="min-h-screen bg-white animate-page-enter">
      <div className="max-w-4xl mx-auto px-6 pt-32 lg:pt-40 pb-12">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-black text-black tracking-wider mb-8" style={{ fontFamily: 'serif' }}>
            {getText({ en: 'PHOTOGRAPHY', no: 'FOTO' })}
          </h1>
          
          <div className="text-2xl md:text-3xl font-bold text-black mb-4" style={{ fontFamily: 'serif' }}>
            {getText({ 
              en: 'Photography portfolio is currently under construction. Check back soon!', 
              no: 'Fotoportefølje er for øyeblikket under oppbygging. Sjekk tilbake snart!' 
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotographyPage
