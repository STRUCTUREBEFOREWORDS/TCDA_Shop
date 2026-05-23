import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const spaPlugin = {
  name: 'spa-github-pages',
  closeBundle() {
    const indexPath = path.resolve(__dirname, '../docs/index.html')
    const notFoundPath = path.resolve(__dirname, '../docs/404.html')
    const redirectScript = `<script>const r=new URLSearchParams(window.location.search).get('redirect');if(r)window.history.replaceState(null,'',r);</script>`
    const notFoundContent = `<!DOCTYPE html><html><head><script>window.location.replace('/?redirect='+encodeURIComponent(window.location.pathname));</script></head></html>`

    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf-8')
      if (!html.includes(redirectScript)) {
        html = html.replace('<head>', `<head>${redirectScript}`)
        fs.writeFileSync(indexPath, html)
      }
    }

    if (!fs.existsSync(notFoundPath)) {
      fs.writeFileSync(notFoundPath, notFoundContent)
    }
  },
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    spaPlugin,
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: null,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,webp,woff2}'],
        globIgnores: ['**/icons/*.svg', '**/googlee*.html', '**/404.html', '**/500.html'],
      },
      manifest: {
        name: 'TCDA',
        short_name: 'TCDA',
        description: 'Color immersion as fashion.',
        theme_color: '#080808',
        background_color: '#080808',
        display: 'standalone',
        start_url: '/ja/collection',
        icons: [
          { src: '/icon192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  base: '/',
  define: {
    __BUILD_VERSION__: JSON.stringify(Date.now().toString(36)),
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
