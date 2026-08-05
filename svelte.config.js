import adapter from "@sveltejs/adapter-cloudflare"; // FIXED: Moved your Netlify adapter import here

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(), // FIXED: Handled by Netlify adapter now instead of adapter-auto
    paths: {
      base: "",
    },
    // csp: {
    //   mode: "auto", // nonce for SSR responses, hash for prerendered pages — SvelteKit picks per-page
    //   directives: {
    //     "default-src": ["self"],
    //     "script-src": ["self", "https://www.youtube.com"],
    //     "style-src": ["self", "unsafe-inline"], // Tailwind + Svelte's dynamic style bindings need this
    //     "img-src": ["self", "data:", "https:"],
    //     "font-src": ["self", "data:"],
    //     // TODO: replace both with your actual project refs from Supabase project settings
    //     "connect-src": [
    //       "self",
    //       "https://YOUR-DEV-PROJECT-REF.supabase.co",
    //       "https://YOUR-PROD-PROJECT-REF.supabase.co",
    //     ],
    //     "frame-src": ["https://www.youtube.com", "https://drive.google.com"],
    //     "frame-ancestors": ["self"],
    //     "object-src": ["none"],
    //     "base-uri": ["self"],
    //     "form-action": ["self"],
    //   },
    // },
    // Prevents waterfall chained imports in older or specific browser targets
    output: {
      preloadStrategy: "modulepreload", // Default & recommended for modern browsers
    },
  },
};

export default config;
