import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import SoftwarePage from './pages/SoftwarePage';
import PhotographyPage from './pages/PhotographyPage';
import ProjectDetail from './pages/ProjectDetail';
import StoryDetail from './pages/StoryDetail';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/software" element={<SoftwarePage />} />
              <Route path="/software/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/photography" element={<PhotographyPage />} />
              <Route path="/photography/stories/:storyId" element={<StoryDetail />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;