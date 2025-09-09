// Utility function to resolve asset paths correctly for GitHub Pages
export const getAssetPath = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // In production, prepend the base path
  if (import.meta.env.PROD) {
    return `/website/${cleanPath}`
  }
  
  // In development, use the path as-is
  return `/${cleanPath}`
}

// Helper for images in the portfolio directory
export const getPortfolioImagePath = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  if (import.meta.env.PROD) {
    return `/website/${cleanPath}`
  }
  
  return `/${cleanPath}`
}
