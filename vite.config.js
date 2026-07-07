import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit' // Swapped to SvelteKit specific plugin
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
  // REMOVED: build.rollupOptions.output (SvelteKit must control its own asset generation)

  preview: {
    allowedHosts: ['jaundice-elliptic-luminance.ngrok-free.dev'],
  },

  server: {
    allowedHosts:['jaundice-elliptic-luminance.ngrok-free.dev']
  },

  plugins: [
    sveltekit(),
    tailwindcss(),
    SvelteKitPWA({ 
      registerType: 'autoUpdate',
      // This empty kit object triggers the specialized SvelteKit behaviors 
      kit: {}, 
      workbox: { 
        navigateFallback: null,
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2}',
          'client/**/*.{js,css,html,ico,png,svg,webp,woff2}'
        ],
        maximumFileSizeToCacheInBytes: 3000000
      },

      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon-180x180.png'
      ],

      

      manifest: {
        name: 'Akademi Abang Rumah', // FIXED: Changed from ApplicationName to name
        short_name: 'Akademi Abang Rumah',
        description: 'Platform pembelajaran online untuk Pelanggan Akademi Abang Rumah.',
        theme_color: '#4a7425',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/', // FIXED: Use relative roots instead of hardcoded absolute URLs
        icons: [
          {
            src: 'assets/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'assets/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'assets/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'assets/images/Desktop_Richer.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'assets/images/Phone_Richer.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
    }),
  ],
})