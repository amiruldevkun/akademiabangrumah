import adapter from '@sveltejs/adapter-netlify'; // FIXED: Moved your Netlify adapter import here

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(), // FIXED: Handled by Netlify adapter now instead of adapter-auto
        paths: {
            base: ''
        }
	}
};

export default config;