import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import {sveltekit} from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-netlify'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Keeps main JS files clean
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        // Forces CSS and images to keep their clean names without hashes
        assetFileNames: 'assets/[name].[ext]'
      }
    },
  },

  
  plugins: [
    sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			
		}),
    tailwindcss(),
    VitePWA({ 
      registerType: 'autoUpdate', 
      workbox: { globPatterns: [
        '**/*.{js,css,html,ico,png,svg}',
        'premium_access/**/*.{js,css,html,json}',
        'assets/**/*.{js,css,html,ico,png,svg}'
        ],
        maximumFileSizeToCacheInBytes: 3000000
      },

      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon-180x180.png'
      ],

      manifest: {
        ApplicationName: 'Akademi Abang Rumah',
        short_name: 'Akademi Abang Rumah',
        description: 'Platform pembelajaran online untuk Pelanggan Akademi Abang Rumah.',
        theme_color: '#4a7425',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],

        scope: "https://akademiabangrumah.netlify.app/",

        screenshots: [
          {
            src: 'assets/Desktop_Richer.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'assets/Phone_Richer.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
    }),
  ],
})