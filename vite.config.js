import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { svelteSitemap } from "svelte-sitemap/vite";

export default defineConfig({
  preview: {
    allowedHosts: ["jaundice-elliptic-luminance.ngrok-free.dev"],
  },

  server: {
    allowedHosts: ["jaundice-elliptic-luminance.ngrok-free.dev"],
  },

  plugins: [
    sveltekit(),
    tailwindcss(),
    SvelteKitPWA({
      registerType: "autoUpdate",
      // This empty kit object triggers the specialized SvelteKit behaviors
      kit: {},

      // ADDED: these two are what actually pin the registered service
      // worker's scope to site root. manifest.scope/start_url (below) are
      // just metadata for "Add to Home Screen" — they don't control what
      // navigator.serviceWorker.register(..., { scope }) actually uses.
      base: "/",
      scope: "/",

      workbox: {
        navigateFallback: null,
        globPatterns: [
          "**/*.{ts,js,css,html,ico,png,svg,webp,woff2}",
          "client/**/*.{ts,js,css,html,ico,png,svg,webp,woff2}",
        ],
        maximumFileSizeToCacheInBytes: 3000000,
      },

      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "apple-touch-icon-180x180.png",
      ],

      manifest: {
        name: "Akademi Abang Rumah",
        short_name: "Akademi Abang Rumah",
        description:
          "Platform pembelajaran online untuk Pelanggan Akademi Abang Rumah.",
        theme_color: "#4a7425",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/assets/pwa-64x64.png", sizes: "64x64", type: "image/png" },
          {
            src: "/assets/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/assets/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/assets/images/Desktop_Richer.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/assets/images/Phone_Richer.png",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },
    }),
  ],
});
