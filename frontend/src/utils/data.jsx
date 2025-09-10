import { getAssetPath } from './paths'

// Data loading utilities
export const loadPersonalData = async () => {
  const response = await fetch(getAssetPath('personal.json'))
  return response.json()
}

export const loadCVData = async () => {
  const response = await fetch(getAssetPath('cv.json'))
  return response.json()
}

export const loadCoursesData = async () => {
  const response = await fetch(getAssetPath('courses.json'))
  return response.json()
}

// Function to load all photos from the photos manifest
export const loadPhotosManifest = async () => {
  try {
    const response = await fetch(getAssetPath('photos-manifest.json'))
    return response.json()
  } catch (error) {
    console.error('Error loading photos manifest:', error)
    return {}
  }
}

// Function to get photos for a specific project
export const getProjectPhotos = async (projectId) => {
  try {
    const manifest = await loadPhotosManifest()
    const photos = manifest[projectId] || []
    return photos.map(path => getAssetPath(path))
  } catch (error) {
    console.error('Error loading project photos:', error)
    return []
  }
}

// Portfolio project data structure (chronologically ordered - newest to oldest)
export const portfolioProjects = [
  {
    id: 'fjordquest',
    title: {
      en: 'Fjord Quest Adventure',
      no: 'Fjord Quest Adventure'
    },
    description: {
      en: 'Luxury travel website with glassmorphism design, bilingual support, and dynamic content management.',
      no: 'Luksusreiseside med glassmorfisme-design, tospråklig støtte og dynamisk innholdsadministrasjon.'
    },
    tags: ['React', 'Tailwind', 'shadcn/ui', 'JSON/Markdown', 'Glassmorphism', 'Bilingual', 'Visual Identity'],
    type: 'website',
    link: 'https://www.fjordquestadventure.no/',
    photos: [] // Will be loaded dynamically from photos-manifest.json
  },
  {
    id: 'in2000',
    title: {
      en: 'VærSmart Weather App',
      no: 'VærSmart Vær-app'
    },
    description: {
      en: 'Award-winning AI weather app with "Mr. Praktisk" mascot for personalized advice to young users.',
      no: 'Prisbelønt AI vær-app med "Mr. Praktisk" maskot for personlige råd til unge brukere.'
    },
    tags: ['Android', 'Kotlin', 'MVVM', 'AI', 'UX Research', 'MET.no API', 'LocationIQ', 'Room Database', 'Retrofit', 'Student Prize'],
    type: 'mobile',
    photos: [], // Will be loaded dynamically from photos-manifest.json
    pdfReport: './portfolio/Software engineering/IN2000/Rapport.pdf',
    pdfAward: './portfolio/Software engineering/IN2000/Pris for app IN2000 -v24 (1).pdf',
    githubLink: 'https://github.com/andreasklae/varsmart'
  },
  {
    id: 'ml-project',
    title: {
      en: 'Graph Neural Networks for Cancer Treatment',
      no: 'Graf-nevrale nettverk for kreftbehandling'
    },
    description: {
      en: 'Graph neural networks for drug synergy prediction in cancer treatment using protein interaction networks.',
      no: 'Graf-nevrale nettverk for legemiddelsynergi-prediksjon i kreftbehandling ved bruk av protein-interaksjonsnettverk.'
    },
    tags: ['Python', 'Machine Learning', 'Graph Neural Networks', 'PyTorch', 'Biomedical'],
    type: 'research',
    photos: [], // Will be loaded dynamically from photos-manifest.json
    pdfReport: './portfolio/Software engineering/ML project/Rapport.pdf',
    githubLink: 'https://github.com/julianhesse/GraphSynergy_Swp'
  },
  {
    id: 'in1060',
    title: {
      en: 'Smart Temperature Logger',
      no: 'Smart Temperaturlogger'
    },
    description: {
      en: 'Smart temperature logger with ESP32 and custom sensors for restaurant food safety monitoring.',
      no: 'Smart temperaturlogger med ESP32 og egendefinerte sensorer for mattrygghetsovervåkning i restauranter.'
    },
    tags: ['Arduino', 'ESP32', 'IoT', 'Hardware', 'C++'],
    type: 'hardware',
    photos: [], // Will be loaded dynamically from photos-manifest.json
    pdfReport: './portfolio/Software engineering/IN1060/Teknisk rapport.pdf'
  }
]

