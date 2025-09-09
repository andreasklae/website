import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { loadCVData, portfolioProjects, parseMarkdownText, photographyHighlights } from '../utils/data.jsx'
import { getAssetPath } from '../utils/paths'

const LandingPage = () => {
  const { getText } = useLanguage()
  const [cvData, setCvData] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const cv = await loadCVData()
        setCvData(cv)
      } catch (error) {
        console.error('Error loading CV data:', error)
      }
    }
    loadData()
  }, [])

  const featuredProjects = portfolioProjects.slice(0, 3) // Show first 3 projects

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-page-enter">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 animate-fade-in lg:order-1">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                  Andreas Klæboe
                </h1>
                
                {/* Profile Image - Mobile Only */}
                <div className="lg:hidden flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={getAssetPath("profilepicture.jpeg")}
                        alt="Andreas Klæboe"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"></div>
                    <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full opacity-20 blur-xl"></div>
                  </div>
                </div>
                
                <p className="text-xl lg:text-2xl text-gray-600 mb-6 text-center lg:text-left">
                  {cvData ? getText(cvData.role) : getText({
                    en: 'MSc student in Informatics: Programming and Systems Architecture • Photographer',
                    no: 'Masterstudent i informatikk: programmering og systemarkitektur • Fotograf'
                  })}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed text-center lg:text-left">
                  {cvData ? parseMarkdownText(getText(cvData.summary)) : getText({
                    en: 'Welcome to my digital space where code meets creativity. Explore my journey through software engineering and visual storytelling.',
                    no: 'Velkommen til mitt digitale rom hvor kode møter kreativitet. Utforsk min reise gjennom programvareutvikling og visuell historiefortelling.'
                  })}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/software" 
                  className="btn-primary group inline-flex items-center justify-center text-lg"
                >
                  <span className="flex items-center gap-2">
                    <span className="whitespace-nowrap">
                      {getText({ en: 'View Software Work', no: 'Se programvarearbeid' })}
                    </span>
                    <span className="font-mono text-orange-300 group-hover:text-orange-100 transition-colors whitespace-nowrap">
                      {' { }'}
                    </span>
                  </span>
                </Link>
                
                <Link 
                  to="/photography" 
                  className="glass-bubble group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500/80 to-amber-500/80 text-white rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    {getText({ en: 'View Photography', no: 'Se foto' })}
                    <svg className="w-5 h-5 text-orange-100 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 pt-4 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4+</div>
                  <div className="text-sm text-gray-600">
                    {getText({ en: 'Projects', no: 'Prosjekter' })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">15+</div>
                  <div className="text-sm text-gray-600">
                    {getText({ en: 'Courses', no: 'Emner' })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">100+</div>
                  <div className="text-sm text-gray-600">
                    {getText({ en: 'Photos', no: 'Bilder' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Image (Desktop Only) */}
            <div className="hidden lg:flex lg:justify-end xl:justify-end animate-slide-up lg:order-2">
              <div className="relative">
                <div className="w-80 xl:w-96 h-80 xl:h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={getAssetPath("profilepicture.jpeg")}
                    alt="Andreas Klæboe"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 relative overflow-visible">
        {/* Background with prominent gradient for glassmorphism to blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-sky-200 to-orange-200"></div>
        
        {/* Header - Centered */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {getText({ en: 'Featured Work', no: 'Utvalgt arbeid' })}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {getText({
                  en: 'A selection of my recent projects spanning software development, UX design, and technical innovation.',
                  no: 'Et utvalg av mine nyeste prosjekter innen programvareutvikling, UX-design og teknisk innovasjon.'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: Horizontal scroll - Direct under gradient */}
        <div className="md:hidden relative z-10 py-2">
          <div className="flex gap-6 overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory px-6">
              {featuredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="backdrop-blur-2xl bg-white/25 border border-white/40 p-6 flex-shrink-0 w-80 snap-center"
                  style={{ 
                    borderRadius: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {/* Project Image */}
                  <div className="aspect-video bg-gray-300/40 rounded-xl overflow-hidden mb-4">
                    {project.photos && project.photos[0] && (
                      <img
                        src={project.photos[0]}
                        alt={getText(project.title)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Project Info */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {getText(project.title)}
                  </h3>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {getText(project.description)}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 backdrop-blur-sm bg-blue-500/20 text-blue-700 text-xs rounded-full border border-blue-300/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Project Button */}
                  <Link
                    to={`/software#${project.id}`}
                    className="glass-bubble inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm font-medium"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '2rem',
                      color: '#374151'
                    }}
                  >
                    <span>{getText({ en: 'View Project', no: 'Se prosjekt' })}</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
          </div>
        </div>

        {/* Desktop: Grid layout - Centered container */}
        <div className="hidden md:block relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <div
                key={project.id}
                className="backdrop-blur-2xl bg-white/25 border border-white/40 p-6"
                style={{ 
                  borderRadius: '2rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {/* Project Image */}
                <div className="aspect-video bg-gray-300/40 rounded-xl overflow-hidden mb-4">
                  {project.photos && project.photos[0] && (
                    <img
                      src={project.photos[0]}
                      alt={getText(project.title)}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Project Info */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {getText(project.title)}
                </h3>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {getText(project.description)}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 backdrop-blur-sm bg-blue-500/20 text-blue-700 text-xs rounded-full border border-blue-300/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* View Project Button */}
                <Link
                  to={`/software#${project.id}`}
                  className="glass-bubble inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '2rem',
                    color: '#374151'
                  }}
                >
                  <span>{getText({ en: 'View Project', no: 'Se prosjekt' })}</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* View All Projects Button */}
        <div className="text-center mt-12 relative z-10">
            <Link
              to="/software"
              className="btn-primary inline-flex items-center"
            >
              {getText({ en: 'View All Projects', no: 'Se alle prosjekter' })}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
        </div>
      </section>

      {/* Photography Preview Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Photography Samples */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={photographyHighlights[0]}
                    alt="Photography highlight 1"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={photographyHighlights[1]}
                    alt="Photography highlight 2"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={photographyHighlights[2]}
                    alt="Photography highlight 3"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={photographyHighlights[3]}
                    alt="Photography highlight 4"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Photography Description */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {getText({ en: 'Visual Storytelling', no: 'Visuell historiefortelling' })}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {getText({
                  en: 'Through photography, I capture moments that tell stories. From Norwegian summer landscapes to urban adventures, each image is part of a larger narrative about life, nature, and human experiences.',
                  no: 'Gjennom fotografering fanger jeg øyeblikk som forteller historier. Fra norske sommerlandskap til urbane eventyr, hvert bilde er en del av en større fortelling om livet, naturen og menneskelige opplevelser.'
                })}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">
                    {getText({ en: 'Nature & Landscape Photography', no: 'Natur- og landskapsfotografering' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span className="text-gray-700">
                    {getText({ en: 'Story-driven Photo Series', no: 'Historiedrevne fotoserier' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span className="text-gray-700">
                    {getText({ en: 'Digital Curation & Presentation', no: 'Digital kurasjon og presentasjon' })}
                  </span>
                </div>
              </div>
              <Link
                to="/photography"
                className="glass-bubble inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500/80 to-amber-500/80 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {getText({ en: 'Explore Photography', no: 'Utforsk foto' })}
                <svg className="w-5 h-5 ml-2 text-orange-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Connect Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {getText({ en: 'Let\'s Connect', no: 'La oss komme i kontakt' })}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {getText({
              en: 'Interested in collaboration, have a question, or just want to say hello? I\'d love to hear from you.',
              no: 'Interessert i samarbeid, har et spørsmål, eller vil bare si hei? Jeg vil gjerne høre fra deg.'
            })}
          </p>

          {/* Contact Info & Links */}
          <div className="space-y-6 mb-8">
            {/* Contact Info */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                andreasklaeboe@gmail.com
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +47 967 98 001
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://instagram.com/andreasklae"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-bubble inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500/80 to-purple-500/80 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              
              <a
                href="https://github.com/andreasklae"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-bubble inline-flex items-center px-6 py-3 bg-gray-700/80 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-sky-100 rounded-full opacity-20 blur-3xl"></div>
      </div>
    </div>
  )
}

export default LandingPage
