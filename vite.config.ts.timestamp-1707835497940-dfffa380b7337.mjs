// vite.config.ts
import { execSync } from "child_process";
import esbuild from "file:///home/nick/git/gcsga/node_modules/esbuild/lib/main.js";
import fs from "file:///home/nick/git/gcsga/node_modules/fs-extra/lib/index.js";
import path from "path";
import Peggy from "file:///home/nick/git/gcsga/node_modules/peggy/lib/peg.js";
import * as Vite from "file:///home/nick/git/gcsga/node_modules/vite/dist/node/index.js";
import checker from "file:///home/nick/git/gcsga/node_modules/vite-plugin-checker/dist/esm/main.js";
import { viteStaticCopy } from "file:///home/nick/git/gcsga/node_modules/vite-plugin-static-copy/dist/index.js";
import tsconfigPaths from "file:///home/nick/git/gcsga/node_modules/vite-tsconfig-paths/dist/index.mjs";

// package.json
var package_default = {
  private: true,
  name: "gcsga",
  description: "A game aid to help play GURPS 4e for Foundry VTT",
  license: "MIT",
  homepage: "https://github.com/crnormand/gurps",
  repository: {
    type: "git",
    url: "https://github.com/crnormand/gurps"
  },
  bugs: {
    url: "https://github.com/crnormand/gurps/issues"
  },
  contributors: [
    {
      name: "Chris Normand",
      email: "nose66@bellsouth.net"
    },
    {
      name: "Nick Coffin",
      email: "geek.macbeer@gmail.com"
    },
    {
      name: "Mikolaj Tomczynski",
      email: "mikolajtomczynski@gmail.com"
    }
  ],
  type: "module",
  scripts: {
    build: "npm run clean && vite build",
    build2: "npm run clean && npm run build:packs && vite build",
    "build:packs": "tsx ./build/build-packs.ts",
    "build:packs:json": "tsx ./build/build-packs.ts json",
    "build:conditions": "tsx ./build/conditions.ts",
    clean: "tsx ./build/clean.ts",
    watch: "npm run clean && vite build --watch --mode development",
    watch2: "npm run clean && npm run build:packs && vite build --watch --mode development",
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
  devDependencies: {
    "@pixi/graphics-smooth": "^1.1.0",
    "@pixi/particle-emitter": "5.0.8",
    "@types/fs-extra": "^11.0.4",
    "@types/glob": "^8.1.0",
    "@types/jest": "^29.5.11",
    "@types/jquery": "^3.5.29",
    "@types/jsdom": "^21.1.6",
    "@types/luxon": "^3.4.0",
    "@types/node": "20.10.6",
    "@types/prompts": "^2.4.9",
    "@types/sortablejs": "^1.15.7",
    "@types/tooltipster": "^0.0.35",
    "@types/yaireo__tagify": "4.17.0",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@typescript-eslint/parser": "^6.21.0",
    "classic-level": "^1.3.0",
    "es-jest": "^2.1.0",
    eslint: "^8.56.0",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-jest": "^27.6.1",
    "eslint-plugin-json": "^3.1.0",
    "eslint-plugin-prettier": "5.1.2",
    "fs-extra": "^11.2.0",
    "fuse.js": "^7.0.0",
    gsap: "3.11.5",
    handlebars: "4.7.7",
    jest: "^29.7.0",
    "jest-each": "^29.7.0",
    jsdom: "^23.1.0",
    peggy: "^3.0.2",
    "pixi.js": "7.2.4",
    prettier: "3.1.1",
    prompts: "^2.4.2",
    "prosemirror-view": "1.32.5",
    sass: "^1.69.7",
    "socket.io": "4.6.2",
    "socket.io-client": "4.6.2",
    tinymce: "6.7.3",
    "tsconfig-paths": "^4.2.0",
    tsx: "^4.7.0",
    typescript: "^5.3.3",
    uuid: "^9.0.1",
    uuidv4: "^6.2.13",
    vite: "^5.0.11",
    "vite-plugin-checker": "^0.6.2",
    "vite-plugin-static-copy": "^1.0.0",
    "vite-tsconfig-paths": "^4.2.3",
    yargs: "^17.7.2"
  },
  dependencies: {
    "@codemirror/autocomplete": "^6.11.1",
    "@codemirror/lang-json": "^6.0.1",
    "@yaireo/tagify": "4.16.4",
    codemirror: "^6.0.1",
    luxon: "^3.4.4",
    minisearch: "^6.3.0",
    nouislider: "^15.7.1",
    remeda: "^1.33.0",
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
  const rollGrammar = fs.readFileSync("roll-grammar.peggy", { encoding: "utf-8" });
  const ROLL_PARSER = Peggy.generate(rollGrammar, { output: "source" }).replace(
    "return {\n    SyntaxError: peg$SyntaxError,\n    parse: peg$parse\n  };",
    "AbstractDamageRoll.parser = { SyntaxError: peg$SyntaxError, parse: peg$parse };"
  );
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
          if (context.file.startsWith(outDir))
            return;
          if (context.file.endsWith("en.json")) {
            const basePath = context.file.slice(context.file.indexOf("lang/"));
            console.log(`Updating lang file at ${basePath}`);
            fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
              context.server.ws.send({
                type: "custom",
                event: "lang-update",
                data: { path: `systems/gcsga/${basePath}` }
              });
            });
          } else if (context.file.endsWith(".hbs")) {
            const basePath = context.file.slice(context.file.indexOf("templates/"));
            console.log(`Updating template file at ${basePath}`);
            fs.promises.copyFile(context.file, `${outDir}/${basePath}`).then(() => {
              context.server.ws.send({
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
    if (!fs.existsSync("./styles"))
      fs.mkdirSync("./styles");
    fs.writeFileSync("./styles/gcsga.css", `/** ${message} */
`);
    fs.writeFileSync("./gcsga.mjs", `/** ${message} */

import "./src/gcsga.ts";
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
      ROLL_PARSER: JSON.stringify(ROLL_PARSER),
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
        entry: "src/gcsga.ts",
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
          assetFileNames: ({ name }) => name === "style.css" ? "styles/gcsga.css" : name ?? "",
          chunkFileNames: "[name].mjs",
          entryFileNames: "gcsga.mjs",
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
        "/socket.io": {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvbmljay9naXQvZ2NzZ2FcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL25pY2svZ2l0L2djc2dhL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL25pY2svZ2l0L2djc2dhL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiXG5pbXBvcnQgZXNidWlsZCBmcm9tIFwiZXNidWlsZFwiXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcbmltcG9ydCBQZWdneSBmcm9tIFwicGVnZ3lcIlxuaW1wb3J0ICogYXMgVml0ZSBmcm9tIFwidml0ZVwiXG5pbXBvcnQgY2hlY2tlciBmcm9tIFwidml0ZS1wbHVnaW4tY2hlY2tlclwiXG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1zdGF0aWMtY29weVwiXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSBcIi4vcGFja2FnZS5qc29uXCIgYXNzZXJ0IHsgdHlwZTogXCJqc29uXCIgfVxuaW1wb3J0IHsgQ29uZGl0aW9uU291cmNlIH0gZnJvbSBcIkBpdGVtL2NvbmRpdGlvbi9kYXRhLnRzXCJcblxuY29uc3QgQ09ORElUSU9OX1NPVVJDRVMgPSAoKCk6IENvbmRpdGlvblNvdXJjZVtdID0+IHtcblx0Y29uc3Qgb3V0cHV0ID0gZXhlY1N5bmMoXCJucG0gcnVuIGJ1aWxkOmNvbmRpdGlvbnNcIiwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pXG5cdHJldHVybiBKU09OLnBhcnNlKG91dHB1dC5zbGljZShvdXRwdXQuaW5kZXhPZihcIltcIikpKVxufSkoKVxuY29uc3QgRU5fSlNPTiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKFwiLi9zdGF0aWMvbGFuZy9lbi5qc29uXCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KSlcblxuY29uc3QgY29uZmlnID0gVml0ZS5kZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KTogVml0ZS5Vc2VyQ29uZmlnID0+IHtcblx0Y29uc3QgYnVpbGRNb2RlID0gbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcInByb2R1Y3Rpb25cIiA6IFwiZGV2ZWxvcG1lbnRcIlxuXHRjb25zdCBvdXREaXIgPSBcImRpc3RcIlxuXG5cdGNvbnN0IHJvbGxHcmFtbWFyID0gZnMucmVhZEZpbGVTeW5jKFwicm9sbC1ncmFtbWFyLnBlZ2d5XCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KVxuXHRjb25zdCBST0xMX1BBUlNFUiA9IFBlZ2d5LmdlbmVyYXRlKHJvbGxHcmFtbWFyLCB7IG91dHB1dDogXCJzb3VyY2VcIiB9KS5yZXBsYWNlKFxuXHRcdFwicmV0dXJuIHtcXG4gICAgU3ludGF4RXJyb3I6IHBlZyRTeW50YXhFcnJvcixcXG4gICAgcGFyc2U6IHBlZyRwYXJzZVxcbiAgfTtcIixcblx0XHRcIkFic3RyYWN0RGFtYWdlUm9sbC5wYXJzZXIgPSB7IFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsIHBhcnNlOiBwZWckcGFyc2UgfTtcIixcblx0KVxuXG5cdGNvbnN0IHBsdWdpbnMgPSBbY2hlY2tlcih7IHR5cGVzY3JpcHQ6IHRydWUgfSksIHRzY29uZmlnUGF0aHMoKV1cblx0Ly8gSGFuZGxlIG1pbmlmaWNhdGlvbiBhZnRlciBidWlsZCB0byBhbGxvdyBmb3IgdHJlZS1zaGFraW5nIGFuZCB3aGl0ZXNwYWNlIG1pbmlmaWNhdGlvblxuXHQvLyBcIk5vdGUgdGhlIGJ1aWxkLm1pbmlmeSBvcHRpb24gZG9lcyBub3QgbWluaWZ5IHdoaXRlc3BhY2VzIHdoZW4gdXNpbmcgdGhlICdlcycgZm9ybWF0IGluIGxpYiBtb2RlLCBhcyBpdCByZW1vdmVzXG5cdC8vIHB1cmUgYW5ub3RhdGlvbnMgYW5kIGJyZWFrcyB0cmVlLXNoYWtpbmcuXCJcblx0aWYgKGJ1aWxkTW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIpIHtcblx0XHRwbHVnaW5zLnB1c2goXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IFwibWluaWZ5XCIsXG5cdFx0XHRcdHJlbmRlckNodW5rOiB7XG5cdFx0XHRcdFx0b3JkZXI6IFwicG9zdFwiLFxuXHRcdFx0XHRcdGFzeW5jIGhhbmRsZXIoY29kZSwgY2h1bmspIHtcblx0XHRcdFx0XHRcdHJldHVybiBjaHVuay5maWxlTmFtZS5lbmRzV2l0aChcIi5tanNcIilcblx0XHRcdFx0XHRcdFx0PyBlc2J1aWxkLnRyYW5zZm9ybShjb2RlLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRrZWVwTmFtZXM6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRtaW5pZnlJZGVudGlmaWVyczogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRtaW5pZnlTeW50YXg6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRtaW5pZnlXaGl0ZXNwYWNlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDogY29kZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0Li4udml0ZVN0YXRpY0NvcHkoe1xuXHRcdFx0XHR0YXJnZXRzOiBbXG5cdFx0XHRcdFx0Ly8geyBzcmM6IFwiQ0hBTkdFTE9HLm1kXCIsIGRlc3Q6IFwiLlwiIH0sXG5cdFx0XHRcdFx0eyBzcmM6IFwiUkVBRE1FLm1kXCIsIGRlc3Q6IFwiLlwiIH0sXG5cdFx0XHRcdFx0Ly8geyBzcmM6IFwiQ09OVFJJQlVUSU5HLm1kXCIsIGRlc3Q6IFwiLlwiIH0sXG5cdFx0XHRcdF0sXG5cdFx0XHR9KSxcblx0XHQpXG5cdH0gZWxzZSB7XG5cdFx0cGx1Z2lucy5wdXNoKFxuXHRcdFx0Ly8gRm91bmRyeSBleHBlY3RzIGFsbCBlc20gZmlsZXMgbGlzdGVkIGluIHN5c3RlbS5qc29uIHRvIGV4aXN0OiBjcmVhdGUgZW1wdHkgdmVuZG9yIG1vZHVsZSB3aGVuIGluIGRldiBtb2RlXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IFwidG91Y2gtdmVuZG9yLW1qc1wiLFxuXHRcdFx0XHRhcHBseTogXCJidWlsZFwiLFxuXHRcdFx0XHR3cml0ZUJ1bmRsZToge1xuXHRcdFx0XHRcdGFzeW5jIGhhbmRsZXIoKSB7XG5cdFx0XHRcdFx0XHRmcy5jbG9zZVN5bmMoZnMub3BlblN5bmMocGF0aC5yZXNvbHZlKG91dERpciwgXCJ2ZW5kb3IubWpzXCIpLCBcIndcIikpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHQvLyBWaXRlIEhNUiBpcyBvbmx5IHByZWNvbmZpZ3VyZWQgZm9yIGNzcyBmaWxlczogYWRkIGhhbmRsZXIgZm9yIEhCUyB0ZW1wbGF0ZXNcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogXCJobXItaGFuZGxlclwiLFxuXHRcdFx0XHRhcHBseTogXCJzZXJ2ZVwiLFxuXHRcdFx0XHRoYW5kbGVIb3RVcGRhdGUoY29udGV4dCkge1xuXHRcdFx0XHRcdGlmIChjb250ZXh0LmZpbGUuc3RhcnRzV2l0aChvdXREaXIpKSByZXR1cm5cblxuXHRcdFx0XHRcdGlmIChjb250ZXh0LmZpbGUuZW5kc1dpdGgoXCJlbi5qc29uXCIpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBiYXNlUGF0aCA9IGNvbnRleHQuZmlsZS5zbGljZShjb250ZXh0LmZpbGUuaW5kZXhPZihcImxhbmcvXCIpKVxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYFVwZGF0aW5nIGxhbmcgZmlsZSBhdCAke2Jhc2VQYXRofWApXG5cdFx0XHRcdFx0XHRmcy5wcm9taXNlcy5jb3B5RmlsZShjb250ZXh0LmZpbGUsIGAke291dERpcn0vJHtiYXNlUGF0aH1gKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dC5zZXJ2ZXIud3Muc2VuZCh7XG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJjdXN0b21cIixcblx0XHRcdFx0XHRcdFx0XHRldmVudDogXCJsYW5nLXVwZGF0ZVwiLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGE6IHsgcGF0aDogYHN5c3RlbXMvZ2NzZ2EvJHtiYXNlUGF0aH1gIH0sXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoY29udGV4dC5maWxlLmVuZHNXaXRoKFwiLmhic1wiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgYmFzZVBhdGggPSBjb250ZXh0LmZpbGUuc2xpY2UoY29udGV4dC5maWxlLmluZGV4T2YoXCJ0ZW1wbGF0ZXMvXCIpKVxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYFVwZGF0aW5nIHRlbXBsYXRlIGZpbGUgYXQgJHtiYXNlUGF0aH1gKVxuXHRcdFx0XHRcdFx0ZnMucHJvbWlzZXMuY29weUZpbGUoY29udGV4dC5maWxlLCBgJHtvdXREaXJ9LyR7YmFzZVBhdGh9YCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHQuc2VydmVyLndzLnNlbmQoe1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwiY3VzdG9tXCIsXG5cdFx0XHRcdFx0XHRcdFx0ZXZlbnQ6IFwidGVtcGxhdGUtdXBkYXRlXCIsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTogeyBwYXRoOiBgc3lzdGVtcy9nY3NnYS8ke2Jhc2VQYXRofWAgfSxcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHQpXG5cdH1cblxuXHQvLyBDcmVhdGUgZHVtbXkgZmlsZXMgZm9yIHZpdGUgZGV2IHNlcnZlclxuXHRpZiAoY29tbWFuZCA9PT0gXCJzZXJ2ZVwiKSB7XG5cdFx0Y29uc3QgbWVzc2FnZSA9IFwiVGhpcyBmaWxlIGlzIGZvciBhIHJ1bm5pbmcgdml0ZSBkZXYgc2VydmVyIGFuZCBpcyBub3QgY29waWVkIHRvIGEgYnVpbGRcIlxuXHRcdGZzLndyaXRlRmlsZVN5bmMoXCIuL2luZGV4Lmh0bWxcIiwgYDxoMT4ke21lc3NhZ2V9PC9oMT5cXG5gKVxuXHRcdGlmICghZnMuZXhpc3RzU3luYyhcIi4vc3R5bGVzXCIpKSBmcy5ta2RpclN5bmMoXCIuL3N0eWxlc1wiKVxuXHRcdGZzLndyaXRlRmlsZVN5bmMoXCIuL3N0eWxlcy9nY3NnYS5jc3NcIiwgYC8qKiAke21lc3NhZ2V9ICovXFxuYClcblx0XHRmcy53cml0ZUZpbGVTeW5jKFwiLi9nY3NnYS5tanNcIiwgYC8qKiAke21lc3NhZ2V9ICovXFxuXFxuaW1wb3J0IFwiLi9zcmMvZ2NzZ2EudHNcIjtcXG5gKVxuXHRcdGZzLndyaXRlRmlsZVN5bmMoXCIuL3ZlbmRvci5tanNcIiwgYC8qKiAke21lc3NhZ2V9ICovXFxuYClcblx0fVxuXG5cdC8vIGNvbnN0IHJlRXNjYXBlID0gKHM6IHN0cmluZykgPT4gcy5yZXBsYWNlKC9bLS9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKVxuXG5cdHJldHVybiB7XG5cdFx0YmFzZTogY29tbWFuZCA9PT0gXCJidWlsZFwiID8gXCIuL1wiIDogXCIvc3lzdGVtcy9nY3NnYS9cIixcblx0XHRwdWJsaWNEaXI6IFwic3RhdGljXCIsXG5cdFx0ZGVmaW5lOiB7XG5cdFx0XHRCVUlMRF9NT0RFOiBKU09OLnN0cmluZ2lmeShidWlsZE1vZGUpLFxuXHRcdFx0Q09ORElUSU9OX1NPVVJDRVM6IEpTT04uc3RyaW5naWZ5KENPTkRJVElPTl9TT1VSQ0VTKSxcblx0XHRcdEVOX0pTT046IEpTT04uc3RyaW5naWZ5KEVOX0pTT04pLFxuXHRcdFx0Uk9MTF9QQVJTRVI6IEpTT04uc3RyaW5naWZ5KFJPTExfUEFSU0VSKSxcblx0XHRcdGZ1OiBcImZvdW5kcnkudXRpbHNcIixcblx0XHR9LFxuXHRcdGVzYnVpbGQ6IHsga2VlcE5hbWVzOiB0cnVlIH0sXG5cdFx0YnVpbGQ6IHtcblx0XHRcdG91dERpcixcblx0XHRcdGVtcHR5T3V0RGlyOiBmYWxzZSwgLy8gZmFpbHMgaWYgd29ybGQgaXMgcnVubmluZyBkdWUgdG8gY29tcGVuZGl1bSBsb2Nrcy4gV2UgZG8gaXQgaW4gXCJucG0gcnVuIGNsZWFuXCIgaW5zdGVhZC5cblx0XHRcdG1pbmlmeTogZmFsc2UsXG5cdFx0XHRzb3VyY2VtYXA6IGJ1aWxkTW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiLFxuXHRcdFx0bGliOiB7XG5cdFx0XHRcdG5hbWU6IFwiZ2NzZ2FcIixcblx0XHRcdFx0ZW50cnk6IFwic3JjL2djc2dhLnRzXCIsXG5cdFx0XHRcdGZvcm1hdHM6IFtcImVzXCJdLFxuXHRcdFx0XHRmaWxlTmFtZTogXCJnY3NnYVwiLFxuXHRcdFx0fSxcblx0XHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdFx0Ly8gZXh0ZXJuYWw6IG5ldyBSZWdFeHAoXG5cdFx0XHRcdC8vIFx0W1xuXHRcdFx0XHQvLyBcdFx0XCIoPzpcIixcblx0XHRcdFx0Ly8gXHRcdHJlRXNjYXBlKFwiLi4vLi4vaWNvbnMvd2VhcG9ucy9cIiksXG5cdFx0XHRcdC8vIFx0XHRcIlstYS16L10rXCIsXG5cdFx0XHRcdC8vIFx0XHRyZUVzY2FwZShcIi53ZWJwXCIpLFxuXHRcdFx0XHQvLyBcdFx0XCJ8XCIsXG5cdFx0XHRcdC8vIFx0XHRyZUVzY2FwZShcIi4uL3VpL3BhcmNobWVudC5qcGdcIiksXG5cdFx0XHRcdC8vIFx0XHRcIikkXCIsXG5cdFx0XHRcdC8vIFx0XS5qb2luKFwiXCIpLFxuXHRcdFx0XHQvLyApLFxuXHRcdFx0XHRvdXRwdXQ6IHtcblx0XHRcdFx0XHRhc3NldEZpbGVOYW1lczogKHsgbmFtZSB9KTogc3RyaW5nID0+IChuYW1lID09PSBcInN0eWxlLmNzc1wiID8gXCJzdHlsZXMvZ2NzZ2EuY3NzXCIgOiBuYW1lID8/IFwiXCIpLFxuXHRcdFx0XHRcdGNodW5rRmlsZU5hbWVzOiBcIltuYW1lXS5tanNcIixcblx0XHRcdFx0XHRlbnRyeUZpbGVOYW1lczogXCJnY3NnYS5tanNcIixcblx0XHRcdFx0XHRtYW51YWxDaHVua3M6IHtcblx0XHRcdFx0XHRcdHZlbmRvcjogYnVpbGRNb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IE9iamVjdC5rZXlzKHBhY2thZ2VKU09OLmRlcGVuZGVuY2llcykgOiBbXSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR3YXRjaDogeyBidWlsZERlbGF5OiAxMDAgfSxcblx0XHRcdH0sXG5cdFx0XHR0YXJnZXQ6IFwiZXMyMDIyXCIsXG5cdFx0fSxcblx0XHRzZXJ2ZXI6IHtcblx0XHRcdHBvcnQ6IDMwMDAxLFxuXHRcdFx0b3BlbjogXCIvZ2FtZVwiLFxuXHRcdFx0cHJveHk6IHtcblx0XHRcdFx0XCJeKD8hL3N5c3RlbXMvZ2NzZ2EvKVwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMDAvXCIsXG5cdFx0XHRcdFwiL3NvY2tldC5pb1wiOiB7XG5cdFx0XHRcdFx0dGFyZ2V0OiBcIndzOi8vbG9jYWxob3N0OjMwMDAwXCIsXG5cdFx0XHRcdFx0d3M6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0cGx1Z2lucyxcblx0XHRjc3M6IHtcblx0XHRcdGRldlNvdXJjZW1hcDogYnVpbGRNb2RlID09PSBcImRldmVsb3BtZW50XCIsXG5cdFx0fSxcblx0fVxufSlcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnXG4iLCAie1xuXHRcInByaXZhdGVcIjogdHJ1ZSxcblx0XCJuYW1lXCI6IFwiZ2NzZ2FcIixcblx0XCJkZXNjcmlwdGlvblwiOiBcIkEgZ2FtZSBhaWQgdG8gaGVscCBwbGF5IEdVUlBTIDRlIGZvciBGb3VuZHJ5IFZUVFwiLFxuXHRcImxpY2Vuc2VcIjogXCJNSVRcIixcblx0XCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jcm5vcm1hbmQvZ3VycHNcIixcblx0XCJyZXBvc2l0b3J5XCI6IHtcblx0XHRcInR5cGVcIjogXCJnaXRcIixcblx0XHRcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jcm5vcm1hbmQvZ3VycHNcIlxuXHR9LFxuXHRcImJ1Z3NcIjoge1xuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2Nybm9ybWFuZC9ndXJwcy9pc3N1ZXNcIlxuXHR9LFxuXHRcImNvbnRyaWJ1dG9yc1wiOiBbXG5cdFx0e1xuXHRcdFx0XCJuYW1lXCI6IFwiQ2hyaXMgTm9ybWFuZFwiLFxuXHRcdFx0XCJlbWFpbFwiOiBcIm5vc2U2NkBiZWxsc291dGgubmV0XCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdFwibmFtZVwiOiBcIk5pY2sgQ29mZmluXCIsXG5cdFx0XHRcImVtYWlsXCI6IFwiZ2Vlay5tYWNiZWVyQGdtYWlsLmNvbVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcIm5hbWVcIjogXCJNaWtvbGFqIFRvbWN6eW5za2lcIixcblx0XHRcdFwiZW1haWxcIjogXCJtaWtvbGFqdG9tY3p5bnNraUBnbWFpbC5jb21cIlxuXHRcdH1cblx0XSxcblx0XCJ0eXBlXCI6IFwibW9kdWxlXCIsXG5cdFwic2NyaXB0c1wiOiB7XG5cdFx0XCJidWlsZFwiOiBcIm5wbSBydW4gY2xlYW4gJiYgdml0ZSBidWlsZFwiLFxuXHRcdFwiYnVpbGQyXCI6IFwibnBtIHJ1biBjbGVhbiAmJiBucG0gcnVuIGJ1aWxkOnBhY2tzICYmIHZpdGUgYnVpbGRcIixcblx0XHRcImJ1aWxkOnBhY2tzXCI6IFwidHN4IC4vYnVpbGQvYnVpbGQtcGFja3MudHNcIixcblx0XHRcImJ1aWxkOnBhY2tzOmpzb25cIjogXCJ0c3ggLi9idWlsZC9idWlsZC1wYWNrcy50cyBqc29uXCIsXG5cdFx0XCJidWlsZDpjb25kaXRpb25zXCI6IFwidHN4IC4vYnVpbGQvY29uZGl0aW9ucy50c1wiLFxuXHRcdFwiY2xlYW5cIjogXCJ0c3ggLi9idWlsZC9jbGVhbi50c1wiLFxuXHRcdFwid2F0Y2hcIjogXCJucG0gcnVuIGNsZWFuICYmIHZpdGUgYnVpbGQgLS13YXRjaCAtLW1vZGUgZGV2ZWxvcG1lbnRcIixcblx0XHRcIndhdGNoMlwiOiBcIm5wbSBydW4gY2xlYW4gJiYgbnBtIHJ1biBidWlsZDpwYWNrcyAmJiB2aXRlIGJ1aWxkIC0td2F0Y2ggLS1tb2RlIGRldmVsb3BtZW50XCIsXG5cdFx0XCJob3RcIjogXCJ2aXRlIHNlcnZlXCIsXG5cdFx0XCJsaW5rXCI6IFwidHN4IC4vYnVpbGQvbGluay1mb3VuZHJ5LnRzXCIsXG5cdFx0XCJleHRyYWN0UGFja3NcIjogXCJ0c3ggLi9idWlsZC9leHRyYWN0LXBhY2tzLnRzXCIsXG5cdFx0XCJwcmV0ZXN0XCI6IFwibnBtIHJ1biBsaW50XCIsXG5cdFx0XCJ0ZXN0XCI6IFwiamVzdFwiLFxuXHRcdFwibWlncmF0ZVwiOiBcInRzeCAuL2J1aWxkL3J1bi1taWdyYXRpb24udHNcIixcblx0XHRcImxpbnRcIjogXCJucG0gcnVuIGxpbnQ6dHMgJiYgbnBtIHJ1biBsaW50Ompzb24gJiYgbnBtIHJ1biBwcmV0dGllcjpzY3NzXCIsXG5cdFx0XCJsaW50OnRzXCI6IFwiZXNsaW50IC4vYnVpbGQgLi9zcmMgLi90ZXN0cyAuL3R5cGVzIC0tZXh0IC50c1wiLFxuXHRcdFwicHJldHRpZXI6c2Nzc1wiOiBcInByZXR0aWVyIC0tY2hlY2sgc3JjL3N0eWxlc1wiLFxuXHRcdFwibGludDpqc29uXCI6IFwiZXNsaW50IC4vc3RhdGljIC0tZXh0IC5qc29uIC0tbm8tZXNsaW50cmMgLS1wbHVnaW4ganNvbiAtLXJ1bGUgXFxcImpzb24vKjogZXJyb3JcXFwiIC0tcnVsZSBcXFwibGluZWJyZWFrLXN0eWxlOiBlcnJvclxcXCJcIixcblx0XHRcImxpbnQ6Zml4XCI6IFwiZXNsaW50IC4vYnVpbGQgLi9zcmMgLi90ZXN0cyAuL3R5cGVzIC0tZXh0IC50cyAtLWZpeCAmJiBwcmV0dGllciAtLXdyaXRlIHNyYy9zdHlsZXNcIlxuXHR9LFxuXHRcImRldkRlcGVuZGVuY2llc1wiOiB7XG5cdFx0XCJAcGl4aS9ncmFwaGljcy1zbW9vdGhcIjogXCJeMS4xLjBcIixcblx0XHRcIkBwaXhpL3BhcnRpY2xlLWVtaXR0ZXJcIjogXCI1LjAuOFwiLFxuXHRcdFwiQHR5cGVzL2ZzLWV4dHJhXCI6IFwiXjExLjAuNFwiLFxuXHRcdFwiQHR5cGVzL2dsb2JcIjogXCJeOC4xLjBcIixcblx0XHRcIkB0eXBlcy9qZXN0XCI6IFwiXjI5LjUuMTFcIixcblx0XHRcIkB0eXBlcy9qcXVlcnlcIjogXCJeMy41LjI5XCIsXG5cdFx0XCJAdHlwZXMvanNkb21cIjogXCJeMjEuMS42XCIsXG5cdFx0XCJAdHlwZXMvbHV4b25cIjogXCJeMy40LjBcIixcblx0XHRcIkB0eXBlcy9ub2RlXCI6IFwiMjAuMTAuNlwiLFxuXHRcdFwiQHR5cGVzL3Byb21wdHNcIjogXCJeMi40LjlcIixcblx0XHRcIkB0eXBlcy9zb3J0YWJsZWpzXCI6IFwiXjEuMTUuN1wiLFxuXHRcdFwiQHR5cGVzL3Rvb2x0aXBzdGVyXCI6IFwiXjAuMC4zNVwiLFxuXHRcdFwiQHR5cGVzL3lhaXJlb19fdGFnaWZ5XCI6IFwiNC4xNy4wXCIsXG5cdFx0XCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl42LjE5LjFcIixcblx0XHRcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCJeNi4yMS4wXCIsXG5cdFx0XCJjbGFzc2ljLWxldmVsXCI6IFwiXjEuMy4wXCIsXG5cdFx0XCJlcy1qZXN0XCI6IFwiXjIuMS4wXCIsXG5cdFx0XCJlc2xpbnRcIjogXCJeOC41Ni4wXCIsXG5cdFx0XCJlc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiOS4xLjBcIixcblx0XHRcImVzbGludC1wbHVnaW4tamVzdFwiOiBcIl4yNy42LjFcIixcblx0XHRcImVzbGludC1wbHVnaW4tanNvblwiOiBcIl4zLjEuMFwiLFxuXHRcdFwiZXNsaW50LXBsdWdpbi1wcmV0dGllclwiOiBcIjUuMS4yXCIsXG5cdFx0XCJmcy1leHRyYVwiOiBcIl4xMS4yLjBcIixcblx0XHRcImZ1c2UuanNcIjogXCJeNy4wLjBcIixcblx0XHRcImdzYXBcIjogXCIzLjExLjVcIixcblx0XHRcImhhbmRsZWJhcnNcIjogXCI0LjcuN1wiLFxuXHRcdFwiamVzdFwiOiBcIl4yOS43LjBcIixcblx0XHRcImplc3QtZWFjaFwiOiBcIl4yOS43LjBcIixcblx0XHRcImpzZG9tXCI6IFwiXjIzLjEuMFwiLFxuXHRcdFwicGVnZ3lcIjogXCJeMy4wLjJcIixcblx0XHRcInBpeGkuanNcIjogXCI3LjIuNFwiLFxuXHRcdFwicHJldHRpZXJcIjogXCIzLjEuMVwiLFxuXHRcdFwicHJvbXB0c1wiOiBcIl4yLjQuMlwiLFxuXHRcdFwicHJvc2VtaXJyb3Itdmlld1wiOiBcIjEuMzIuNVwiLFxuXHRcdFwic2Fzc1wiOiBcIl4xLjY5LjdcIixcblx0XHRcInNvY2tldC5pb1wiOiBcIjQuNi4yXCIsXG5cdFx0XCJzb2NrZXQuaW8tY2xpZW50XCI6IFwiNC42LjJcIixcblx0XHRcInRpbnltY2VcIjogXCI2LjcuM1wiLFxuXHRcdFwidHNjb25maWctcGF0aHNcIjogXCJeNC4yLjBcIixcblx0XHRcInRzeFwiOiBcIl40LjcuMFwiLFxuXHRcdFwidHlwZXNjcmlwdFwiOiBcIl41LjMuM1wiLFxuXHRcdFwidXVpZFwiOiBcIl45LjAuMVwiLFxuXHRcdFwidXVpZHY0XCI6IFwiXjYuMi4xM1wiLFxuXHRcdFwidml0ZVwiOiBcIl41LjAuMTFcIixcblx0XHRcInZpdGUtcGx1Z2luLWNoZWNrZXJcIjogXCJeMC42LjJcIixcblx0XHRcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI6IFwiXjEuMC4wXCIsXG5cdFx0XCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI6IFwiXjQuMi4zXCIsXG5cdFx0XCJ5YXJnc1wiOiBcIl4xNy43LjJcIlxuXHR9LFxuXHRcImRlcGVuZGVuY2llc1wiOiB7XG5cdFx0XCJAY29kZW1pcnJvci9hdXRvY29tcGxldGVcIjogXCJeNi4xMS4xXCIsXG5cdFx0XCJAY29kZW1pcnJvci9sYW5nLWpzb25cIjogXCJeNi4wLjFcIixcblx0XHRcIkB5YWlyZW8vdGFnaWZ5XCI6IFwiNC4xNi40XCIsXG5cdFx0XCJjb2RlbWlycm9yXCI6IFwiXjYuMC4xXCIsXG5cdFx0XCJsdXhvblwiOiBcIl4zLjQuNFwiLFxuXHRcdFwibWluaXNlYXJjaFwiOiBcIl42LjMuMFwiLFxuXHRcdFwibm91aXNsaWRlclwiOiBcIl4xNS43LjFcIixcblx0XHRcInJlbWVkYVwiOiBcIl4xLjMzLjBcIixcblx0XHRcInNvcnRhYmxlanNcIjogXCJeMS4xNS4xXCJcblx0fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4TyxTQUFTLGdCQUFnQjtBQUN2USxPQUFPLGFBQWE7QUFDcEIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sV0FBVztBQUNsQixZQUFZLFVBQVU7QUFDdEIsT0FBTyxhQUFhO0FBQ3BCLFNBQVMsc0JBQXNCO0FBQy9CLE9BQU8sbUJBQW1COzs7QUNSMUI7QUFBQSxFQUNDLFNBQVc7QUFBQSxFQUNYLE1BQVE7QUFBQSxFQUNSLGFBQWU7QUFBQSxFQUNmLFNBQVc7QUFBQSxFQUNYLFVBQVk7QUFBQSxFQUNaLFlBQWM7QUFBQSxJQUNiLE1BQVE7QUFBQSxJQUNSLEtBQU87QUFBQSxFQUNSO0FBQUEsRUFDQSxNQUFRO0FBQUEsSUFDUCxLQUFPO0FBQUEsRUFDUjtBQUFBLEVBQ0EsY0FBZ0I7QUFBQSxJQUNmO0FBQUEsTUFDQyxNQUFRO0FBQUEsTUFDUixPQUFTO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxNQUNDLE1BQVE7QUFBQSxNQUNSLE9BQVM7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLE1BQ0MsTUFBUTtBQUFBLE1BQ1IsT0FBUztBQUFBLElBQ1Y7QUFBQSxFQUNEO0FBQUEsRUFDQSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsSUFDVixPQUFTO0FBQUEsSUFDVCxRQUFVO0FBQUEsSUFDVixlQUFlO0FBQUEs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
