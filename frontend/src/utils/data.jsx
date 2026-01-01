import { getAssetPath } from './paths'

// Data loading utilities
export const loadPersonalData = async () => {
  const response = await fetch(getAssetPath('content/personal.json'))
  return response.json()
}

export const loadCVData = async () => {
  const response = await fetch(getAssetPath('content/cv.json'))
  return response.json()
}

export const loadCoursesData = async () => {
  const response = await fetch(getAssetPath('content/courses.json'))
  return response.json()
}

// Function to load all photos from the photos manifest
export const loadPhotosManifest = async () => {
  try {
    const response = await fetch(getAssetPath('content/photos-manifest.json'))
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
    pdfReport: 'portfolio/Software engineering/IN2000/Rapport.pdf',
    pdfAward: 'portfolio/Software engineering/IN2000/Pris for app IN2000 -v24 (1).pdf',
    githubLink: 'https://github.com/andreasklae/varsmart'
  },
  {
    id: '3dpathfinding',
    title: {
      en: '3D Pathfinding: Algorithm Benchmarking',
      no: '3D Pathfinding: Algoritme-benchmarking'
    },
    description: {
      en: 'Benchmarking framework for 3D pathfinding algorithms on voxel mazes with interactive visualization and reproducible analysis.',
      no: 'Benchmark-rammeverk for 3D-pathfinding-algoritmer på voxel-labyrinter med interaktiv visualisering og reproduserbar analyse.'
    },
    linkLabel: {
      en: '3D model',
      no: '3D-modell'
    },
    tags: ['Python', 'Algorithms/data', 'Pathfinding', 'A*', 'Dijkstra', 'Theta*', 'NumPy', 'Plotly', 'Visualization'],
    type: 'website',
    link: 'https://andreasklae.github.io/3Dpathfinding/',
    githubLink: 'https://github.com/andreasklae/3Dpathfinding',
    photos: [] // Will be loaded dynamically from photos-manifest.json
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
    pdfReport: 'portfolio/Software engineering/ML project/Rapport.pdf',
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
    pdfReport: 'portfolio/Software engineering/IN1060/Teknisk rapport.pdf'
  }
]

