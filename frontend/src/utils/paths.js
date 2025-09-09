// Utility function to resolve asset paths correctly for GitHub Pages
export const getAssetPath = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // With custom domain, always use root path
  return `/${cleanPath}`
}

// Helper for images in the portfolio directory
export const getPortfolioImagePath = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // With custom domain, always use root path
  return `/${cleanPath}`
}
