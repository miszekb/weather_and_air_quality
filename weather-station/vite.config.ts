import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Paths served by the API; the service worker must not treat them as app pages.
const API_PATHS = /^\/(latest|history|ping)/

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Weather Station',
        short_name: 'Weather',
        description: 'Live weather and air quality readings with history.',
        theme_color: '#1A365D',
        background_color: '#171923',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The app shell is precached; API data is fetched from the network first and
        // falls back to the last response, so the dashboard still opens offline.
        navigateFallbackDenylist: [API_PATHS],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => API_PATHS.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    // The Express server in server-esp serves the built app from its own dist folder.
    outDir: '../server-esp/dist',
    emptyOutDir: true, // needed because outDir is outside the project root
  },
  server: {
    host: true,
    allowedHosts: [
      'weather.mbialecki.pl'
    ]
  }
})
