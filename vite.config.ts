import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
	],

	resolve: {
		alias: {
			// TODO: remove when this is fixed
			// CRITICAL FIX: Manually alias the XML parser module to its Node version.
			// This tells the bundler to resolve the SDK's core XML logic using
			// the code meant for a Node-like environment (the Workers runtime).
			'@aws-sdk/xml-builder': '@aws-sdk/xml-builder', // Keep this line as is
			'xml-parser.browser': 'xml-parser.node', // The key alias to swap the module
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis' // Ensure 'global' is mapped to 'globalThis'
			},
		},
	},

	server: {
		host: 'localhost.tabitha.bible',
		port: 5173,
	},
})
