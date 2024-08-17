// vite.config.ts
import { execSync } from "child_process";
import esbuild from "file:///home/nick/git/gcsga/node_modules/esbuild/lib/main.js";
import fs from "file:///home/nick/git/gcsga/node_modules/fs-extra/lib/index.js";
import path from "path";
import * as Vite from "file:///home/nick/git/gcsga/node_modules/vite/dist/node/index.js";
import checker from "file:///home/nick/git/gcsga/node_modules/vite-plugin-checker/dist/esm/main.js";
import { viteStaticCopy } from "file:///home/nick/git/gcsga/node_modules/vite-plugin-static-copy/dist/index.js";
import tsconfigPaths from "file:///home/nick/git/gcsga/node_modules/vite-tsconfig-paths/dist/index.mjs";

// package.json
var package_default = {
  name: "foundry-gurps-game-aid",
  version: "1.0.0-alpha.8",
  description: "",
  private: true,
  type: "module",
  scripts: {
    build: "npm run clean && npm run build:packs && vite build",
    "build:nopacks": "npm run clean && vite build",
    "build:packs": "tsx ./build/build-packs.ts",
    "build:packs:json": "tsx ./build/build-packs.ts json",
    "build:conditions": "tsx ./build/conditions.ts",
    clean: "tsx ./build/clean.ts",
    watch: "npm run clean && npm run build:packs && vite build --watch --mode development",
    hot: "vite serve",
    link: "tsx ./build/link-foundry.ts",
    extractPacks: "tsx ./build/extract-packs.ts",
    pretest: "npm run lint",
    test: "jest",
    migrate: "tsx ./build/run-migration.ts",
    lint: "npm run lint:ts && npm run lint:json && npm run prettier:scss",
    "lint:ts": "eslint ./build ./src ./tests ./types --ext .ts",
    "prettier:scss": "prettier --check src/styles",
    "lint:json": 'eslint ./static --ext .json --no-eslintrc --plugin json --rule "json/*: error" --rule "linebreak-style: error"',
    "lint:fix": "eslint ./build ./src ./tests ./types --ext .ts --fix && prettier --write src/styles"
  },
  author: "The GURPS Game Aid Developers",
  license: "MIT",
  devDependencies: {
    "@ethaks/fvtt-quench": "^0.9.2",
    "@pixi/graphics-smooth": "^1.1.0",
    "@pixi/particle-emitter": "5.0.8",
    "@types/fs-extra": "^11.0.4",
    "@types/glob": "^8.1.0",
    "@types/jest": "^29.5.12",
    "@types/jquery": "^3.5.30",
    "@types/jsdom": "^21.1.7",
    "@types/luxon": "^3.4.2",
    "@types/node": "20.14.6",
    "@types/prompts": "^2.4.9",
    "@types/showdown": "^2.0.6",
    "@types/sortablejs": "^1.15.8",
    "@types/tooltipster": "^0.0.35",
    "@types/uuid": "^9.0.8",
    "@types/yaireo__tagify": "4.24.0",
    "@typescript-eslint/eslint-plugin": "^7.13.1",
    "@typescript-eslint/parser": "^7.13.1",
    "classic-level": "^1.4.1",
    "es-jest": "^2.1.0",
    eslint: "^8.57.0",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-jest": "^28.6.0",
    "eslint-plugin-json": "^4.0.0",
    "eslint-plugin-prettier": "5.1.3",
    "fs-extra": "^11.2.0",
    gsap: "3.11.5",
    handlebars: "4.7.8",
    jest: "^29.7.0",
    "jest-each": "^29.7.0",
    jsdom: "^24.0.0",
    peggy: "^4.0.2",
    "pixi.js": "7.2.4",
    prettier: "3.3.3",
    prompts: "^2.4.2",
    "prosemirror-view": "1.32.5",
    sass: "^1.75.0",
    "socket.io": "4.7.5",
    "socket.io-client": "4.7.5",
    tinymce: "7.2.1",
    "tsconfig-paths": "^4.2.0",
    tsx: "^4.7.1",
    typescript: "^5.3.3",
    uuid: "^9.0.1",
    uuidv4: "^6.2.13",
    vite: "^5.3.5",
    "vite-plugin-checker": "^0.6.2",
    "vite-plugin-static-copy": "^1.0.3",
    "vite-tsconfig-paths": "^4.3.2",
    yargs: "^17.7.2"
  },
  dependencies: {
    "@codemirror/autocomplete": "^6.12.0",
    "@codemirror/lang-json": "^6.0.1",
    "@yaireo/tagify": "4.26.6",
    codemirror: "^6.0.1",
    luxon: "^3.4.4",
    minisearch: "^6.3.0",
    nouislider: "^15.7.1",
    remeda: "^1.61.0",
    sortablejs: "^1.15.1"
  }
};

