import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
        paths: {
            assets: '/assets',
            base: ''
        }
        
	},
    adapter: adapter()
};

export default config;