// Photography highlights - complete list from public folder
const highlightImages = [
  'portfolio/photography/highlights/04854BAB-216D-4D0E-9ACF-ABD079B4F364.jpeg',
  'portfolio/photography/highlights/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg',
  'portfolio/photography/highlights/0805AE7E-6E74-4F5A-8CDB-E685BB2C1CC0_1_105_c.jpeg',
  'portfolio/photography/highlights/093C7DA0-7613-40C1-8942-137D5FAAD4A5_1_105_c.jpeg',
  'portfolio/photography/highlights/0B9990D3-5907-4F05-8A8A-D30D0A9B601A_1_105_c.jpeg',
  'portfolio/photography/highlights/0D3B9E1A-60DE-4A6C-B534-DC1B96A1DD49_1_102_o.jpeg',
  'portfolio/photography/highlights/0E76D1F4-4DC7-4148-8185-6154744D59EA_1_201_a.jpeg',
  'portfolio/photography/highlights/14789848-B71B-4FE4-BC6B-8A51D915BD45_1_102_o.jpeg',
  'portfolio/photography/highlights/152EF68B-025C-4C04-BACD-AE71BCD05AD7_1_105_c.jpeg',
  'portfolio/photography/highlights/1973B5E1-8462-4B63-8A66-068164E9C337_1_102_a.jpeg',
  'portfolio/photography/highlights/1BE2CED2-2FB6-4475-B303-969934E1D6CB_1_105_c.jpeg',
  'portfolio/photography/highlights/24555F36-678D-4C93-95ED-1A54A69D6456_1_102_a.jpeg',
  'portfolio/photography/highlights/284A1B7B-F731-4DCA-8735-A01FFC325FB4_1_105_c.jpeg',
  'portfolio/photography/highlights/2A81A269-41B8-4021-ACE7-42A8C9A52995_1_201_a.jpeg',
  'portfolio/photography/highlights/2D1393D1-9F78-47B1-9A6A-9E8CEAEC931F_1_102_o.jpeg',
  'portfolio/photography/highlights/3002B068-3126-4EE0-89D8-67EE7B4DA412_1_105_c.jpeg',
  'portfolio/photography/highlights/352DA6D6-056A-4C6C-B808-B0C82A42B868_1_102_a.jpeg',
  'portfolio/photography/highlights/4839B6E7-C56A-4139-B7FE-CC988A8AC649_1_105_c.jpeg',
  'portfolio/photography/highlights/4D90D102-A22A-4B6D-B592-87505340CA3C_1_105_c.jpeg',
  'portfolio/photography/highlights/546A38D8-861B-438C-8CC0-59A47FBC0FCF_1_105_c.jpeg',
  'portfolio/photography/highlights/59C2DE7C-D78C-431D-B73B-32E5D19316E1_1_102_a.jpeg',
  'portfolio/photography/highlights/63AE837A-FD39-4EA3-B83E-8D7599E1A418_1_105_c.jpeg',
  'portfolio/photography/highlights/663EF69C-806F-4B67-BAFD-8A5395A482C8_1_102_a.jpeg',
  'portfolio/photography/highlights/68209391-AA1C-4272-A78D-E2E7EC5CD546_1_105_c.jpeg',
  'portfolio/photography/highlights/709DEE06-8092-463A-AE2D-F7B866644689_1_105_c.jpeg',
  'portfolio/photography/highlights/7274D431-85AB-4BE7-9229-C697E91774C3_1_105_c.jpeg',
  'portfolio/photography/highlights/750921F9-2AF8-47F5-8A6E-43769F471449.jpeg',
  'portfolio/photography/highlights/76DE0E86-81B4-44DB-97F0-F6C3CA8767E3_1_105_c.jpeg',
  'portfolio/photography/highlights/7F632829-EE68-42D6-9551-9F86E81E67FA_1_105_c.jpeg',
  'portfolio/photography/highlights/807A17DA-75AD-447F-997E-E37E31C80CA8_1_105_c.jpeg',
  'portfolio/photography/highlights/8387DE13-323C-491B-9158-FBAD48055A7D_1_105_c.jpeg',
  'portfolio/photography/highlights/8E472CD7-D4E4-4B45-8ECA-B26A0AAC137E_1_105_c.jpeg',
  'portfolio/photography/highlights/8EB37456-F110-4230-8685-882F14E6F4A5_1_105_c.jpeg',
  'portfolio/photography/highlights/94ED706F-25BE-4300-85FC-D16740A6C1D3.jpeg',
  'portfolio/photography/highlights/A1C05BD1-7AC1-42B8-BC2F-698D08E5A153_1_105_c.jpeg',
  'portfolio/photography/highlights/A79876F4-990E-426D-8EA3-8EA4828A49C2_1_105_c.jpeg',
  'portfolio/photography/highlights/AC8C935E-2B51-4241-A264-8FF3B21117F6_1_102_o.jpeg',
  'portfolio/photography/highlights/B07B66A3-6670-470F-83DB-CB720B25B29F_1_105_c.jpeg',
  'portfolio/photography/highlights/B835ECD0-41F0-4778-BCEC-DE0835D738BB_1_105_c.jpeg',
  'portfolio/photography/highlights/BF21617D-5A31-4652-B3EE-289CC89F1F3B_1_105_c.jpeg',
  'portfolio/photography/highlights/BF703E8B-CEC3-4049-9533-80BE2E060235_1_105_c.jpeg',
  'portfolio/photography/highlights/C61311F1-D0F6-4E90-AF36-B21FE8BB2603_1_105_c.jpeg',
  'portfolio/photography/highlights/C6D44452-98EC-4E18-9B90-18C22BCDD5D5_1_105_c.jpeg',
  'portfolio/photography/highlights/CFE4E1E5-642D-4DCC-992D-FC3EF715BEA8_1_105_c.jpeg',
  'portfolio/photography/highlights/D61BF33E-A80C-47A8-B165-EB71D4A6BA63_1_105_c.jpeg',
  'portfolio/photography/highlights/D724ADB4-BF32-404B-94EF-0949D83B72A7_1_102_a.jpeg',
  'portfolio/photography/highlights/DEDF7DA6-6087-4908-BAD3-52CB0D23B0F5_1_102_o.jpeg',
  'portfolio/photography/highlights/DF356DAA-9B6A-48BF-9A51-A286A3CF3FF8_1_105_c.jpeg',
  'portfolio/photography/highlights/DSCF3941.JPG',
  'portfolio/photography/highlights/E722CF07-383F-4773-BA7B-D7D624326CFD_1_105_c.jpeg',
  'portfolio/photography/highlights/E76F9F19-F960-4F9B-8D17-646AD1F2895A_1_105_c.jpeg',
  'portfolio/photography/highlights/E9F3955D-555E-426F-846E-010955C1793D_1_105_c.jpeg',
  'portfolio/photography/highlights/FCE483A0-3423-4DB9-BFA1-10AD73FF4A7A_1_105_c.jpeg',
  'portfolio/photography/highlights/FEAAC21E-BB5F-4BDE-827B-06C4FF1DF325_1_105_c.jpeg',
  'portfolio/photography/highlights/FF2DFBA3-9BB3-4A41-A1BF-90BA5A431685_1_105_c.jpeg',
  'portfolio/photography/highlights/FFF8244B-1644-403A-A5D1-4344960E70DB_1_105_c.jpeg',
  'portfolio/photography/highlights/IMG_1630.jpg',
  'portfolio/photography/highlights/IMG_2684 2.jpg',
  'portfolio/photography/highlights/IMG_2905.JPG',
  'portfolio/photography/highlights/IMG_3844.JPG',
  'portfolio/photography/highlights/IMG_3863.JPG',
  'portfolio/photography/highlights/R1-03421-0028.jpg',
  'portfolio/photography/highlights/R1-09749-021A.JPG'
]

