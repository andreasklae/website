import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useLanguage } from './contexts/LanguageContext'
import LandingPage from './pages/LandingPage'
import SoftwarePage from './pages/SoftwarePage'
import PhotographyPage from './pages/PhotographyPage'
import PhotoStory from './pages/PhotoStory'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'

function MainContent({ location }) {
  const currentLocation = location || useLocation()

  return (
    <Routes location={currentLocation}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/software" element={<SoftwarePage />} />
      <Route path="/photography" element={<PhotographyPage />} />
      <Route path="/photography/:storyId" element={<PhotoStory />} />
    </Routes>
  )
}

function App() {
  const location = useLocation()
  const isDarkMode = location.pathname.startsWith('/software')

  // Apply dark theme immediately to prevent white flash
  React.useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : ''
  }, [isDarkMode])

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-800 ${isDarkMode ? 'bg-ide-bg' : 'bg-transparent'}`}>
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <MainContent />
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}

export default App
