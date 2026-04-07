import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

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
  ],
  base: '/',
  build: {
    outDir: '../docs',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
