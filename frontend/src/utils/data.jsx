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

// Function to generate image descriptions based on file names
export const generateImageDescription = (imagePath, projectId) => {
  // Add safety check for undefined or null imagePath
  if (!imagePath || typeof imagePath !== 'string') {
    return 'Image'
  }
  
  const fileName = imagePath.split('/').pop().split('.')[0] // Get filename without extension
  
  // Project-specific descriptions
  if (projectId === 'fjordquest') {
    if (fileName.includes('logo')) return 'FjordQuest app logo'
    if (fileName.includes('landingpage')) return 'App landing page design'
    if (fileName.includes('activitiespage')) return 'Activities page interface'
  }
  
  if (projectId === 'in1060') {
    if (fileName.includes('design_inspiration')) return 'Design inspiration from Antarctic research base'
    if (fileName.includes('UI_sketch')) return 'User interface design sketch'
    if (fileName.includes('prototype_finished')) return 'Completed temperature logger prototype'
    if (fileName.includes('prototype_with_cover')) return 'Prototype with protective cover'
    if (fileName.includes('prototype_without_cover')) return 'Prototype without cover showing internals'
    if (fileName.includes('Teknisk_rapport')) return 'Technical report diagram'
  }
  
  if (projectId === 'in2000') {
    if (fileName.includes('App_logo')) return 'VærSmart app logo'
    if (fileName.includes('front_page')) return 'App main screen'
    if (fileName.includes('location_search')) return 'Location search interface'
    if (fileName.includes('Settings_screen')) return 'App settings screen'
    if (fileName.includes('farevarsel')) return 'Weather warning interface'
  }
  
  if (projectId === 'ml-project') {
    if (fileName.includes('dataset_drug_occurrence')) return 'Drug occurrence analysis in dataset'
    if (fileName.includes('synergy_scores_distribution')) return 'Synergy scores distribution analysis'
    if (fileName.includes('tissue_heatmap')) return 'Tissue-specific heatmap analysis'
    if (fileName.includes('outlier_detection')) return 'Outlier detection methodology'
    if (fileName.includes('iqr_outlier_removal')) return 'IQR-based outlier removal results'
    if (fileName.includes('iqr_multiplier_performance')) return 'IQR multiplier performance evaluation'
    if (fileName.includes('model_performance_comparison')) return 'Model performance comparison'
    if (fileName.includes('cross_validation_results')) return 'Cross-validation results'
    if (fileName.includes('prediction_accuracy_analysis')) return 'Prediction accuracy analysis'
    if (fileName.includes('analysis_visualization')) return 'Data analysis visualization'
    if (fileName.includes('cross_validation_methodology')) return 'Cross-validation methodology setup'
    if (fileName.includes('model_performance_metrics')) return 'Model performance metrics'
    if (fileName.includes('prediction_distribution_analysis')) return 'Prediction distribution analysis'
    if (fileName.includes('detailed_performance_evaluation')) return 'Detailed performance evaluation'
    if (fileName.includes('protein_network_topology')) return 'Protein network topology analysis'
    if (fileName.includes('graph_connectivity_structure')) return 'Graph connectivity structure analysis'
    if (fileName.includes('network_clustering_analysis')) return 'Network clustering analysis'
    if (fileName.includes('graph_topology_metrics')) return 'Graph topology metrics'
    if (fileName.includes('network_degree_distribution')) return 'Network degree distribution'
    if (fileName.includes('graph_component_analysis')) return 'Graph component analysis'
    if (fileName.includes('network_visualization')) return 'Network visualization'
    if (fileName.includes('topology_comprehensive_analysis')) return 'Comprehensive topology analysis'
    if (fileName.includes('hyperparameter_bayesian_optimization')) return 'Hyperparameter Bayesian optimization'
    if (fileName.includes('edge_shuffling_experiment')) return 'Edge shuffling experiment results'
    if (fileName.includes('graph_modification_performance')) return 'Graph modification performance'
    if (fileName.includes('model_comparison_overview')) return 'Model comparison overview'
    if (fileName.includes('detailed_model_performance')) return 'Detailed model performance'
    if (fileName.includes('model_accuracy_comparison')) return 'Model accuracy comparison'
    if (fileName.includes('comprehensive_performance_analysis')) return 'Comprehensive performance analysis'
    if (fileName.includes('graphsynergy_vs_baseline')) return 'GraphSynergy vs baseline comparison'
    if (fileName.includes('final_model_evaluation')) return 'Final model evaluation'
    if (fileName.includes('cross_validation_detailed_results')) return 'Cross-validation detailed results'
    if (fileName.includes('performance_validation_analysis')) return 'Performance validation analysis'
    if (fileName.includes('model_robustness_evaluation')) return 'Model robustness evaluation'
    if (fileName.includes('hyperparameter_sensitivity_analysis')) return 'Hyperparameter sensitivity analysis'
    if (fileName.includes('final_performance_summary')) return 'Final performance summary'
    if (fileName.includes('random_forest_architecture')) return 'Random Forest architecture'
    if (fileName.includes('random_forest_vs_gnn_comparison')) return 'Random Forest vs GNN comparison'
    if (fileName.includes('traditional_ml_comparison')) return 'Traditional ML comparison'
    if (fileName.includes('final_comparative_results')) return 'Final comparative results'
    if (fileName.includes('conclusion_performance_summary')) return 'Conclusion performance summary'
  }
  
  // Fallback: generate description from filename
  return fileName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
    tags: ['Java', 'Kotlin', 'Jetpack Compose', 'Design', 'Informatics', 'Programming', 'Software engineering', 'API', 'Azure', 'Full stack', 'Functional programming', 'OOP', 'UI', 'UX'],
    type: 'mobile',
    photos: [], // Will be loaded dynamically from photos-manifest.json
    pdfReport: getAssetPath('portfolio/Software engineering/IN2000/Rapport.pdf'),
    pdfAward: getAssetPath('portfolio/Software engineering/IN2000/Pris for app IN2000 -v24 (1).pdf'),
    githubLink: 'https://github.com/andreasklae/varsmart'
  },
  {
    id: 'ml-project',
    title: {
      en: 'GraphSynergy: Drug Discovery AI',
      no: 'GraphSynergy: AI for legemiddeloppdagelse'
    },
    description: {
      en: 'Implementation and evaluation of GraphSynergy, a deep learning framework for anticancer drug combination prediction based on protein interaction networks.\n\nBuilt upon the original research by Yang et al.',
      no: 'Implementering og evaluering av GraphSynergy, et dyplæringsrammeverk for prediksjon av antikreft-legemiddelkombinasjoner basert på protein-interaksjonsnettverk.\n\nBygget på original forskning av Yang et al.'
    },
    tags: ['Python', 'Informatics', 'Algorithms/data', 'Machine Learning', 'Graph Neural Networks', 'PyTorch', 'Biomedical'],
    type: 'research',
    photos: [], // Will be loaded dynamically from photos-manifest.json
    pdfReport: getAssetPath('portfolio/Software engineering/ML project/Rapport.pdf'),
    githubLink: 'https://github.com/julianhesse/GraphSynergy_Swp',
    researchPaperLink: 'https://pubmed.ncbi.nlm.nih.gov/34472609/'
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
    tags: ['Arduino', 'C++', 'Design', 'Informatics', 'Research', 'HCI', 'IoT', 'UCD', 'UD', 'UX'],
    type: 'hardware',
    photos: [], // Will be loaded dynamically from photos-manifest.json
    pdfReport: getAssetPath('portfolio/Software engineering/IN1060/Teknisk rapport.pdf')
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
