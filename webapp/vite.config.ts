import { resolve } from "node:path";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 3000,
	},
	optimizeDeps: {
		include: ["react-country-flag", "@hookform/resolvers"],
	},
	ssr: {
		noExternal: ["react-country-flag", "@hookform/resolvers"],
	},
	plugins: [
		tsConfigPaths(),
		tanstackStart({
			prerender: {
				enabled: true,
				filter: ({ path }) => {
					return !path.startsWith("/scenario");
				},
			},
		}),
		viteReact({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			outputStructure: "message-modules",
			cookieName: "PARAGLIDE_LOCALE",
			strategy: ["url", "cookie", "baseLocale"],
		}),
		tailwindcss(),
		netlify(),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
