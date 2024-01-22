// SPDX-FileCopyrightText: 2023 Johannes Loher
// SPDX-FileCopyrightText: 2023 David Archibald
//
// SPDX-License-Identifier: MIT

import typescript from "@rollup/plugin-typescript"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import copy from "rollup-plugin-copy"
import scss from "rollup-plugin-scss"
import cleaner from "rollup-plugin-cleaner"

export default () => ({
	input: "src/module/gurps.ts",
	output: {
		dir: "dist",
		entryFileNames: "module/[name].js",
		assetFileNames: "styles/[name][extname]",
		format: "es",
		sourcemap: true,
	},
	watch: {
		buildDelay: 300,
		clearScreen: true,
	},
	plugins: [
		nodeResolve(),
		typescript(),
		scss({
			include: ["src/styles/**/*.scss"],
			fileName: "styles/gurps.css",
			watch: ["src/styles"],
		}),
		copy({
			targets: [
				{ src: "src/*.json", dest: "dist" },
				{ src: "src/lang/*", dest: "dist/lang" },
				{ src: "src/assets/*", dest: "dist/assets" },
				{ src: "src/templates/*", dest: "dist/templates" },
				{ src: ["src/fonts/*.woff", "src/fonts/*.woff2", "src/fonts/*.ttf"], dest: "dist/fonts" },
			],
		}),
		cleaner({
			targets: ["dist/"],
		}),
	],
})
