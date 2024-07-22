import { execSync } from "child_process"
import esbuild from "esbuild"
import fs from "fs-extra"
import path from "path"
// import Peggy from "peggy"
import * as Vite from "vite"
import checker from "vite-plugin-checker"
import { viteStaticCopy } from "vite-plugin-static-copy"
import tsconfigPaths from "vite-tsconfig-paths"
import packageJSON from "./package.json" assert { type: "json" }
import { ConditionSource } from "@item/condition/data.ts"

const CONDITION_SOURCES = ((): ConditionSource[] => {
	const output = execSync("npm run build:conditions", { encoding: "utf-8" })
	return JSON.parse(output.slice(output.indexOf("[")))
})()
const EN_JSON = JSON.parse(fs.readFileSync("./static/lang/en.json", { encoding: "utf-8" }))

const config = Vite.defineConfig(({ command, mode }): Vite.UserConfig => {
	const buildMode = mode === "production" ? "production" : "development"
	const outDir = "dist"

	// const rollGrammar = fs.readFileSync("roll-grammar.peggy", { encoding: "utf-8" })
	// const ROLL_PARSER = Peggy.generate(rollGrammar, { output: "source" }).replace(
	// 	"return {\n    SyntaxError: peg$SyntaxError,\n    parse: peg$parse\n  };",
	// 	"AbstractDamageRoll.parser = { SyntaxError: peg$SyntaxError, parse: peg$parse };",
	// )

	const plugins = [checker({ typescript: true }), tsconfigPaths()]
	// Handle minification after build to allow for tree-shaking and whitespace minification
	// "Note the build.minify option does not minify whitespaces when using the 'es' format in lib mode, as it removes
	// pure annotations and breaks tree-shaking."
	if (buildMode === "production") {
		plugins.push(
			{
				name: "minify",
				renderChunk: {
					order: "post",
					async handler(code, chunk) {
						return chunk.fileName.endsWith(".mjs")
							? esbuild.transform(code, {
								keepNames: true,
								minifyIdentifiers: false,
								minifySyntax: true,
								minifyWhitespace: true,
							})
							: code
					},
				},
			},
			...viteStaticCopy({
				targets: [
					// { src: "CHANGELOG.md", dest: "." },
					{ src: "README.md", dest: "." },
					// { src: "CONTRIBUTING.md", dest: "." },
				],
			}),
		)
	} else {
		plugins.push(
			// Foundry expects all esm files listed in system.json to exist: create empty vendor module when in dev mode
			{
				name: "touch-vendor-mjs",
				apply: "build",
				writeBundle: {
					async handler() {
						fs.closeSync(fs.openSync(path.resolve(outDir, "vendor.mjs"), "w"))
					},
				},
			},
			// Vite HMR is only preconfigured for css files: add handler for HBS templates
			{
				name: "hmr-handler",
				apply: "serve",
				handleHotUpdate(context) {
					if (context.file.startsWith(outDir)) return

					if (context.file.endsWith("en.json")) {
						const basePath = context.file.slice(context.file.indexOf("lang/"))
						console.log(`Updating lang file at ${basePath}`)
						fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
							context.server.hot.send({
								type: "custom",
								event: "lang-update",
								data: { path: `systems/gcsga/${basePath}` },
							})
						})
					} else if (context.file.endsWith(".hbs")) {
						const basePath = context.file.slice(context.file.indexOf("templates/"))
						console.log(`Updating template file at ${basePath}`)
						fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
							context.server.hot.send({
								type: "custom",
								event: "template-update",
								data: { path: `systems/gcsga/${basePath}` },
							})
						})
					}
				},
			},
		)
	}

	// Create dummy files for vite dev server
	if (command === "serve") {
		const message = "This file is for a running vite dev server and is not copied to a build"
		fs.writeFileSync("./index.html", `<h1>${message}</h1>\n`)
		if (!fs.existsSync("./styles")) fs.mkdirSync("./styles")
		fs.writeFileSync("./styles/gurps.css", `/** ${message} */\n`)
		fs.writeFileSync("./gurps.mjs", `/** ${message} */\n\nimport "./src/gurps.ts";\n`)
		fs.writeFileSync("./vendor.mjs", `/** ${message} */\n`)
	}

	// const reEscape = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")

	return {
		base: command === "build" ? "./" : "/systems/gcsga/",
		publicDir: "static",
		define: {
			BUILD_MODE: JSON.stringify(buildMode),
			CONDITION_SOURCES: JSON.stringify(CONDITION_SOURCES),
			EN_JSON: JSON.stringify(EN_JSON),
			// ROLL_PARSER: JSON.stringify(ROLL_PARSER),
			fu: "foundry.utils",
		},
		esbuild: { keepNames: true },
		build: {
			outDir,
			emptyOutDir: false, // fails if world is running due to compendium locks. We do it in "npm run clean" instead.
			minify: false,
			sourcemap: buildMode === "development",
			lib: {
				name: "gcsga",
				entry: "src/gurps.ts",
				formats: ["es"],
				fileName: "gcsga",
			},
			rollupOptions: {
				// external: new RegExp(
				// 	[
				// 		"(?:",
				// 		reEscape("../../icons/weapons/"),
				// 		"[-a-z/]+",
				// 		reEscape(".webp"),
				// 		"|",
				// 		reEscape("../ui/parchment.jpg"),
				// 		")$",
				// 	].join(""),
				// ),
				output: {
					assetFileNames: ({ name }): string => (name === "style.css" ? "styles/gurps.css" : name ?? ""),
					chunkFileNames: "[name].mjs",
					entryFileNames: "gurps.mjs",
					manualChunks: {
						vendor: buildMode === "production" ? Object.keys(packageJSON.dependencies) : [],
					},
				},
				watch: { buildDelay: 100 },
			},
			target: "es2022",
		},
		server: {
			port: 30001,
			open: "/game",
			proxy: {
				"^(?!/systems/gcsga/)": "http://localhost:30000/",
				"/socketmio": {
					target: "ws://localhost:30000",
					ws: true,
				},
			},
		},
		plugins,
		css: {
			devSourcemap: buildMode === "development",
		},
	}
})

export default config
