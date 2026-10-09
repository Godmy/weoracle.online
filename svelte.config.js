import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { moduleAliases } from '../stylist-svelte/scripts/prepare-module-sources.mjs';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const stylistRoot = resolve(projectRoot, '../stylist-svelte');
const stylistLib = resolve(stylistRoot, 'src/lib');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		alias: {
			...moduleAliases(stylistRoot),
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
