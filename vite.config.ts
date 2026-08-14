import { sveltekit } from '@sveltejs/kit/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const stylistRoot = resolve(projectRoot, '../stylist-svelte');
const stylistLib = resolve(stylistRoot, 'src/lib');

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$stylist: stylistLib
		}
	},
	server: {
		fs: {
			allow: [projectRoot, stylistRoot]
		}
	}
});
