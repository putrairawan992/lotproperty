import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Satu ID unik per build, dipakai UpdateAvailableToast.tsx untuk mendeteksi
// deploy baru: nilai yang sama ditulis ke dist/version.json (dicek berkala oleh
// tab yang sudah terbuka) dan dibekukan ke dalam bundle lewat __APP_BUILD_ID__
// (nilai yang sedang dijalankan tab itu). Kalau keduanya beda, ada versi baru.
const buildId = String(Date.now())

function buildVersionPlugin() {
  return {
    name: 'build-version',
    // Build produksi: Vite/Rollup menulis bundle lewat generateBundle.
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ buildId }),
      })
    },
    // `npm run dev`: tidak ada langkah bundling, jadi disajikan langsung lewat
    // middleware supaya endpoint yang sama tetap ada saat pengembangan lokal.
    configureServer(server) {
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ buildId }))
      })
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    buildVersionPlugin(),
  ],
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