export const photographyHighlights = highlightImages.map(path => getAssetPath(path))

export const photographyStories = [
  {
    id: 'alpine-winter-2025',
    title: {
      en: 'Alpine Winter 2025',
      no: 'Alpevinter 2025'
    },
    coverImage: getAssetPath('portfolio/photography/Alpine winter 2025/Thumbnail.JPG'),
    description: {
      en: 'Fog, mountains, and a life lived in transit. From a quiet Bavarian valley to Milan’s warm evenings, and finally the stillness of lakes tucked between the Alps.',
      no: 'Tåke, fjell og et liv i bevegelse. Fra en stille dal i Bayern til varme kvelder i Milano, og videre til innsjøer som ligger som speil mellom Alpene.'
    },
    storyMd: {
      en: './portfolio/photography/Alpine winter 2025/story.en.md',
      no: './portfolio/photography/Alpine winter 2025/story.no.md'
    },
    parts: [
      {
        id: 'part-1',
        title: { en: 'Berchtesgaden', no: 'Berchtesgaden' },
        photos: './portfolio/photography/Alpine winter 2025/Chapters/Chapter 1 - Berchtesgaden/Photos/'
      },
      {
        id: 'part-2',
        title: { en: 'Salzburg', no: 'Salzburg' },
        photos: './portfolio/photography/Alpine winter 2025/Chapters/Chapter 2 - Salzburg/Photos/'
      },
      {
        id: 'part-3',
        title: { en: 'Milano', no: 'Milano' },
        photos: './portfolio/photography/Alpine winter 2025/Chapters/Chapter 3 - Milano/Photos/'
      },
      {
        id: 'part-4',
        title: { en: 'Italian and Swiss Lakes', no: 'Italienske og sveitsiske innsjøer' },
        photos: './portfolio/photography/Alpine winter 2025/Chapters/Chapter 4 - Italian and swiss lakes/Photos/'
      }
    ]
  },
  {
    id: 'stavern-sommer-2025',
    title: {
      en: 'Stavern Summer 2025',
      no: 'Stavern sommer 2025'
    },
    coverImage: getAssetPath('portfolio/photography/Stavern sommer 2025/Thumbnail.jpeg'),
    description: {
      en: 'Long Norwegian summer days with late sunsets, coastal walks, festival celebrations, and quiet moments in nature.',
      no: 'Lange norske sommerdager med sene solnedganger, kystturer, festivalglade og stille øyeblikk i naturen.'
    },
    storyMd: {
      en: './portfolio/photography/Stavern sommer 2025/story.en.md',
      no: './portfolio/photography/Stavern sommer 2025/story.no.md'
    },
    parts: [
      {
        id: 'part-1',
        title: {
          en: 'Cabin Days',
          no: 'Dager på hytta'
        },
        highlights: './portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/',
        photos: './portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/'
      },
      {
        id: 'part-2',
        title: {
          en: 'Coastal Walks',
          no: 'Kystturer'
        },
        highlights: './portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/',
        photos: './portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/'
      },
      {
        id: 'part-3',
        title: {
          en: 'Festival Day',
          no: 'Festivallørdag'
        },
        highlights: './portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/',
        photos: './portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/'
      },
      {
        id: 'part-4',
        title: {
          en: 'The Walk Home',
          no: 'Turen hjem'
        },
        highlights: './portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/',
        photos: './portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/'
      }
    ]
  },
  {
    id: 'portugal-2025',
    title: {
      en: 'Portugal 2025',
      no: 'Portugal 2025'
    },
    coverImage: getAssetPath('portfolio/photography/Portugal 2025/Thumbnail.JPG'),
    description: {
      en: 'Surf camp, city days in Lisbon, long dinners, and quiet sunset walks.',
      no: 'Surfecamp, byliv i Lisboa, lange middager og stille kveldsturer.'
    },
    storyMd: {
      en: './portfolio/photography/Portugal 2025/story.en.md',
      no: './portfolio/photography/Portugal 2025/story.no.md'
    },
    parts: [
      {
        id: 'part-1',
        title: { en: 'Surf Camp', no: 'Surf Camp' },
        photos: './portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/'
      },
      {
        id: 'part-2',
        title: { en: 'Lisbon', no: 'Lisboa' },
        photos: './portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/'
      },
      {
        id: 'part-3',
        title: { en: 'The Beach House', no: 'Strandhuset' },
        photos: './portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/'
      },
      {
        id: 'part-4',
        title: { en: 'Dinner Parties', no: 'Middagsselskaper' },
        photos: './portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/'
      },
      {
        id: 'part-5',
        title: { en: 'Sunset Walks', no: 'Kveldsturer' },
        photos: './portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/'
      }
    ]
  },
  {
    id: 'semester-in-berlin',
    title: {
      en: 'Semester in Berlin',
      no: 'Berlinsemesteret'
    },
    coverImage: getAssetPath('portfolio/photography/Semester in Berlin/Thumbnail.jpg'),
    description: {
      en: 'From autobahn escapes to canal-side bike commutes, candlelit bars, dance floors, and an abandoned ferris wheel still whispering stories.',
      no: 'Fra autobahn og flyttelass til sykkelturer langs kanalene, barer i stearinlys, klubbnetter og et forlatt pariserhjul som fortsatt hvisker historier.'
    },
    storyMd: {
      en: './portfolio/photography/Semester in Berlin/story.en.md',
      no: './portfolio/photography/Semester in Berlin/story.no.md'
    },
    parts: [
      {
        id: 'part-1',
        title: {
          en: 'The Drive Down',
          no: 'Bilturen ned'
        },
        photos: './portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/'
      },
      {
        id: 'part-2',
        title: {
          en: 'The City',
          no: 'Byen'
        },
        photos: './portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/'
      },
      {
        id: 'part-3',
        title: {
          en: 'Nightlife',
          no: 'Nattelivet'
        },
        photos: './portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/'
      },
      {
        id: 'part-4',
        title: {
          en: 'Abandoned Amusement Park',
          no: 'Fornøyelsesparken som forsvant'
        },
        photos: './portfolio/photography/Semester in Berlin/Chapters/Chapter 4 - Abandoned amusement park/Photos/'
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
