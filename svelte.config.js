import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const stylistLib = resolve(projectRoot, '../stylist-svelte/src/lib');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		alias: {
			$stylist: stylistLib
		},
		adapter: adapter({
			platformProxy: {
				configPath: './wrangler.platform.jsonc',
				persist: true,
				remoteBindings: false
			}
		})
	}
};

export default config;
