import { sveltekit } from '@sveltejs/kit/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { moduleAliases } from '../stylist-svelte/scripts/prepare-module-sources.mjs';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const stylistRoot = resolve(projectRoot, '../stylist-svelte');
const stylistLib = resolve(stylistRoot, 'src/lib');

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			...moduleAliases(stylistRoot),
			$stylist: stylistLib
		},
		// One Svelte runtime for the site and the sibling library sources.
		dedupe: ['svelte']
	},
	server: {
		port: 5179,
		strictPort: true,
		fs: {
			allow: [projectRoot, stylistRoot]
		}
	}
});