// vite.config.ts
var CONDITION_SOURCES = (() => {
  const output = execSync("npm run build:conditions", { encoding: "utf-8" });
  return JSON.parse(output.slice(output.indexOf("[")));
})();
var EN_JSON = JSON.parse(fs.readFileSync("./static/lang/en.json", { encoding: "utf-8" }));
var config = Vite.defineConfig(({ command, mode }) => {
  const buildMode = mode === "production" ? "production" : "development";
  const outDir = "dist";
  const plugins = [checker({ typescript: true }), tsconfigPaths()];
  if (buildMode === "production") {
    plugins.push(
      {
        name: "minify",
        renderChunk: {
          order: "post",
          async handler(code, chunk) {
            return chunk.fileName.endsWith(".mjs") ? esbuild.transform(code, {
              keepNames: true,
              minifyIdentifiers: false,
              minifySyntax: true,
              minifyWhitespace: true
            }) : code;
          }
        }
      },
      ...viteStaticCopy({
        targets: [
          // { src: "CHANGELOG.md", dest: "." },
          { src: "README.md", dest: "." }
          // { src: "CONTRIBUTING.md", dest: "." },
        ]
      })
    );
  } else {
    plugins.push(
      // Foundry expects all esm files listed in system.json to exist: create empty vendor module when in dev mode
      {
        name: "touch-vendor-mjs",
        apply: "build",
        writeBundle: {
          async handler() {
            fs.closeSync(fs.openSync(path.resolve(outDir, "vendor.mjs"), "w"));
          }
        }
      },
      // Vite HMR is only preconfigured for css files: add handler for HBS templates
      {
        name: "hmr-handler",
        apply: "serve",
        handleHotUpdate(context) {
          if (context.file.startsWith(outDir)) return;
          if (context.file.endsWith("en.json")) {
            const basePath = context.file.slice(context.file.indexOf("lang/"));
            console.log(`Updating lang file at ${basePath}`);
            fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
              context.server.hot.send({
                type: "custom",
                event: "lang-update",
                data: { path: `systems/gcsga/${basePath}` }
              });
            });
          } else if (context.file.endsWith(".hbs")) {
            const basePath = context.file.slice(context.file.indexOf("templates/"));
            console.log(`Updating template file at ${basePath}`);
            fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
              context.server.hot.send({
                type: "custom",
                event: "template-update",
                data: { path: `systems/gcsga/${basePath}` }
              });
            });
          }
        }
      }
    );
  }
  if (command === "serve") {
    const message = "This file is for a running vite dev server and is not copied to a build";
    fs.writeFileSync("./index.html", `<h1>${message}</h1>
`);
    if (!fs.existsSync("./styles")) fs.mkdirSync("./styles");
    fs.writeFileSync("./styles/gurps.css", `/** ${message} */
`);
    fs.writeFileSync("./gurps.mjs", `/** ${message} */

import "./src/gurps.ts";
`);
    fs.writeFileSync("./vendor.mjs", `/** ${message} */
`);
  }
  return {
    base: command === "build" ? "./" : "/systems/gcsga/",
    publicDir: "static",
    define: {
      BUILD_MODE: JSON.stringify(buildMode),
      CONDITION_SOURCES: JSON.stringify(CONDITION_SOURCES),
      EN_JSON: JSON.stringify(EN_JSON),
      // ROLL_PARSER: JSON.stringify(ROLL_PARSER),
      fu: "foundry.utils"
    },
    esbuild: { keepNames: true },
    build: {
      outDir,
      emptyOutDir: false,
      // fails if world is running due to compendium locks. We do it in "npm run clean" instead.
      minify: false,
      sourcemap: buildMode === "development",
      lib: {
        name: "gcsga",
        entry: "src/gurps.ts",
        formats: ["es"],
        fileName: "gcsga"
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
          assetFileNames: ({ name }) => name === "style.css" ? "styles/gurps.css" : name ?? "",
          chunkFileNames: "[name].mjs",
          entryFileNames: "gurps.mjs",
          manualChunks: {
            vendor: buildMode === "production" ? Object.keys(package_default.dependencies) : []
          }
        },
        watch: { buildDelay: 100 }
      },
      target: "es2022"
    },
    server: {
      port: 30001,
      open: "/game",
      proxy: {
        "^(?!/systems/gcsga/)": "http://localhost:30000/",
        "/socketmio": {
          target: "ws://localhost:30000",
          ws: true
        }
      }
    },
    plugins,
    css: {
      devSourcemap: buildMode === "development"
    }
  };
});
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvbmljay9naXQvZ2NzZ2FcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL25pY2svZ2l0L2djc2dhL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL25pY2svZ2l0L2djc2dhL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiXG5pbXBvcnQgZXNidWlsZCBmcm9tIFwiZXNidWlsZFwiXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcbi8vIGltcG9ydCBQZWdneSBmcm9tIFwicGVnZ3lcIlxuaW1wb3J0ICogYXMgVml0ZSBmcm9tIFwidml0ZVwiXG5pbXBvcnQgY2hlY2tlciBmcm9tIFwidml0ZS1wbHVnaW4tY2hlY2tlclwiXG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1zdGF0aWMtY29weVwiXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSBcIi4vcGFja2FnZS5qc29uXCIgYXNzZXJ0IHsgdHlwZTogXCJqc29uXCIgfVxuaW1wb3J0IHsgQ29uZGl0aW9uU291cmNlIH0gZnJvbSBcIkBpdGVtL2NvbmRpdGlvbi9kYXRhLnRzXCJcblxuY29uc3QgQ09ORElUSU9OX1NPVVJDRVMgPSAoKCk6IENvbmRpdGlvblNvdXJjZVtdID0+IHtcblx0Y29uc3Qgb3V0cHV0ID0gZXhlY1N5bmMoXCJucG0gcnVuIGJ1aWxkOmNvbmRpdGlvbnNcIiwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pXG5cdHJldHVybiBKU09OLnBhcnNlKG91dHB1dC5zbGljZShvdXRwdXQuaW5kZXhPZihcIltcIikpKVxufSkoKVxuY29uc3QgRU5fSlNPTiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKFwiLi9zdGF0aWMvbGFuZy9lbi5qc29uXCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KSlcblxuY29uc3QgY29uZmlnID0gVml0ZS5kZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KTogVml0ZS5Vc2VyQ29uZmlnID0+IHtcblx0Y29uc3QgYnVpbGRNb2RlID0gbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcInByb2R1Y3Rpb25cIiA6IFwiZGV2ZWxvcG1lbnRcIlxuXHRjb25zdCBvdXREaXIgPSBcImRpc3RcIlxuXG5cdC8vIGNvbnN0IHJvbGxHcmFtbWFyID0gZnMucmVhZEZpbGVTeW5jKFwicm9sbC1ncmFtbWFyLnBlZ2d5XCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KVxuXHQvLyBjb25zdCBST0xMX1BBUlNFUiA9IFBlZ2d5LmdlbmVyYXRlKHJvbGxHcmFtbWFyLCB7IG91dHB1dDogXCJzb3VyY2VcIiB9KS5yZXBsYWNlKFxuXHQvLyBcdFwicmV0dXJuIHtcXG4gICAgU3ludGF4RXJyb3I6IHBlZyRTeW50YXhFcnJvcixcXG4gICAgcGFyc2U6IHBlZyRwYXJzZVxcbiAgfTtcIixcblx0Ly8gXHRcIkFic3RyYWN0RGFtYWdlUm9sbC5wYXJzZXIgPSB7IFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsIHBhcnNlOiBwZWckcGFyc2UgfTtcIixcblx0Ly8gKVxuXG5cdGNvbnN0IHBsdWdpbnMgPSBbY2hlY2tlcih7IHR5cGVzY3JpcHQ6IHRydWUgfSksIHRzY29uZmlnUGF0aHMoKV1cblx0Ly8gSGFuZGxlIG1pbmlmaWNhdGlvbiBhZnRlciBidWlsZCB0byBhbGxvdyBmb3IgdHJlZS1zaGFraW5nIGFuZCB3aGl0ZXNwYWNlIG1pbmlmaWNhdGlvblxuXHQvLyBcIk5vdGUgdGhlIGJ1aWxkLm1pbmlmeSBvcHRpb24gZG9lcyBub3QgbWluaWZ5IHdoaXRlc3BhY2VzIHdoZW4gdXNpbmcgdGhlICdlcycgZm9ybWF0IGluIGxpYiBtb2RlLCBhcyBpdCByZW1vdmVzXG5cdC8vIHB1cmUgYW5ub3RhdGlvbnMgYW5kIGJyZWFrcyB0cmVlLXNoYWtpbmcuXCJcblx0aWYgKGJ1aWxkTW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIpIHtcblx0XHRwbHVnaW5zLnB1c2goXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IFwibWluaWZ5XCIsXG5cdFx0XHRcdHJlbmRlckNodW5rOiB7XG5cdFx0XHRcdFx0b3JkZXI6IFwicG9zdFwiLFxuXHRcdFx0XHRcdGFzeW5jIGhhbmRsZXIoY29kZSwgY2h1bmspIHtcblx0XHRcdFx0XHRcdHJldHVybiBjaHVuay5maWxlTmFtZS5lbmRzV2l0aChcIi5tanNcIilcblx0XHRcdFx0XHRcdFx0PyBlc2J1aWxkLnRyYW5zZm9ybShjb2RlLCB7XG5cdFx0XHRcdFx0XHRcdFx0a2VlcE5hbWVzOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdG1pbmlmeUlkZW50aWZpZXJzOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRtaW5pZnlTeW50YXg6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0bWluaWZ5V2hpdGVzcGFjZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0OiBjb2RlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHQuLi52aXRlU3RhdGljQ29weSh7XG5cdFx0XHRcdHRhcmdldHM6IFtcblx0XHRcdFx0XHQvLyB7IHNyYzogXCJDSEFOR0VMT0cubWRcIiwgZGVzdDogXCIuXCIgfSxcblx0XHRcdFx0XHR7IHNyYzogXCJSRUFETUUubWRcIiwgZGVzdDogXCIuXCIgfSxcblx0XHRcdFx0XHQvLyB7IHNyYzogXCJDT05UUklCVVRJTkcubWRcIiwgZGVzdDogXCIuXCIgfSxcblx0XHRcdFx0XSxcblx0XHRcdH0pLFxuXHRcdClcblx0fSBlbHNlIHtcblx0XHRwbHVnaW5zLnB1c2goXG5cdFx0XHQvLyBGb3VuZHJ5IGV4cGVjdHMgYWxsIGVzbSBmaWxlcyBsaXN0ZWQgaW4gc3lzdGVtLmpzb24gdG8gZXhpc3Q6IGNyZWF0ZSBlbXB0eSB2ZW5kb3IgbW9kdWxlIHdoZW4gaW4gZGV2IG1vZGVcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogXCJ0b3VjaC12ZW5kb3ItbWpzXCIsXG5cdFx0XHRcdGFwcGx5OiBcImJ1aWxkXCIsXG5cdFx0XHRcdHdyaXRlQnVuZGxlOiB7XG5cdFx0XHRcdFx0YXN5bmMgaGFuZGxlcigpIHtcblx0XHRcdFx0XHRcdGZzLmNsb3NlU3luYyhmcy5vcGVuU3luYyhwYXRoLnJlc29sdmUob3V0RGlyLCBcInZlbmRvci5tanNcIiksIFwid1wiKSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdC8vIFZpdGUgSE1SIGlzIG9ubHkgcHJlY29uZmlndXJlZCBmb3IgY3NzIGZpbGVzOiBhZGQgaGFuZGxlciBmb3IgSEJTIHRlbXBsYXRlc1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiBcImhtci1oYW5kbGVyXCIsXG5cdFx0XHRcdGFwcGx5OiBcInNlcnZlXCIsXG5cdFx0XHRcdGhhbmRsZUhvdFVwZGF0ZShjb250ZXh0KSB7XG5cdFx0XHRcdFx0aWYgKGNvbnRleHQuZmlsZS5zdGFydHNXaXRoKG91dERpcikpIHJldHVyblxuXG5cdFx0XHRcdFx0aWYgKGNvbnRleHQuZmlsZS5lbmRzV2l0aChcImVuLmpzb25cIikpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGJhc2VQYXRoID0gY29udGV4dC5maWxlLnNsaWNlKGNvbnRleHQuZmlsZS5pbmRleE9mKFwibGFuZy9cIikpXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhgVXBkYXRpbmcgbGFuZyBmaWxlIGF0ICR7YmFzZVBhdGh9YClcblx0XHRcdFx0XHRcdGZzLnByb21pc2VzLmNvcHlGaWxlKGNvbnRleHQuZmlsZSwgYCR7b3V0RGlyfS8ke2Jhc2VQYXRofWApLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LnNlcnZlci5ob3Quc2VuZCh7XG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJjdXN0b21cIixcblx0XHRcdFx0XHRcdFx0XHRldmVudDogXCJsYW5nLXVwZGF0ZVwiLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGE6IHsgcGF0aDogYHN5c3RlbXMvZ2NzZ2EvJHtiYXNlUGF0aH1gIH0sXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoY29udGV4dC5maWxlLmVuZHNXaXRoKFwiLmhic1wiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgYmFzZVBhdGggPSBjb250ZXh0LmZpbGUuc2xpY2UoY29udGV4dC5maWxlLmluZGV4T2YoXCJ0ZW1wbGF0ZXMvXCIpKVxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYFVwZGF0aW5nIHRlbXBsYXRlIGZpbGUgYXQgJHtiYXNlUGF0aH1gKVxuXHRcdFx0XHRcdFx0ZnMucHJvbWlzZXMuY29weUZpbGUoY29udGV4dC5maWxlLCBgJHtvdXREaXJ9LyR7YmFzZVBhdGh9YCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHQuc2VydmVyLmhvdC5zZW5kKHtcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBcImN1c3RvbVwiLFxuXHRcdFx0XHRcdFx0XHRcdGV2ZW50OiBcInRlbXBsYXRlLXVwZGF0ZVwiLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGE6IHsgcGF0aDogYHN5c3RlbXMvZ2NzZ2EvJHtiYXNlUGF0aH1gIH0sXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0KVxuXHR9XG5cblx0Ly8gQ3JlYXRlIGR1bW15IGZpbGVzIGZvciB2aXRlIGRldiBzZXJ2ZXJcblx0aWYgKGNvbW1hbmQgPT09IFwic2VydmVcIikge1xuXHRcdGNvbnN0IG1lc3NhZ2UgPSBcIlRoaXMgZmlsZSBpcyBmb3IgYSBydW5uaW5nIHZpdGUgZGV2IHNlcnZlciBhbmQgaXMgbm90IGNvcGllZCB0byBhIGJ1aWxkXCJcblx0XHRmcy53cml0ZUZpbGVTeW5jKFwiLi9pbmRleC5odG1sXCIsIGA8aDE+JHttZXNzYWdlfTwvaDE+XFxuYClcblx0XHRpZiAoIWZzLmV4aXN0c1N5bmMoXCIuL3N0eWxlc1wiKSkgZnMubWtkaXJTeW5jKFwiLi9zdHlsZXNcIilcblx0XHRmcy53cml0ZUZpbGVTeW5jKFwiLi9zdHlsZXMvZ3VycHMuY3NzXCIsIGAvKiogJHttZXNzYWdlfSAqL1xcbmApXG5cdFx0ZnMud3JpdGVGaWxlU3luYyhcIi4vZ3VycHMubWpzXCIsIGAvKiogJHttZXNzYWdlfSAqL1xcblxcbmltcG9ydCBcIi4vc3JjL2d1cnBzLnRzXCI7XFxuYClcblx0XHRmcy53cml0ZUZpbGVTeW5jKFwiLi92ZW5kb3IubWpzXCIsIGAvKiogJHttZXNzYWdlfSAqL1xcbmApXG5cdH1cblxuXHQvLyBjb25zdCByZUVzY2FwZSA9IChzOiBzdHJpbmcpID0+IHMucmVwbGFjZSgvWy0vXFxcXF4kKis/LigpfFtcXF17fV0vZywgXCJcXFxcJCZcIilcblxuXHRyZXR1cm4ge1xuXHRcdGJhc2U6IGNvbW1hbmQgPT09IFwiYnVpbGRcIiA/IFwiLi9cIiA6IFwiL3N5c3RlbXMvZ2NzZ2EvXCIsXG5cdFx0cHVibGljRGlyOiBcInN0YXRpY1wiLFxuXHRcdGRlZmluZToge1xuXHRcdFx0QlVJTERfTU9ERTogSlNPTi5zdHJpbmdpZnkoYnVpbGRNb2RlKSxcblx0XHRcdENPTkRJVElPTl9TT1VSQ0VTOiBKU09OLnN0cmluZ2lmeShDT05ESVRJT05fU09VUkNFUyksXG5cdFx0XHRFTl9KU09OOiBKU09OLnN0cmluZ2lmeShFTl9KU09OKSxcblx0XHRcdC8vIFJPTExfUEFSU0VSOiBKU09OLnN0cmluZ2lmeShST0xMX1BBUlNFUiksXG5cdFx0XHRmdTogXCJmb3VuZHJ5LnV0aWxzXCIsXG5cdFx0fSxcblx0XHRlc2J1aWxkOiB7IGtlZXBOYW1lczogdHJ1ZSB9LFxuXHRcdGJ1aWxkOiB7XG5cdFx0XHRvdXREaXIsXG5cdFx0XHRlbXB0eU91dERpcjogZmFsc2UsIC8vIGZhaWxzIGlmIHdvcmxkIGlzIHJ1bm5pbmcgZHVlIHRvIGNvbXBlbmRpdW0gbG9ja3MuIFdlIGRvIGl0IGluIFwibnBtIHJ1biBjbGVhblwiIGluc3RlYWQuXG5cdFx0XHRtaW5pZnk6IGZhbHNlLFxuXHRcdFx0c291cmNlbWFwOiBidWlsZE1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIixcblx0XHRcdGxpYjoge1xuXHRcdFx0XHRuYW1lOiBcImdjc2dhXCIsXG5cdFx0XHRcdGVudHJ5OiBcInNyYy9ndXJwcy50c1wiLFxuXHRcdFx0XHRmb3JtYXRzOiBbXCJlc1wiXSxcblx0XHRcdFx0ZmlsZU5hbWU6IFwiZ2NzZ2FcIixcblx0XHRcdH0sXG5cdFx0XHRyb2xsdXBPcHRpb25zOiB7XG5cdFx0XHRcdC8vIGV4dGVybmFsOiBuZXcgUmVnRXhwKFxuXHRcdFx0XHQvLyBcdFtcblx0XHRcdFx0Ly8gXHRcdFwiKD86XCIsXG5cdFx0XHRcdC8vIFx0XHRyZUVzY2FwZShcIi4uLy4uL2ljb25zL3dlYXBvbnMvXCIpLFxuXHRcdFx0XHQvLyBcdFx0XCJbLWEtei9dK1wiLFxuXHRcdFx0XHQvLyBcdFx0cmVFc2NhcGUoXCIud2VicFwiKSxcblx0XHRcdFx0Ly8gXHRcdFwifFwiLFxuXHRcdFx0XHQvLyBcdFx0cmVFc2NhcGUoXCIuLi91aS9wYXJjaG1lbnQuanBnXCIpLFxuXHRcdFx0XHQvLyBcdFx0XCIpJFwiLFxuXHRcdFx0XHQvLyBcdF0uam9pbihcIlwiKSxcblx0XHRcdFx0Ly8gKSxcblx0XHRcdFx0b3V0cHV0OiB7XG5cdFx0XHRcdFx0YXNzZXRGaWxlTmFtZXM6ICh7IG5hbWUgfSk6IHN0cmluZyA9PiAobmFtZSA9PT0gXCJzdHlsZS5jc3NcIiA/IFwic3R5bGVzL2d1cnBzLmNzc1wiIDogbmFtZSA/PyBcIlwiKSxcblx0XHRcdFx0XHRjaHVua0ZpbGVOYW1lczogXCJbbmFtZV0ubWpzXCIsXG5cdFx0XHRcdFx0ZW50cnlGaWxlTmFtZXM6IFwiZ3VycHMubWpzXCIsXG5cdFx0XHRcdFx0bWFudWFsQ2h1bmtzOiB7XG5cdFx0XHRcdFx0XHR2ZW5kb3I6IGJ1aWxkTW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBPYmplY3Qua2V5cyhwYWNrYWdlSlNPTi5kZXBlbmRlbmNpZXMpIDogW10sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0d2F0Y2g6IHsgYnVpbGREZWxheTogMTAwIH0sXG5cdFx0XHR9LFxuXHRcdFx0dGFyZ2V0OiBcImVzMjAyMlwiLFxuXHRcdH0sXG5cdFx0c2VydmVyOiB7XG5cdFx0XHRwb3J0OiAzMDAwMSxcblx0XHRcdG9wZW46IFwiL2dhbWVcIixcblx0XHRcdHByb3h5OiB7XG5cdFx0XHRcdFwiXig/IS9zeXN0ZW1zL2djc2dhLylcIjogXCJodHRwOi8vbG9jYWxob3N0OjMwMDAwL1wiLFxuXHRcdFx0XHRcIi9zb2NrZXRtaW9cIjoge1xuXHRcdFx0XHRcdHRhcmdldDogXCJ3czovL2xvY2FsaG9zdDozMDAwMFwiLFxuXHRcdFx0XHRcdHdzOiB0cnVlLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHR9LFxuXHRcdHBsdWdpbnMsXG5cdFx0Y3NzOiB7XG5cdFx0XHRkZXZTb3VyY2VtYXA6IGJ1aWxkTW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiLFxuXHRcdH0sXG5cdH1cbn0pXG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZ1xuIiwgIntcblx0XCJuYW1lXCI6IFwiZm91bmRyeS1ndXJwcy1nYW1lLWFpZFwiLFxuXHRcInZlcnNpb25cIjogXCIxLjAuMC1hbHBoYS44XCIsXG5cdFwiZGVzY3JpcHRpb25cIjogXCJcIixcblx0XCJwcml2YXRlXCI6IHRydWUsXG5cdFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuXHRcInNjcmlwdHNcIjoge1xuXHRcdFwiYnVpbGRcIjogXCJucG0gcnVuIGNsZWFuICYmIG5wbSBydW4gYnVpbGQ6cGFja3MgJiYgdml0ZSBidWlsZFwiLFxuXHRcdFwiYnVpbGQ6bm9wYWNrc1wiOiBcIm5wbSBydW4gY2xlYW4gJiYgdml0ZSBidWlsZFwiLFxuXHRcdFwiYnVpbGQ6cGFja3NcIjogXCJ0c3ggLi9idWlsZC9idWlsZC1wYWNrcy50c1wiLFxuXHRcdFwiYnVpbGQ6cGFja3M6anNvblwiOiBcInRzeCAuL2J1aWxkL2J1aWxkLXBhY2tzLnRzIGpzb25cIixcblx0XHRcImJ1aWxkOmNvbmRpdGlvbnNcIjogXCJ0c3ggLi9idWlsZC9jb25kaXRpb25zLnRzXCIsXG5cdFx0XCJjbGVhblwiOiBcInRzeCAuL2J1aWxkL2NsZWFuLnRzXCIsXG5cdFx0XCJ3YXRjaFwiOiBcIm5wbSBydW4gY2xlYW4gJiYgbnBtIHJ1biBidWlsZDpwYWNrcyAmJiB2aXRlIGJ1aWxkIC0td2F0Y2ggLS1tb2RlIGRldmVsb3BtZW50XCIsXG5cdFx0XCJob3RcIjogXCJ2aXRlIHNlcnZlXCIsXG5cdFx0XCJsaW5rXCI6IFwidHN4IC4vYnVpbGQvbGluay1mb3VuZHJ5LnRzXCIsXG5cdFx0XCJleHRyYWN0UGFja3NcIjogXCJ0c3ggLi9idWlsZC9leHRyYWN0LXBhY2tzLnRzXCIsXG5cdFx0XCJwcmV0ZXN0XCI6IFwibnBtIHJ1biBsaW50XCIsXG5cdFx0XCJ0ZXN0XCI6IFwiamVzdFwiLFxuXHRcdFwibWlncmF0ZVwiOiBcInRzeCAuL2J1aWxkL3J1bi1taWdyYXRpb24udHNcIixcblx0XHRcImxpbnRcIjogXCJucG0gcnVuIGxpbnQ6dHMgJiYgbnBtIHJ1biBsaW50Ompzb24gJiYgbnBtIHJ1biBwcmV0dGllcjpzY3NzXCIsXG5cdFx0XCJsaW50OnRzXCI6IFwiZXNsaW50IC4vYnVpbGQgLi9zcmMgLi90ZXN0cyAuL3R5cGVzIC0tZXh0IC50c1wiLFxuXHRcdFwicHJldHRpZXI6c2Nzc1wiOiBcInByZXR0aWVyIC0tY2hlY2sgc3JjL3N0eWxlc1wiLFxuXHRcdFwibGludDpqc29uXCI6IFwiZXNsaW50IC4vc3RhdGljIC0tZXh0IC5qc29uIC0tbm8tZXNsaW50cmMgLS1wbHVnaW4ganNvbiAtLXJ1bGUgXFxcImpzb24vKjogZXJyb3JcXFwiIC0tcnVsZSBcXFwibGluZWJyZWFrLXN0eWxlOiBlcnJvclxcXCJcIixcblx0XHRcImxpbnQ6Zml4XCI6IFwiZXNsaW50IC4vYnVpbGQgLi9zcmMgLi90ZXN0cyAuL3R5cGVzIC0tZXh0IC50cyAtLWZpeCAmJiBwcmV0dGllciAtLXdyaXRlIHNyYy9zdHlsZXNcIlxuXHR9LFxuXHRcImF1dGhvclwiOiBcIlRoZSBHVVJQUyBHYW1lIEFpZCBEZXZlbG9wZXJzXCIsXG5cdFwibGljZW5zZVwiOiBcIk1JVFwiLFxuXHRcImRldkRlcGVuZGVuY2llc1wiOiB7XG5cdFx0XCJAZXRoYWtzL2Z2dHQtcXVlbmNoXCI6IFwiXjAuOS4yXCIsXG5cdFx0XCJAcGl4aS9ncmFwaGljcy1zbW9vdGhcIjogXCJeMS4xLjBcIixcblx0XHRcIkBwaXhpL3BhcnRpY2xlLWVtaXR0ZXJcIjogXCI1LjAuOFwiLFxuXHRcdFwiQHR5cGVzL2ZzLWV4dHJhXCI6IFwiXjExLjAuNFwiLFxuXHRcdFwiQHR5cGVzL2dsb2JcIjogXCJeOC4xLjBcIixcblx0XHRcIkB0eXBlcy9qZXN0XCI6IFwiXjI5LjUuMTJcIixcblx0XHRcIkB0eXBlcy9qcXVlcnlcIjogXCJeMy41LjMwXCIsXG5cdFx0XCJAdHlwZXMvanNkb21cIjogXCJeMjEuMS43XCIsXG5cdFx0XCJAdHlwZXMvbHV4b25cIjogXCJeMy40LjJcIixcblx0XHRcIkB0eXBlcy9ub2RlXCI6IFwiMjAuMTQuNlwiLFxuXHRcdFwiQHR5cGVzL3Byb21wdHNcIjogXCJeMi40LjlcIixcblx0XHRcIkB0eXBlcy9zaG93ZG93blwiOiBcIl4yLjAuNlwiLFxuXHRcdFwiQHR5cGVzL3NvcnRhYmxlanNcIjogXCJeMS4xNS44XCIsXG5cdFx0XCJAdHlwZXMvdG9vbHRpcHN0ZXJcIjogXCJeMC4wLjM1XCIsXG5cdFx0XCJAdHlwZXMvdXVpZFwiOiBcIl45LjAuOFwiLFxuXHRcdFwiQHR5cGVzL3lhaXJlb19fdGFnaWZ5XCI6IFwiNC4yNC4wXCIsXG5cdFx0XCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl43LjEzLjFcIixcblx0XHRcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCJeNy4xMy4xXCIsXG5cdFx0XCJjbGFzc2ljLWxldmVsXCI6IFwiXjEuNC4xXCIsXG5cdFx0XCJlcy1qZXN0XCI6IFwiXjIuMS4wXCIsXG5cdFx0XCJlc2xpbnRcIjogXCJeOC41Ny4wXCIsXG5cdFx0XCJlc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiOS4xLjBcIixcblx0XHRcImVzbGludC1wbHVnaW4tamVzdFwiOiBcIl4yOC42LjBcIixcblx0XHRcImVzbGludC1wbHVnaW4tanNvblwiOiBcIl40LjAuMFwiLFxuXHRcdFwiZXNsaW50LXBsdWdpbi1wcmV0dGllclwiOiBcIjUuMS4zXCIsXG5cdFx0XCJmcy1leHRyYVwiOiBcIl4xMS4yLjBcIixcblx0XHRcImdzYXBcIjogXCIzLjExLjVcIixcblx0XHRcImhhbmRsZWJhcnNcIjogXCI0LjcuOFwiLFxuXHRcdFwiamVzdFwiOiBcIl4yOS43LjBcIixcblx0XHRcImplc3QtZWFjaFwiOiBcIl4yOS43LjBcIixcblx0XHRcImpzZG9tXCI6IFwiXjI0LjAuMFwiLFxuXHRcdFwicGVnZ3lcIjogXCJeNC4wLjJcIixcblx0XHRcInBpeGkuanNcIjogXCI3LjIuNFwiLFxuXHRcdFwicHJldHRpZXJcIjogXCIzLjMuM1wiLFxuXHRcdFwicHJvbXB0c1wiOiBcIl4yLjQuMlwiLFxuXHRcdFwicHJvc2VtaXJyb3Itdmlld1wiOiBcIjEuMzIuNVwiLFxuXHRcdFwic2Fzc1wiOiBcIl4xLjc1LjBcIixcblx0XHRcInNvY2tldC5pb1wiOiBcIjQuNy41XCIsXG5cdFx0XCJzb2NrZXQuaW8tY2xpZW50XCI6IFwiNC43LjVcIixcblx0XHRcInRpbnltY2VcIjogXCI3LjIuMVwiLFxuXHRcdFwidHNjb25maWctcGF0aHNcIjogXCJeNC4yLjBcIixcblx0XHRcInRzeFwiOiBcIl40LjcuMVwiLFxuXHRcdFwidHlwZXNjcmlwdFwiOiBcIl41LjMuM1wiLFxuXHRcdFwidXVpZFwiOiBcIl45LjAuMVwiLFxuXHRcdFwidXVpZHY0XCI6IFwiXjYuMi4xM1wiLFxuXHRcdFwidml0ZVwiOiBcIl41LjMuNVwiLFxuXHRcdFwidml0ZS1wbHVnaW4tY2hlY2tlclwiOiBcIl4wLjYuMlwiLFxuXHRcdFwidml0ZS1wbHVnaW4tc3RhdGljLWNvcHlcIjogXCJeMS4wLjNcIixcblx0XHRcInZpdGUtdHNjb25maWctcGF0aHNcIjogXCJeNC4zLjJcIixcblx0XHRcInlhcmdzXCI6IFwiXjE3LjcuMlwiXG5cdH0sXG5cdFwiZGVwZW5kZW5jaWVzXCI6IHtcblx0XHRcIkBjb2RlbWlycm9yL2F1dG9jb21wbGV0ZVwiOiBcIl42LjEyLjBcIixcblx0XHRcIkBjb2RlbWlycm9yL2xhbmctanNvblwiOiBcIl42LjAuMVwiLFxuXHRcdFwiQHlhaXJlby90YWdpZnlcIjogXCI0LjI2LjZcIixcblx0XHRcImNvZGVtaXJyb3JcIjogXCJeNi4wLjFcIixcblx0XHRcImx1eG9uXCI6IFwiXjMuNC40XCIsXG5cdFx0XCJtaW5pc2VhcmNoXCI6IFwiXjYuMy4wXCIsXG5cdFx0XCJub3Vpc2xpZGVyXCI6IFwiXjE1LjcuMVwiLFxuXHRcdFwicmVtZWRhXCI6IFwiXjEuNjEuMFwiLFxuXHRcdFwic29ydGFibGVqc1wiOiBcIl4xLjE1LjFcIlxuXHR9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThPLFNBQVMsZ0JBQWdCO0FBQ3ZRLE9BQU8sYUFBYTtBQUNwQixPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFFakIsWUFBWSxVQUFVO0FBQ3RCLE9BQU8sYUFBYTtBQUNwQixTQUFTLHNCQUFzQjtBQUMvQixPQUFPLG1CQUFtQjs7O0FDUjFCO0FBQUEsRUFDQyxNQUFRO0FBQUEsRUFDUixT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
