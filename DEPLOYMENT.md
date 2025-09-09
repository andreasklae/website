# GitHub Pages Deployment Guide

## 🚀 Automatic Deployment Setup

Your portfolio website is now configured for automatic deployment to GitHub Pages!

### What's Been Configured:

✅ **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
- Automatically builds and deploys on push to main/master branch
- Uses Node.js 18 with npm caching for faster builds
- Uploads build artifacts to GitHub Pages

✅ **Vite Configuration** (`frontend/vite.config.js`)
- Base path set to `/website/` for GitHub Pages
- Optimized build settings for production
- Proper asset handling for static hosting

✅ **Deployment Scripts** (`package.json`)
- `npm run deploy` for manual deployment
- `npm run build` for production builds
- Integrated with gh-pages package

✅ **GitHub Pages Optimization**
- `.nojekyll` file prevents Jekyll processing
- Proper routing configuration for SPA
- All assets correctly referenced

## 📋 Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **"GitHub Actions"**
4. Save the settings

### 2. Deploy Your Site

**Automatic Deployment:**
```bash
git add .
git commit -m "feat: Complete portfolio website with GitHub Pages deployment"
git push origin main
```

**Manual Deployment:**
```bash
npm run deploy
```

### 3. Access Your Live Site

After deployment, your site will be available at:
```
https://andreasklae.github.io/website/
```

## 🔧 Configuration Details

### Base Path
- **Development**: `http://localhost:3000/`
- **Production**: `https://andreasklae.github.io/website/`
- **Automatic**: Vite config handles the base path switching

### Build Process
1. GitHub Actions triggers on push to main
2. Installs dependencies with npm ci
3. Builds the React app with `npm run build`
4. Deploys to GitHub Pages automatically

### File Structure
```
.github/workflows/deploy.yml  # GitHub Actions workflow
frontend/vite.config.js       # Vite configuration with base path
frontend/public/.nojekyll     # Prevents Jekyll processing
frontend/dist/                # Build output directory
```

## 🎯 Next Steps

1. **Push to GitHub** - Your first push will trigger automatic deployment
2. **Check Actions tab** - Monitor deployment progress in GitHub Actions
3. **Visit your site** - Access at the GitHub Pages URL
4. **Future updates** - Simply push to main branch for automatic updates

## 🛠 Troubleshooting

### If deployment fails:
- Check GitHub Actions logs in the "Actions" tab
- Ensure all dependencies are in package.json
- Verify the base path is correctly set

### If images don't load:
- All portfolio images are in `public/portfolio/`
- Paths are relative to the base URL
- Check browser console for 404 errors

### If routing doesn't work:
- GitHub Pages serves the built `index.html` for all routes
- React Router handles client-side routing
- Refresh should work on any page

---

Your portfolio is now ready for professional deployment! 🚀
