import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin: Generate a manifest of photography highlights from public folder
function generateHighlightsManifest() {
  try {
    const root = process.cwd()
    const highlightsDir = path.resolve(root, 'public/portfolio/photography/highlights')
    const outDir = path.resolve(root, 'public/content')

    if (!fs.existsSync(highlightsDir)) return
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

    const files = fs
      .readdirSync(highlightsDir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name))
      .sort()

    const manifest = files.map((name) => `portfolio/photography/highlights/${name}`)
    const outPath = path.join(outDir, 'photography-highlights.json')
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2))
    // eslint-disable-next-line no-console
    console.log(`[highlights] Manifest updated with ${manifest.length} items`)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[highlights] Could not generate manifest:', err?.message || err)
  }
}

function HighlightsManifestPlugin() {
  return {
    name: 'generate-highlights-manifest',
    apply: 'serve',
    configureServer(server) {
      generateHighlightsManifest()
      const root = process.cwd()
      const watchDir = path.resolve(root, 'public/portfolio/photography/highlights')
      try {
        if (fs.existsSync(watchDir)) {
          const watcher = fs.watch(watchDir, { persistent: true }, () => {
            generateHighlightsManifest()
            try {
              server.ws.send({ type: 'full-reload' })
            } catch {}
          })
          server.httpServer?.once('close', () => watcher.close())
        }
      } catch {}
    }
  }
}

function HighlightsManifestBuildPlugin() {
  return {
    name: 'generate-highlights-manifest-build',
    apply: 'build',
    buildStart() {
      generateHighlightsManifest()
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), HighlightsManifestPlugin(), HighlightsManifestBuildPlugin()],
  // Use root in dev, project subpath in production (GitHub Pages)
  base: command === 'serve' ? '/' : '/website/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
}))