// Photography highlights - actual images from the portfolio
const highlightImages = [
  'portfolio/photography/highlights/0A5732E0-D733-479F-91AF-98E56141EB38_1_105_c.jpeg',
  'portfolio/photography/highlights/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg',
  'portfolio/photography/highlights/68209391-AA1C-4272-A78D-E2E7EC5CD546_1_105_c.jpeg',
  'portfolio/photography/highlights/0CF0A802-D8A2-44EC-80DB-8509AB5960DC_1_105_c.jpeg',
  'portfolio/photography/highlights/9B5C5D4B-1F85-41F4-9024-86BE25CD8598_1_105_c.jpeg',
  'portfolio/photography/highlights/1DD4F0E1-95E5-4AF9-9FAD-3F6AFE1E1AC6_1_105_c.jpeg',
  'portfolio/photography/highlights/284A1B7B-F731-4DCA-8735-A01FFC325FB4_1_105_c.jpeg',
  'portfolio/photography/highlights/CFE4E1E5-642D-4DCC-992D-FC3EF715BEA8_1_105_c.jpeg',
  'portfolio/photography/highlights/0F072DF0-6376-47A4-9EA6-0F6E2709CE92_1_105_c.jpeg',
  'portfolio/photography/highlights/1B28F38D-D879-4965-AAE1-F24967382940_1_105_c.jpeg',
  'portfolio/photography/highlights/3CE8CF6A-912F-49D9-BC16-DCAEEDDE8158_1_105_c.jpeg',
  'portfolio/photography/highlights/E876441F-22E1-4644-BC75-C0BC683E8774_1_105_c.jpeg',
  'portfolio/photography/highlights/F652948E-8197-4E08-B777-69C725A6FF7C_1_105_c.jpeg',
  'portfolio/photography/highlights/93DD5B85-15BD-4FFD-B74A-EDC0E733890D_1_105_c.jpeg',
  'portfolio/photography/highlights/A79876F4-990E-426D-8EA3-8EA4828A49C2_1_105_c.jpeg',
  'portfolio/photography/highlights/B5B1E9A7-5D79-4D27-89E1-1D682658288F_1_105_c.jpeg'
]

export const photographyHighlights = highlightImages.map(path => getAssetPath(path))

export const photographyStories = [
  {
    id: 'stavern-sommer-2025',
    title: {
      en: 'Stavern Summer 2025',
      no: 'Stavern sommer 2025'
    },
    coverImage: getAssetPath('portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg'),
    description: {
      en: 'Long Norwegian summer days with late sunsets, coastal walks, festival celebrations, and quiet moments in nature.',
      no: 'Lange norske sommerdager med sene solnedganger, kystturer, festivalglade og stille øyeblikk i naturen.'
    },
    parts: [
      {
        id: 'part-1',
        title: {
          en: 'Cabin Days',
          no: 'Dager på hytta'
        },
        description: './portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/description.md',
        highlights: './portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/',
        photos: './portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/'
      },
      {
        id: 'part-2',
        title: {
          en: 'Coastal Walks',
          no: 'Kystturer'
        },
        description: './portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/description.md',
        highlights: './portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/highlights/',
        photos: './portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/'
      },
      {
        id: 'part-3',
        title: {
          en: 'Festival Day',
          no: 'Festivallørdag'
        },
        description: './portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/description.md',
        highlights: './portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/highlights/',
        photos: './portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/'
      },
      {
        id: 'part-4',
        title: {
          en: 'The Walk Home',
          no: 'Turen hjem'
        },
        description: './portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/description.md',
        highlights: './portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/Highlights/',
        photos: './portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/'
      }
    ]
  }
]

// Utility functions
export const formatDate = (dateString, language = 'en') => {
  const date = new Date(dateString)
  const options = { year: 'numeric', month: 'long' }
  
  if (language === 'no') {
    return date.toLocaleDateString('no-NO', options)
  }
  return date.toLocaleDateString('en-US', options)
}

export const formatDateRange = (start, end, language = 'en') => {
  const startFormatted = formatDate(start, language)
  
  if (end === 'present') {
    return language === 'no' ? `${startFormatted} – nå` : `${startFormatted} – present`
  }
  
  const endFormatted = formatDate(end, language)
  return `${startFormatted} – ${endFormatted}`
}

// Utility to parse markdown-style bold text and convert to JSX
export const parseMarkdownText = (text, isDark = false) => {
  if (!text) return text
  
  // Split by **bold** patterns
  const parts = text.split(/(\*\*.*?\*\*)/g)
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** markers and make bold
      const boldText = part.slice(2, -2)
      const colorClass = isDark ? 'text-blue-300' : 'text-blue-700'
      return <strong key={index} className={`font-bold ${colorClass}`}>{boldText}</strong>
    }
    return part
  })
}
