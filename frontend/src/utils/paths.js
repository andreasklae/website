// Utility function to resolve asset paths correctly for GitHub Pages
// Uses Vite's BASE_URL so links work both locally and on project pages
export const getAssetPath = (path) => {
  const base = (import.meta?.env?.BASE_URL) || '/'
  const cleanPath = String(path || '').replace(/^\.?\//, '')
  return `${base}${cleanPath}`
}

// Helper for images in the portfolio directory (same behavior)
export const getPortfolioImagePath = (path) => {
  const base = (import.meta?.env?.BASE_URL) || '/'
  const cleanPath = String(path || '').replace(/^\.?\//, '')
  return `${base}${cleanPath}`
}
