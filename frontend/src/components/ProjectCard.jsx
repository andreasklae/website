import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProjectPhotos } from '../utils/data.jsx'
import ImageCarousel from './ImageCarousel'
import CircularCarousel from './CircularCarousel'
import Tag from './Tag'

const ProjectCard = ({ project }) => {
  const { getText } = useLanguage()
  const [showCarousel, setShowCarousel] = useState(false)
  const [projectPhotos, setProjectPhotos] = useState([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  // Load photos dynamically from photos-manifest.json
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setPhotosLoading(true)
        const photos = await getProjectPhotos(project.id)
        setProjectPhotos(photos)
      } catch (error) {
        console.error('Error loading project photos:', error)
        setProjectPhotos([])
      } finally {
        setPhotosLoading(false)
      }
    }

    loadPhotos()
  }, [project.id])

  const handleDownloadPDF = () => {
    if (project.pdfReport) {
      // Encode the URL to handle spaces and special characters
      const encodedUrl = project.pdfReport.split('/').map(part => encodeURIComponent(part)).join('/')
      window.open(encodedUrl, '_blank')
    }
  }

  const handleDownloadAward = () => {
    if (project.pdfAward) {
      // Encode the URL to handle spaces and special characters
      const encodedUrl = project.pdfAward.split('/').map(part => encodeURIComponent(part)).join('/')
      window.open(encodedUrl, '_blank')
    }
  }

  const handleVisitWebsite = () => {
    if (project.link) {
      window.open(project.link, '_blank')
    }
  }

  return (
    <>
      <div id={project.id} className="group w-full max-w-full overflow-hidden glass-bubble bg-ide-surface/80 border border-ide-border/50" style={{ borderRadius: '2rem' }}>
        {/* Project Header */}
        <div className="mb-4 mx-6 mt-6">
          <h3 className="text-2xl font-semibold text-white">
            {getText(project.title)}
          </h3>
        </div>

        {/* Project Description */}
        <p className="text-ide-text mb-6 text-xl leading-relaxed text-wrap break-words mx-6">
          {getText(project.description)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 mx-6">
          {project.tags.map((tag, index) => (
            <Tag key={index} size="sm" variant="default">
              {tag}
            </Tag>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6 mx-6">
          {project.type === 'website' ? (
            <button
              onClick={handleVisitWebsite}
              className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderColor: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '2rem',
                color: '#4ade80',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span>{getText({ en: 'Visit Website', no: 'Besøk nettside' })}</span>
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          ) : (
            <>
              {project.pdfReport && (
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(251, 146, 60, 0.15)',
                    borderColor: 'rgba(251, 146, 60, 0.2)',
                    borderRadius: '2rem',
                    color: '#fb923c',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span>{getText({ en: 'Project Paper', no: 'Prosjektrapport' })}</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              )}
              {project.pdfAward && (
                <button
                  onClick={handleDownloadAward}
                  className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    borderColor: 'rgba(168, 85, 247, 0.2)',
                    borderRadius: '2rem',
                    color: '#a855f7',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span>{getText({ en: 'View Award', no: 'Se pris' })}</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </button>
              )}
              {project.githubLink && (
              <button
                  onClick={() => window.open(project.githubLink, '_blank')}
                  className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.15)',
                    borderColor: 'rgba(107, 114, 128, 0.2)',
                    borderRadius: '2rem',
                    color: '#9ca3af',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span>GitHub</span>
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
              </button>
              )}
              {project.researchPaperLink && (
                <button
                  onClick={() => window.open(project.researchPaperLink, '_blank')}
                  className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    borderColor: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '2rem',
                    color: '#86efac',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span>Yang et al. (2021)</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              )}
            </>
          )}
            </div>
            
        {/* Expandable Photos Section */}
        {!photosLoading && projectPhotos && projectPhotos.length > 0 && (
          <div 
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              maxHeight: isExpanded ? '5000px' : '0px',
              opacity: isExpanded ? 1 : 0
            }}
          >
            <div className="border-t border-ide-border pt-6">
              {/* Project Details Section */}
              <div className="mb-6 mx-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  {getText({ en: 'Project Details', no: 'Prosjektdetaljer' })}
                </h4>
                <div className="text-gray-300 text-base leading-relaxed text-wrap break-words">
                  {project.id === 'fjordquest' && (
                    <div>
                      {getText({
                        en: "I am currently developing a comprehensive website and visual identity for Fjord Quest Adventure, a Norwegian luxury travel company. This project encompasses both frontend development and brand design, requiring expertise in both technical implementation and creative direction.",
                        no: "Jeg utvikler for øyeblikket en omfattende nettside og visuell identitet for Fjord Quest Adventure, et norsk luksusreiseselskap. Dette prosjektet omfatter både frontend-utvikling og merkevare-design, og krever ekspertise innen både teknisk implementering og kreativ retning."
                      })}
                      <br /><br />
                      {getText({
                        en: "The website is built using React, Tailwind CSS, and shadcn/ui components, featuring a modern glassmorphism design with a sophisticated dark-blue color palette. The platform integrates dynamic content management through JSON and Markdown files, enabling efficient updates for daytrips, accommodations, and various travel services.",
                        no: "Nettsiden er bygget med React, Tailwind CSS og shadcn/ui-komponenter, med et moderne glassmorfisme-design og en sofistikert mørkeblå fargepalett. Plattformen integrerer dynamisk innholdsadministrasjon gjennom JSON- og Markdown-filer, som muliggjør effektive oppdateringer for dagsturer, overnatting og ulike reisetjenester."
                      })}
                      <br /><br />
                      {getText({
                        en: "Key features include bilingual support for Norwegian and English markets, responsive design across all devices, and dedicated service pages covering transportation, accommodation, and aviation services. The project demonstrates proficiency in modern web development practices and user experience design.",
                        no: "Viktige funksjoner inkluderer tospråklig støtte for norske og engelske markeder, responsivt design på alle enheter, og dedikerte tjenestesider som dekker transport, overnatting og luftfartstjenester. Prosjektet demonstrerer kompetanse innen moderne webutviklingspraksis og brukeropplevelse-design."
                      })}
                    </div>
                  )}
                  {project.id === 'in1060' && (
                    <div>
                      {getText({
                        en: "This project addressed a practical problem in restaurant food safety compliance through hardware development. After conducting user research with restaurant staff, we identified the challenge of manual temperature monitoring and logging required for health inspections.",
                        no: "Dette prosjektet adresserte et praktisk problem innen mattrygghetsoverholdelse i restauranter gjennom maskinvareutvikling. Etter å ha gjennomført brukerforskning med restaurantpersonale, identifiserte vi utfordringen med manuell temperaturovervåkning og loggføring som kreves for helseinspeksjoner."
                      })}
                      <br /><br />
                      {getText({
                        en: "We developed a smart temperature logger using ESP32 microcontrollers and custom-calibrated thermistor sensors. The device features an LCD display, physical control buttons, and LED indicators for different operational modes. The project required reverse-engineering commercial temperature measurement equipment and developing custom calibration algorithms using voltage dividers and logarithmic functions.",
                        no: "Vi utviklet en smart temperaturlogger med ESP32-mikrokontrollere og egenkalibrerte termistor-sensorer. Enheten har et LCD-display, fysiske kontrollknapper og LED-indikatorer for ulike driftmoduser. Prosjektet krevde reversering av kommersiell temperaturovervåkingsutstyr og utvikling av egne kalibreringsalgoritmer med spenningsdelere og logaritmiske funksjoner."
                      })}
                      <br /><br />
                      {getText({
                        en: "The design philosophy drew inspiration from Antarctic research stations, emphasizing functional aesthetics and robust performance in commercial kitchen environments. This project provided valuable experience in embedded systems programming, circuit design, and the unique challenges of hardware development compared to software engineering.",
                        no: "Designfilosofien hentet inspirasjon fra antarktiske forskningsstasjoner, med vekt på funksjonell estetikk og robust ytelse i kommersielle kjøkkenmiljøer. Dette prosjektet ga verdifull erfaring innen programmering av innebygde systemer, kretsdesign og de unike utfordringene ved maskinvareutvikling sammenlignet med programvareutvikling."
                      })}
                    </div>
                  )}
                  {project.id === 'in2000' && (
                    <div>
                      {getText({
                        en: "This project addressed a critical gap in weather communication for young users through collaboration with Norway's Meteorological Institute (MET). Despite dominating traditional media, MET was missing the 13-25 age demographic who neither watch linear TV nor use the official Yr app.",
                        no: "Dette prosjektet adresserte et kritisk gap i værkommunikasjon for unge brukere gjennom samarbeid med Meteorologisk institutt (MET). Til tross for å dominere tradisjonelle medier, nådde ikke MET aldersgruppen 13-25 år som verken ser lineær-TV eller bruker den offisielle Yr-appen."
                      })}
                      <br /><br />
                      {getText({
                        en: "We developed VærSmart, an Android weather app featuring 'Mr. Praktisk,' an AI-powered mascot that provides personalized weather advice based on user hobbies and activities. The app includes customizable backgrounds, simplified weather visualizations, and user-friendly weather warnings designed specifically for younger audiences.",
                        no: "Vi utviklet VærSmart, en Android vær-app med 'Mr. Praktisk,' en AI-drevet maskot som gir personlige værråd basert på brukerens hobbyer og aktiviteter. Appen inkluderer tilpassbare bakgrunner, forenklede værvisualiseringer og brukervennlige værvarsler designet spesielt for yngre målgrupper."
                      })}
                      <br /><br />
                      {getText({
                        en: "Extensive user research revealed that 54% of young users had never used the official Yr app, and 90% preferred alternative weather services. The technical implementation used Kotlin with MVVM architecture, Room database for local storage, and Retrofit for API integration with MET.no weather data and LocationIQ services. The project won a student prize for its innovative approach to weather communication.",
                        no: "Omfattende brukerforskning avdekket at 54% av unge brukere aldri hadde brukt den offisielle Yr-appen, og 90% foretrakk alternative værtjenester. Den tekniske implementeringen brukte Kotlin med MVVM-arkitektur, Room-database for lokal lagring og Retrofit for API-integrasjon med MET.no værdata og LocationIQ-tjenester. Prosjektet vant en studentpris for sin innovative tilnærming til værkommunikasjon."
                      })}
                    </div>
                  )}
                  {project.id === 'ml-project' && (
                    <div>
                      {getText({
                        en: "This research project, conducted during an exchange semester at Freie Universität Berlin, focused on implementing and evaluating GraphSynergy, a deep learning framework for anticancer drug combination prediction. The project was based on the original research by ",
                        no: "Dette forskningsprosjektet, utført under et utvekslingssemester ved Freie Universität Berlin, fokuserte på å implementere og evaluere GraphSynergy, et dyplæringsrammeverk for prediksjon av antikreft-legemiddelkombinasjoner. Prosjektet var basert på original forskning av "
                      })}
                      <button
                        onClick={() => window.open(project.researchPaperLink, '_blank')}
                        className="inline-flex items-center text-green-400 hover:text-green-300 underline transition-colors duration-200"
                      >
                        Yang et al. (2021)
                      </button>
                      {getText({
                        en: " and addressed a critical challenge in modern medicine: identifying effective drug combinations that work better together than individually.",
                        no: " og adresserte en kritisk utfordring i moderne medisin: å identifisere effektive legemiddelkombinasjoner som fungerer bedre sammen enn individuelt."
                      })}
                      <br /><br />
                      {getText({
                        en: "We developed GraphSynergy, a sophisticated graph neural network that learns from protein-protein interaction networks to predict drug combinations. The research involved analyzing extensive datasets containing over 70,000 drug combination samples from DrugCombDB and 4,000 from Oncology Screen, with comprehensive evaluation including data distribution analysis, outlier detection, and cross-validation strategies.",
                        no: "Vi utviklet GraphSynergy, et sofistikert graf-nevralt nettverk som lærer fra protein-protein-interaksjonsnettverk for å forutsi legemiddelkombinasjoner. Forskningen involverte analyse av omfattende datasett med over 70 000 legemiddelkombinasjonsprøver fra DrugCombDB og 4 000 fra Oncology Screen, med omfattende evaluering inkludert datadistribusjonsanalyse, outlier-deteksjon og kryssvalideringsstrategier."
                      })}
                      <br /><br />
                      {getText({
                        en: "The technical implementation used PyTorch for model development, Bayesian optimization for hyperparameter tuning, and compared graph-based approaches against traditional machine learning methods. This project provided valuable experience in bioinformatics, graph neural networks, and the unique challenges of machine learning in life sciences, contributing to the growing field of AI-assisted drug discovery.",
                        no: "Den tekniske implementeringen brukte PyTorch for modellutvikling, Bayesiansk optimalisering for hyperparameter-tuning, og sammenlignet graf-baserte tilnærminger mot tradisjonelle maskinlæringsmetoder. Dette prosjektet ga verdifull erfaring innen bioinformatikk, graf-nevrale nettverk og de unike utfordringene ved maskinlæring i livsvitenskap, og bidro til det voksende feltet AI-assistert legemiddeloppdagelse."
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Video for IN1060 project */}
              {project.id === 'in1060' && (
                <div className="mb-6 mx-6">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {getText({ en: 'Project Demonstration', no: 'Prosjektdemonstrasjon' })}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {getText({
                      en: "Watch our temperature logger in action! This video demonstrates the device's functionality, from sensor calibration to data logging.",
                      no: "Se temperaturloggeren vår i aksjon! Denne videoen demonstrerer enhetens funksjonalitet, fra sensorkalibrering til datalogging."
                    })}
                  </p>
                  <div className="flex justify-center">
                    <div className="relative w-full sm:w-3/4 max-w-md rounded-xl overflow-hidden shadow-lg">
                      <video
                        controls
                        className="w-full h-auto max-h-[200px] sm:max-h-[300px]"
                      >
                        <source src="/portfolio/Software engineering/IN1060/explaination_video.mp4" type="video/mp4" />
                        {getText({ en: 'Your browser does not support the video tag.', no: 'Nettleseren din støtter ikke video-elementet.' })}
                      </video>
                    </div>
                  </div>
                </div>
              )}

              {/* Credits Section */}
              {(project.id === 'in1060' || project.id === 'in2000' || project.id === 'ml-project') && (
                <div className="mb-6 mx-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {getText({ en: 'Credits', no: 'Bidragsytere' })}
                  </h4>
                  <div className="text-gray-300 text-sm">
                    {project.id === 'in1060' && (
                      <ul className="space-y-1">
                        <li>• Christian Thorkildsen – {getText({ en: 'Group member', no: 'Gruppemedlem' })}</li>
                        <li>• Viktoriia Olonova – {getText({ en: 'Group member', no: 'Gruppemedlem' })}</li>
                        <li>• Tone Bratteteig – {getText({ en: 'Coordinating teacher', no: 'Koordinerende lærer' })}</li>
                      </ul>
                    )}
                    {project.id === 'in2000' && (
                      <ul className="space-y-1">
                        <li>• Andreas Klæboe – {getText({ en: '(me)', no: '(meg)' })}</li>
                        <li>• Christian Thorkildsen – {getText({ en: 'Team member', no: 'Gruppemedlem' })}</li>
                        <li>• Hanan Mohamud – {getText({ en: 'Team member', no: 'Gruppemedlem' })}</li>
                        <li>• Muntaha Dheeg – {getText({ en: 'Team member', no: 'Gruppemedlem' })}</li>
                        <li>• Shanza Ehsan – {getText({ en: 'Team member', no: 'Gruppemedlem' })}</li>
                        <li>• Viktoriia Olonova – {getText({ en: 'Team member', no: 'Gruppemedlem' })}</li>
                        <li>• {getText({ en: 'Meteorological Institute (MET)', no: 'Meteorologisk institutt (MET)' })} – {getText({ en: 'Project partner', no: 'Prosjektpartner' })}</li>
                      </ul>
                    )}
                    {project.id === 'ml-project' && (
                      <ul className="space-y-1">
                        <li>• Andreas Klæboe – {getText({ en: '(me)', no: '(meg)' })}</li>
                        <li>• Kerem Aras – {getText({ en: 'International teammate', no: 'Internasjonal teammedlem' })}</li>
                        <li>• Julian Hesse – {getText({ en: 'International teammate', no: 'Internasjonal teammedlem' })}</li>
                        <li>• Felix Trau – {getText({ en: 'International teammate', no: 'Internasjonal teammedlem' })}</li>
                        <li>• Freie Universität Berlin – {getText({ en: 'Exchange semester host university', no: 'Vertsuniversitet for utvekslingssemester' })}</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Project Gallery Section */}
              <div className="mb-4 mx-6">
                <h4 className="text-lg font-semibold text-white mb-2">
                  {getText({ en: 'Project Gallery', no: 'Prosjektgalleri' })}
                </h4>
              </div>
              
              {/* Circular Carousel */}
              <CircularCarousel
                images={projectPhotos}
                title={getText(project.title)}
                projectId={project.id}
                className="mb-4"
              />
            </div>
          </div>
        )}

        {/* Loading state */}
        {photosLoading && (
          <div className="border-t border-ide-border pt-6">
            <div className="text-center text-ide-text/70">
              {getText({ en: 'Loading photos...', no: 'Laster bilder...' })}
            </div>
          </div>
        )}
            
        {/* Expand/Collapse Button - Centered at bottom */}
        {!photosLoading && projectPhotos && projectPhotos.length > 0 && (
          <div className="flex justify-center mt-6 mx-6 mb-6">
              <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="glass-bubble inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-500 hover:scale-105 hover:shadow-xl text-sm font-medium group"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderColor: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '2rem',
                color: '#60a5fa',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <span className="transition-all duration-300 group-hover:text-white">
                {isExpanded 
                  ? getText({ en: 'See less', no: 'Se mindre' })
                  : getText({ en: 'See more', no: 'Se mer' })
                }
              </span>
              <svg 
                className={`ml-2 w-4 h-4 transition-all duration-500 transform ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                } group-hover:scale-110`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
              </button>
          </div>
        )}
      </div>

      {/* Image Carousel Modal */}
      {showCarousel && (
        <ImageCarousel
          images={projectPhotos}
          title={getText(project.title)}
          projectId={project.id}
          onClose={() => setShowCarousel(false)}
        />
      )}
    </>
  )
}

export default ProjectCard
