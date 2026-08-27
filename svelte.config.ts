import adapter from "@sveltejs/adapter-cloudflare"; // FIXED: Moved your Netlify adapter import here
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(), // FIXED: Handled by Netlify adapter now instead of adapter-auto
    paths: {
      base: "",
    },
    csrf: {
      trustedOrigins: [
        "https://jaundice-elliptic-luminance.ngrok-free.dev",
        "https://akademi.ayjo.my",
      ],
    },

    csp: {
      mode: "auto", // SvelteKit generates + injects a per-request nonce
      directives: {
        "default-src": ["'self'"],
        "base-uri": ["'self'"],
        "frame-ancestors": ["'none'"],

        "script-src": [
          "self",
          "https://challenges.cloudflare.com",
          "https://accounts.google.com",
          "https://www.youtube.com",
          "https://s.ytimg.com",
        ],

        "connect-src": [
          "self",
          "https://challenges.cloudflare.com",
          "https://*.supabase.co",
          "wss://*.supabase.co",
          "https://accounts.google.com",
          "https://www.youtube.com",
        ],

        "frame-src": [
          "https://challenges.cloudflare.com",
          "https://accounts.google.com",
          "https://www.youtube.com",
          "https://drive.google.com",
        ],

        "img-src": [
          "self",
          "data:",
          "https://*.supabase.co",
          "https://lh3.googleusercontent.com",
          "https://i.ytimg.com",
          "https://img.youtube.com",
        ],

        // 'unsafe-inline' here is fine — style-src isn't the attack vector
        // script-src is, and that's covered by the auto-nonce above
        "style-src": ["self", "unsafe-inline"],

        "font-src": ["self"],

        "form-action": [
          "self",
          "https://toyyibpay.com",
          "https://dev.toyyibpay.com",
          "https://jaundice-elliptic-luminance.ngrok-free.dev/*",
          "https://akademi.ayjo.my/*",
          "https://kkm6bgg8un.ap.loclx.io/",
        ],
      },
    },
    // Prevents waterfall chained imports in older or specific browser targets
    output: {
      preloadStrategy: "modulepreload", // Default & recommended for modern browsers
    },
  },
};

export default config;
