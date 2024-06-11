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
    tdd: "jest --coverage",
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
    "@types/node": "20.11.19",
    "@types/prompts": "^2.4.9",
    "@types/sortablejs": "^1.15.8",
    "@types/tooltipster": "^0.0.35",
    "@types/yaireo__tagify": "4.18.0",
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
    gsap: "3.12.5",
    handlebars: "4.7.8",
    jest: "^29.7.0",
    "jest-each": "^29.7.0",
    jsdom: "^23.1.0",
    peggy: "^3.0.2",
    "pixi.js": "7.2.4",
    prettier: "3.1.1",
    prompts: "^2.4.2",
    "prosemirror-view": "1.32.5",
    sass: "^1.71.0",
    "socket.io": "4.6.2",
    "socket.io-client": "4.7.4",
    tinymce: "6.8.3",
    "tsconfig-paths": "^4.2.0",
    tsx: "^4.7.0",
    typescript: "^5.3.3",
    uuid: "^9.0.1",
    uuidv4: "^6.2.13",
    vite: "^5.1.1",
    "vite-plugin-checker": "^0.6.2",
    "vite-plugin-static-copy": "^1.0.1",
    "vite-tsconfig-paths": "^4.2.3",
    yargs: "^17.7.2"
  },
  dependencies: {
    "@codemirror/autocomplete": "^6.11.1",
    "@codemirror/lang-json": "^6.0.1",
    "@yaireo/tagify": "4.20.0",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvbmljay9naXQvZ2NzZ2FcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL25pY2svZ2l0L2djc2dhL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL25pY2svZ2l0L2djc2dhL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiXG5pbXBvcnQgZXNidWlsZCBmcm9tIFwiZXNidWlsZFwiXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcbmltcG9ydCBQZWdneSBmcm9tIFwicGVnZ3lcIlxuaW1wb3J0ICogYXMgVml0ZSBmcm9tIFwidml0ZVwiXG5pbXBvcnQgY2hlY2tlciBmcm9tIFwidml0ZS1wbHVnaW4tY2hlY2tlclwiXG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1zdGF0aWMtY29weVwiXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiXG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSBcIi4vcGFja2FnZS5qc29uXCIgYXNzZXJ0IHsgdHlwZTogXCJqc29uXCIgfVxuaW1wb3J0IHsgQ29uZGl0aW9uU291cmNlIH0gZnJvbSBcIkBpdGVtL2NvbmRpdGlvbi9kYXRhLnRzXCJcblxuY29uc3QgQ09ORElUSU9OX1NPVVJDRVMgPSAoKCk6IENvbmRpdGlvblNvdXJjZVtdID0+IHtcblx0Y29uc3Qgb3V0cHV0ID0gZXhlY1N5bmMoXCJucG0gcnVuIGJ1aWxkOmNvbmRpdGlvbnNcIiwgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH0pXG5cdHJldHVybiBKU09OLnBhcnNlKG91dHB1dC5zbGljZShvdXRwdXQuaW5kZXhPZihcIltcIikpKVxufSkoKVxuY29uc3QgRU5fSlNPTiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKFwiLi9zdGF0aWMvbGFuZy9lbi5qc29uXCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KSlcblxuY29uc3QgY29uZmlnID0gVml0ZS5kZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KTogVml0ZS5Vc2VyQ29uZmlnID0+IHtcblx0Y29uc3QgYnVpbGRNb2RlID0gbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcInByb2R1Y3Rpb25cIiA6IFwiZGV2ZWxvcG1lbnRcIlxuXHRjb25zdCBvdXREaXIgPSBcImRpc3RcIlxuXG5cdGNvbnN0IHJvbGxHcmFtbWFyID0gZnMucmVhZEZpbGVTeW5jKFwicm9sbC1ncmFtbWFyLnBlZ2d5XCIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9KVxuXHRjb25zdCBST0xMX1BBUlNFUiA9IFBlZ2d5LmdlbmVyYXRlKHJvbGxHcmFtbWFyLCB7IG91dHB1dDogXCJzb3VyY2VcIiB9KS5yZXBsYWNlKFxuXHRcdFwicmV0dXJuIHtcXG4gICAgU3ludGF4RXJyb3I6IHBlZyRTeW50YXhFcnJvcixcXG4gICAgcGFyc2U6IHBlZyRwYXJzZVxcbiAgfTtcIixcblx0XHRcIkFic3RyYWN0RGFtYWdlUm9sbC5wYXJzZXIgPSB7IFN5bnRheEVycm9yOiBwZWckU3ludGF4RXJyb3IsIHBhcnNlOiBwZWckcGFyc2UgfTtcIixcblx0KVxuXG5cdGNvbnN0IHBsdWdpbnMgPSBbY2hlY2tlcih7IHR5cGVzY3JpcHQ6IHRydWUgfSksIHRzY29uZmlnUGF0aHMoKV1cblx0Ly8gSGFuZGxlIG1pbmlmaWNhdGlvbiBhZnRlciBidWlsZCB0byBhbGxvdyBmb3IgdHJlZS1zaGFraW5nIGFuZCB3aGl0ZXNwYWNlIG1pbmlmaWNhdGlvblxuXHQvLyBcIk5vdGUgdGhlIGJ1aWxkLm1pbmlmeSBvcHRpb24gZG9lcyBub3QgbWluaWZ5IHdoaXRlc3BhY2VzIHdoZW4gdXNpbmcgdGhlICdlcycgZm9ybWF0IGluIGxpYiBtb2RlLCBhcyBpdCByZW1vdmVzXG5cdC8vIHB1cmUgYW5ub3RhdGlvbnMgYW5kIGJyZWFrcyB0cmVlLXNoYWtpbmcuXCJcblx0aWYgKGJ1aWxkTW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIpIHtcblx0XHRwbHVnaW5zLnB1c2goXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IFwibWluaWZ5XCIsXG5cdFx0XHRcdHJlbmRlckNodW5rOiB7XG5cdFx0XHRcdFx0b3JkZXI6IFwicG9zdFwiLFxuXHRcdFx0XHRcdGFzeW5jIGhhbmRsZXIoY29kZSwgY2h1bmspIHtcblx0XHRcdFx0XHRcdHJldHVybiBjaHVuay5maWxlTmFtZS5lbmRzV2l0aChcIi5tanNcIilcblx0XHRcdFx0XHRcdFx0PyBlc2J1aWxkLnRyYW5zZm9ybShjb2RlLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRrZWVwTmFtZXM6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRtaW5pZnlJZGVudGlmaWVyczogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRtaW5pZnlTeW50YXg6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRtaW5pZnlXaGl0ZXNwYWNlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdDogY29kZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0Li4udml0ZVN0YXRpY0NvcHkoe1xuXHRcdFx0XHR0YXJnZXRzOiBbXG5cdFx0XHRcdFx0Ly8geyBzcmM6IFwiQ0hBTkdFTE9HLm1kXCIsIGRlc3Q6IFwiLlwiIH0sXG5cdFx0XHRcdFx0eyBzcmM6IFwiUkVBRE1FLm1kXCIsIGRlc3Q6IFwiLlwiIH0sXG5cdFx0XHRcdFx0Ly8geyBzcmM6IFwiQ09OVFJJQlVUSU5HLm1kXCIsIGRlc3Q6IFwiLlwiIH0sXG5cdFx0XHRcdF0sXG5cdFx0XHR9KSxcblx0XHQpXG5cdH0gZWxzZSB7XG5cdFx0cGx1Z2lucy5wdXNoKFxuXHRcdFx0Ly8gRm91bmRyeSBleHBlY3RzIGFsbCBlc20gZmlsZXMgbGlzdGVkIGluIHN5c3RlbS5qc29uIHRvIGV4aXN0OiBjcmVhdGUgZW1wdHkgdmVuZG9yIG1vZHVsZSB3aGVuIGluIGRldiBtb2RlXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IFwidG91Y2gtdmVuZG9yLW1qc1wiLFxuXHRcdFx0XHRhcHBseTogXCJidWlsZFwiLFxuXHRcdFx0XHR3cml0ZUJ1bmRsZToge1xuXHRcdFx0XHRcdGFzeW5jIGhhbmRsZXIoKSB7XG5cdFx0XHRcdFx0XHRmcy5jbG9zZVN5bmMoZnMub3BlblN5bmMocGF0aC5yZXNvbHZlKG91dERpciwgXCJ2ZW5kb3IubWpzXCIpLCBcIndcIikpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHQvLyBWaXRlIEhNUiBpcyBvbmx5IHByZWNvbmZpZ3VyZWQgZm9yIGNzcyBmaWxlczogYWRkIGhhbmRsZXIgZm9yIEhCUyB0ZW1wbGF0ZXNcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogXCJobXItaGFuZGxlclwiLFxuXHRcdFx0XHRhcHBseTogXCJzZXJ2ZVwiLFxuXHRcdFx0XHRoYW5kbGVIb3RVcGRhdGUoY29udGV4dCkge1xuXHRcdFx0XHRcdGlmIChjb250ZXh0LmZpbGUuc3RhcnRzV2l0aChvdXREaXIpKSByZXR1cm5cblxuXHRcdFx0XHRcdGlmIChjb250ZXh0LmZpbGUuZW5kc1dpdGgoXCJlbi5qc29uXCIpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBiYXNlUGF0aCA9IGNvbnRleHQuZmlsZS5zbGljZShjb250ZXh0LmZpbGUuaW5kZXhPZihcImxhbmcvXCIpKVxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYFVwZGF0aW5nIGxhbmcgZmlsZSBhdCAke2Jhc2VQYXRofWApXG5cdFx0XHRcdFx0XHRmcy5wcm9taXNlcy5jb3B5RmlsZShjb250ZXh0LmZpbGUsIGAke291dERpcn0vJHtiYXNlUGF0aH1gKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dC5zZXJ2ZXIud3Muc2VuZCh7XG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogXCJjdXN0b21cIixcblx0XHRcdFx0XHRcdFx0XHRldmVudDogXCJsYW5nLXVwZGF0ZVwiLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGE6IHsgcGF0aDogYHN5c3RlbXMvZ2NzZ2EvJHtiYXNlUGF0aH1gIH0sXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoY29udGV4dC5maWxlLmVuZHNXaXRoKFwiLmhic1wiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgYmFzZVBhdGggPSBjb250ZXh0LmZpbGUuc2xpY2UoY29udGV4dC5maWxlLmluZGV4T2YoXCJ0ZW1wbGF0ZXMvXCIpKVxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYFVwZGF0aW5nIHRlbXBsYXRlIGZpbGUgYXQgJHtiYXNlUGF0aH1gKVxuXHRcdFx0XHRcdFx0ZnMucHJvbWlzZXMuY29weUZpbGUoY29udGV4dC5maWxlLCBgJHtvdXREaXJ9LyR7YmFzZVBhdGh9YCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHQuc2VydmVyLndzLnNlbmQoe1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwiY3VzdG9tXCIsXG5cdFx0XHRcdFx0XHRcdFx0ZXZlbnQ6IFwidGVtcGxhdGUtdXBkYXRlXCIsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YTogeyBwYXRoOiBgc3lzdGVtcy9nY3NnYS8ke2Jhc2VQYXRofWAgfSxcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHQpXG5cdH1cblxuXHQvLyBDcmVhdGUgZHVtbXkgZmlsZXMgZm9yIHZpdGUgZGV2IHNlcnZlclxuXHRpZiAoY29tbWFuZCA9PT0gXCJzZXJ2ZVwiKSB7XG5cdFx0Y29uc3QgbWVzc2FnZSA9IFwiVGhpcyBmaWxlIGlzIGZvciBhIHJ1bm5pbmcgdml0ZSBkZXYgc2VydmVyIGFuZCBpcyBub3QgY29waWVkIHRvIGEgYnVpbGRcIlxuXHRcdGZzLndyaXRlRmlsZVN5bmMoXCIuL2luZGV4Lmh0bWxcIiwgYDxoMT4ke21lc3NhZ2V9PC9oMT5cXG5gKVxuXHRcdGlmICghZnMuZXhpc3RzU3luYyhcIi4vc3R5bGVzXCIpKSBmcy5ta2RpclN5bmMoXCIuL3N0eWxlc1wiKVxuXHRcdGZzLndyaXRlRmlsZVN5bmMoXCIuL3N0eWxlcy9nY3NnYS5jc3NcIiwgYC8qKiAke21lc3NhZ2V9ICovXFxuYClcblx0XHRmcy53cml0ZUZpbGVTeW5jKFwiLi9nY3NnYS5tanNcIiwgYC8qKiAke21lc3NhZ2V9ICovXFxuXFxuaW1wb3J0IFwiLi9zcmMvZ2NzZ2EudHNcIjtcXG5gKVxuXHRcdGZzLndyaXRlRmlsZVN5bmMoXCIuL3ZlbmRvci5tanNcIiwgYC8qKiAke21lc3NhZ2V9ICovXFxuYClcblx0fVxuXG5cdC8vIGNvbnN0IHJlRXNjYXBlID0gKHM6IHN0cmluZykgPT4gcy5yZXBsYWNlKC9bLS9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKVxuXG5cdHJldHVybiB7XG5cdFx0YmFzZTogY29tbWFuZCA9PT0gXCJidWlsZFwiID8gXCIuL1wiIDogXCIvc3lzdGVtcy9nY3NnYS9cIixcblx0XHRwdWJsaWNEaXI6IFwic3RhdGljXCIsXG5cdFx0ZGVmaW5lOiB7XG5cdFx0XHRCVUlMRF9NT0RFOiBKU09OLnN0cmluZ2lmeShidWlsZE1vZGUpLFxuXHRcdFx0Q09ORElUSU9OX1NPVVJDRVM6IEpTT04uc3RyaW5naWZ5KENPTkRJVElPTl9TT1VSQ0VTKSxcblx0XHRcdEVOX0pTT046IEpTT04uc3RyaW5naWZ5KEVOX0pTT04pLFxuXHRcdFx0Uk9MTF9QQVJTRVI6IEpTT04uc3RyaW5naWZ5KFJPTExfUEFSU0VSKSxcblx0XHRcdGZ1OiBcImZvdW5kcnkudXRpbHNcIixcblx0XHR9LFxuXHRcdGVzYnVpbGQ6IHsga2VlcE5hbWVzOiB0cnVlIH0sXG5cdFx0YnVpbGQ6IHtcblx0XHRcdG91dERpcixcblx0XHRcdGVtcHR5T3V0RGlyOiBmYWxzZSwgLy8gZmFpbHMgaWYgd29ybGQgaXMgcnVubmluZyBkdWUgdG8gY29tcGVuZGl1bSBsb2Nrcy4gV2UgZG8gaXQgaW4gXCJucG0gcnVuIGNsZWFuXCIgaW5zdGVhZC5cblx0XHRcdG1pbmlmeTogZmFsc2UsXG5cdFx0XHRzb3VyY2VtYXA6IGJ1aWxkTW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiLFxuXHRcdFx0bGliOiB7XG5cdFx0XHRcdG5hbWU6IFwiZ2NzZ2FcIixcblx0XHRcdFx0ZW50cnk6IFwic3JjL2djc2dhLnRzXCIsXG5cdFx0XHRcdGZvcm1hdHM6IFtcImVzXCJdLFxuXHRcdFx0XHRmaWxlTmFtZTogXCJnY3NnYVwiLFxuXHRcdFx0fSxcblx0XHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdFx0Ly8gZXh0ZXJuYWw6IG5ldyBSZWdFeHAoXG5cdFx0XHRcdC8vIFx0W1xuXHRcdFx0XHQvLyBcdFx0XCIoPzpcIixcblx0XHRcdFx0Ly8gXHRcdHJlRXNjYXBlKFwiLi4vLi4vaWNvbnMvd2VhcG9ucy9cIiksXG5cdFx0XHRcdC8vIFx0XHRcIlstYS16L10rXCIsXG5cdFx0XHRcdC8vIFx0XHRyZUVzY2FwZShcIi53ZWJwXCIpLFxuXHRcdFx0XHQvLyBcdFx0XCJ8XCIsXG5cdFx0XHRcdC8vIFx0XHRyZUVzY2FwZShcIi4uL3VpL3BhcmNobWVudC5qcGdcIiksXG5cdFx0XHRcdC8vIFx0XHRcIikkXCIsXG5cdFx0XHRcdC8vIFx0XS5qb2luKFwiXCIpLFxuXHRcdFx0XHQvLyApLFxuXHRcdFx0XHRvdXRwdXQ6IHtcblx0XHRcdFx0XHRhc3NldEZpbGVOYW1lczogKHsgbmFtZSB9KTogc3RyaW5nID0+IChuYW1lID09PSBcInN0eWxlLmNzc1wiID8gXCJzdHlsZXMvZ2NzZ2EuY3NzXCIgOiBuYW1lID8/IFwiXCIpLFxuXHRcdFx0XHRcdGNodW5rRmlsZU5hbWVzOiBcIltuYW1lXS5tanNcIixcblx0XHRcdFx0XHRlbnRyeUZpbGVOYW1lczogXCJnY3NnYS5tanNcIixcblx0XHRcdFx0XHRtYW51YWxDaHVua3M6IHtcblx0XHRcdFx0XHRcdHZlbmRvcjogYnVpbGRNb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IE9iamVjdC5rZXlzKHBhY2thZ2VKU09OLmRlcGVuZGVuY2llcykgOiBbXSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR3YXRjaDogeyBidWlsZERlbGF5OiAxMDAgfSxcblx0XHRcdH0sXG5cdFx0XHR0YXJnZXQ6IFwiZXMyMDIyXCIsXG5cdFx0fSxcblx0XHRzZXJ2ZXI6IHtcblx0XHRcdHBvcnQ6IDMwMDAxLFxuXHRcdFx0b3BlbjogXCIvZ2FtZVwiLFxuXHRcdFx0cHJveHk6IHtcblx0XHRcdFx0XCJeKD8hL3N5c3RlbXMvZ2NzZ2EvKVwiOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMDAvXCIsXG5cdFx0XHRcdFwiL3NvY2tldC5pb1wiOiB7XG5cdFx0XHRcdFx0dGFyZ2V0OiBcIndzOi8vbG9jYWxob3N0OjMwMDAwXCIsXG5cdFx0XHRcdFx0d3M6IHRydWUsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0cGx1Z2lucyxcblx0XHRjc3M6IHtcblx0XHRcdGRldlNvdXJjZW1hcDogYnVpbGRNb2RlID09PSBcImRldmVsb3BtZW50XCIsXG5cdFx0fSxcblx0fVxufSlcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnXG4iLCAie1xuXHRcInByaXZhdGVcIjogdHJ1ZSxcblx0XCJuYW1lXCI6IFwiZ2NzZ2FcIixcblx0XCJkZXNjcmlwdGlvblwiOiBcIkEgZ2FtZSBhaWQgdG8gaGVscCBwbGF5IEdVUlBTIDRlIGZvciBGb3VuZHJ5IFZUVFwiLFxuXHRcImxpY2Vuc2VcIjogXCJNSVRcIixcblx0XCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jcm5vcm1hbmQvZ3VycHNcIixcblx0XCJyZXBvc2l0b3J5XCI6IHtcblx0XHRcInR5cGVcIjogXCJnaXRcIixcblx0XHRcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jcm5vcm1hbmQvZ3VycHNcIlxuXHR9LFxuXHRcImJ1Z3NcIjoge1xuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2Nybm9ybWFuZC9ndXJwcy9pc3N1ZXNcIlxuXHR9LFxuXHRcImNvbnRyaWJ1dG9yc1wiOiBbXG5cdFx0e1xuXHRcdFx0XCJuYW1lXCI6IFwiQ2hyaXMgTm9ybWFuZFwiLFxuXHRcdFx0XCJlbWFpbFwiOiBcIm5vc2U2NkBiZWxsc291dGgubmV0XCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdFwibmFtZVwiOiBcIk5pY2sgQ29mZmluXCIsXG5cdFx0XHRcImVtYWlsXCI6IFwiZ2Vlay5tYWNiZWVyQGdtYWlsLmNvbVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRcIm5hbWVcIjogXCJNaWtvbGFqIFRvbWN6eW5za2lcIixcblx0XHRcdFwiZW1haWxcIjogXCJtaWtvbGFqdG9tY3p5bnNraUBnbWFpbC5jb21cIlxuXHRcdH1cblx0XSxcblx0XCJ0eXBlXCI6IFwibW9kdWxlXCIsXG5cdFwic2NyaXB0c1wiOiB7XG5cdFx0XCJidWlsZFwiOiBcIm5wbSBydW4gY2xlYW4gJiYgdml0ZSBidWlsZFwiLFxuXHRcdFwiYnVpbGQyXCI6IFwibnBtIHJ1biBjbGVhbiAmJiBucG0gcnVuIGJ1aWxkOnBhY2tzICYmIHZpdGUgYnVpbGRcIixcblx0XHRcImJ1aWxkOnBhY2tzXCI6IFwidHN4IC4vYnVpbGQvYnVpbGQtcGFja3MudHNcIixcblx0XHRcImJ1aWxkOnBhY2tzOmpzb25cIjogXCJ0c3ggLi9idWlsZC9idWlsZC1wYWNrcy50cyBqc29uXCIsXG5cdFx0XCJidWlsZDpjb25kaXRpb25zXCI6IFwidHN4IC4vYnVpbGQvY29uZGl0aW9ucy50c1wiLFxuXHRcdFwiY2xlYW5cIjogXCJ0c3ggLi9idWlsZC9jbGVhbi50c1wiLFxuXHRcdFwid2F0Y2hcIjogXCJucG0gcnVuIGNsZWFuICYmIHZpdGUgYnVpbGQgLS13YXRjaCAtLW1vZGUgZGV2ZWxvcG1lbnRcIixcblx0XHRcIndhdGNoMlwiOiBcIm5wbSBydW4gY2xlYW4gJiYgbnBtIHJ1biBidWlsZDpwYWNrcyAmJiB2aXRlIGJ1aWxkIC0td2F0Y2ggLS1tb2RlIGRldmVsb3BtZW50XCIsXG5cdFx0XCJob3RcIjogXCJ2aXRlIHNlcnZlXCIsXG5cdFx0XCJsaW5rXCI6IFwidHN4IC4vYnVpbGQvbGluay1mb3VuZHJ5LnRzXCIsXG5cdFx0XCJleHRyYWN0UGFja3NcIjogXCJ0c3ggLi9idWlsZC9leHRyYWN0LXBhY2tzLnRzXCIsXG5cdFx0XCJwcmV0ZXN0XCI6IFwibnBtIHJ1biBsaW50XCIsXG5cdFx0XCJ0ZXN0XCI6IFwiamVzdFwiLFxuXHRcdFwidGRkXCI6IFwiamVzdCAtLWNvdmVyYWdlXCIsXG5cdFx0XCJtaWdyYXRlXCI6IFwidHN4IC4vYnVpbGQvcnVuLW1pZ3JhdGlvbi50c1wiLFxuXHRcdFwibGludFwiOiBcIm5wbSBydW4gbGludDp0cyAmJiBucG0gcnVuIGxpbnQ6anNvbiAmJiBucG0gcnVuIHByZXR0aWVyOnNjc3NcIixcblx0XHRcImxpbnQ6dHNcIjogXCJlc2xpbnQgLi9idWlsZCAuL3NyYyAuL3Rlc3RzIC4vdHlwZXMgLS1leHQgLnRzXCIsXG5cdFx0XCJwcmV0dGllcjpzY3NzXCI6IFwicHJldHRpZXIgLS1jaGVjayBzcmMvc3R5bGVzXCIsXG5cdFx0XCJsaW50Ompzb25cIjogXCJlc2xpbnQgLi9zdGF0aWMgLS1leHQgLmpzb24gLS1uby1lc2xpbnRyYyAtLXBsdWdpbiBqc29uIC0tcnVsZSBcXFwianNvbi8qOiBlcnJvclxcXCIgLS1ydWxlIFxcXCJsaW5lYnJlYWstc3R5bGU6IGVycm9yXFxcIlwiLFxuXHRcdFwibGludDpmaXhcIjogXCJlc2xpbnQgLi9idWlsZCAuL3NyYyAuL3Rlc3RzIC4vdHlwZXMgLS1leHQgLnRzIC0tZml4ICYmIHByZXR0aWVyIC0td3JpdGUgc3JjL3N0eWxlc1wiXG5cdH0sXG5cdFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcblx0XHRcIkBwaXhpL2dyYXBoaWNzLXNtb290aFwiOiBcIl4xLjEuMFwiLFxuXHRcdFwiQHBpeGkvcGFydGljbGUtZW1pdHRlclwiOiBcIjUuMC44XCIsXG5cdFx0XCJAdHlwZXMvZnMtZXh0cmFcIjogXCJeMTEuMC40XCIsXG5cdFx0XCJAdHlwZXMvZ2xvYlwiOiBcIl44LjEuMFwiLFxuXHRcdFwiQHR5cGVzL2plc3RcIjogXCJeMjkuNS4xMVwiLFxuXHRcdFwiQHR5cGVzL2pxdWVyeVwiOiBcIl4zLjUuMjlcIixcblx0XHRcIkB0eXBlcy9qc2RvbVwiOiBcIl4yMS4xLjZcIixcblx0XHRcIkB0eXBlcy9sdXhvblwiOiBcIl4zLjQuMFwiLFxuXHRcdFwiQHR5cGVzL25vZGVcIjogXCIyMC4xMS4xOVwiLFxuXHRcdFwiQHR5cGVzL3Byb21wdHNcIjogXCJeMi40LjlcIixcblx0XHRcIkB0eXBlcy9zb3J0YWJsZWpzXCI6IFwiXjEuMTUuOFwiLFxuXHRcdFwiQHR5cGVzL3Rvb2x0aXBzdGVyXCI6IFwiXjAuMC4zNVwiLFxuXHRcdFwiQHR5cGVzL3lhaXJlb19fdGFnaWZ5XCI6IFwiNC4xOC4wXCIsXG5cdFx0XCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl42LjE5LjFcIixcblx0XHRcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCJeNi4yMS4wXCIsXG5cdFx0XCJjbGFzc2ljLWxldmVsXCI6IFwiXjEuMy4wXCIsXG5cdFx0XCJlcy1qZXN0XCI6IFwiXjIuMS4wXCIsXG5cdFx0XCJlc2xpbnRcIjogXCJeOC41Ni4wXCIsXG5cdFx0XCJlc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiOS4xLjBcIixcblx0XHRcImVzbGludC1wbHVnaW4tamVzdFwiOiBcIl4yNy42LjFcIixcblx0XHRcImVzbGludC1wbHVnaW4tanNvblwiOiBcIl4zLjEuMFwiLFxuXHRcdFwiZXNsaW50LXBsdWdpbi1wcmV0dGllclwiOiBcIjUuMS4yXCIsXG5cdFx0XCJmcy1leHRyYVwiOiBcIl4xMS4yLjBcIixcblx0XHRcImZ1c2UuanNcIjogXCJeNy4wLjBcIixcblx0XHRcImdzYXBcIjogXCIzLjEyLjVcIixcblx0XHRcImhhbmRsZWJhcnNcIjogXCI0LjcuOFwiLFxuXHRcdFwiamVzdFwiOiBcIl4yOS43LjBcIixcblx0XHRcImplc3QtZWFjaFwiOiBcIl4yOS43LjBcIixcblx0XHRcImpzZG9tXCI6IFwiXjIzLjEuMFwiLFxuXHRcdFwicGVnZ3lcIjogXCJeMy4wLjJcIixcblx0XHRcInBpeGkuanNcIjogXCI3LjIuNFwiLFxuXHRcdFwicHJldHRpZXJcIjogXCIzLjEuMVwiLFxuXHRcdFwicHJvbXB0c1wiOiBcIl4yLjQuMlwiLFxuXHRcdFwicHJvc2VtaXJyb3Itdmlld1wiOiBcIjEuMzIuNVwiLFxuXHRcdFwic2Fzc1wiOiBcIl4xLjcxLjBcIixcblx0XHRcInNvY2tldC5pb1wiOiBcIjQuNi4yXCIsXG5cdFx0XCJzb2NrZXQuaW8tY2xpZW50XCI6IFwiNC43LjRcIixcblx0XHRcInRpbnltY2VcIjogXCI2LjguM1wiLFxuXHRcdFwidHNjb25maWctcGF0aHNcIjogXCJeNC4yLjBcIixcblx0XHRcInRzeFwiOiBcIl40LjcuMFwiLFxuXHRcdFwidHlwZXNjcmlwdFwiOiBcIl41LjMuM1wiLFxuXHRcdFwidXVpZFwiOiBcIl45LjAuMVwiLFxuXHRcdFwidXVpZHY0XCI6IFwiXjYuMi4xM1wiLFxuXHRcdFwidml0ZVwiOiBcIl41LjEuMVwiLFxuXHRcdFwidml0ZS1wbHVnaW4tY2hlY2tlclwiOiBcIl4wLjYuMlwiLFxuXHRcdFwidml0ZS1wbHVnaW4tc3RhdGljLWNvcHlcIjogXCJeMS4wLjFcIixcblx0XHRcInZpdGUtdHNjb25maWctcGF0aHNcIjogXCJeNC4yLjNcIixcblx0XHRcInlhcmdzXCI6IFwiXjE3LjcuMlwiXG5cdH0sXG5cdFwiZGVwZW5kZW5jaWVzXCI6IHtcblx0XHRcIkBjb2RlbWlycm9yL2F1dG9jb21wbGV0ZVwiOiBcIl42LjExLjFcIixcblx0XHRcIkBjb2RlbWlycm9yL2xhbmctanNvblwiOiBcIl42LjAuMVwiLFxuXHRcdFwiQHlhaXJlby90YWdpZnlcIjogXCI0LjIwLjBcIixcblx0XHRcImNvZGVtaXJyb3JcIjogXCJeNi4wLjFcIixcblx0XHRcImx1eG9uXCI6IFwiXjMuNC40XCIsXG5cdFx0XCJtaW5pc2VhcmNoXCI6IFwiXjYuMy4wXCIsXG5cdFx0XCJub3Vpc2xpZGVyXCI6IFwiXjE1LjcuMVwiLFxuXHRcdFwicmVtZWRhXCI6IFwiXjEuMzMuMFwiLFxuXHRcdFwic29ydGFibGVqc1wiOiBcIl4xLjE1LjFcIlxuXHR9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThPLFNBQVMsZ0JBQWdCO0FBQ3ZRLE9BQU8sYUFBYTtBQUNwQixPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFDakIsT0FBTyxXQUFXO0FBQ2xCLFlBQVksVUFBVTtBQUN0QixPQUFPLGFBQWE7QUFDcEIsU0FBUyxzQkFBc0I7QUFDL0IsT0FBTyxtQkFBbUI7OztBQ1IxQjtBQUFBLEVBQ0MsU0FBVztBQUFBLEVBQ1gsTUFBUTtBQUFBLEVBQ1IsYUFBZTtBQUFBLEVBQ2YsU0FBVztBQUFBLEVBQ1gsVUFBWTtBQUFBLEVBQ1osWUFBYztBQUFBLElBQ2IsTUFBUTtBQUFBLElBQ1IsS0FBTztBQUFBLEVBQ1I7QUFBQSxFQUNBLE1BQVE7QUFBQSxJQUNQLEtBQU87QUFBQSxFQUNSO0FBQUEsRUFDQSxjQUFnQjtBQUFBLElBQ2Y7QUFBQSxNQUNDLE1BQVE7QUFBQSxNQUNSLE9BQVM7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLE1BQ0MsTUFBUTtBQUFBLE1BQ1IsT0FBUztBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsTUFDQyxNQUFRO0FBQUEsTUFDUixPQUFTO0FBQUEsSUFDVjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxJQUNWLE9BQVM7QUFBQSxJQUNULFFBQVU7QUFBQSxJQUNWLGVBQWU7QUFBQSxJQUNmLG9CQUFvQjtBQUFBLElBQ3BCLG9CQUFvQjtBQUFBLElBQ3BCLE9BQVM7QUFBQSxJQUNULE9BQVM7QUFBQSxJQUNULFFBQVU7QUFBQSxJQUNWLEtBQU87QUFBQSxJQUNQLE1BQVE7QUFBQSxJQUNSLGNBQWdCO0FBQUEsSUFDaEIsU0FBVztBQUFBLElBQ1gsTUFBUTtBQUFBLElBQ1IsS0FBTztBQUFBLElBQ1AsU0FBVztBQUFBLElBQ1gsTUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsaUJBQWlCO0FBQUEsSUFDakIsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLEVBQ2I7QUFBQSxFQUNBLGlCQUFtQjtBQUFBLElBQ2xCLHlCQUF5QjtBQUFBLElBQ3pCLDBCQUEwQjtBQUFBLElBQzFCLG1CQUFtQjtBQUFBLElBQ25CLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQjtBQUFBLElBQ2hCLGdCQUFnQjtBQUFBLElBQ2hCLGVBQWU7QUFBQSxJQUNmLGtCQUFrQjtBQUFBLElBQ2xCLHFCQUFxQjtBQUFBLElBQ3JCLHNCQUFzQjtBQUFBLElBQ3RCLHlCQUF5QjtBQUFBLElBQ3pCLG9DQUFvQztBQUFBLElBQ3BDLDZCQUE2QjtBQUFBLElBQzdCLGlCQUFpQjtBQUFBLElBQ2pCLFdBQVc7QUFBQSxJQUNYLFFBQVU7QUFBQSxJQUNWLDBCQUEwQjtBQUFBLElBQzFCLHNCQUFzQjtBQUFBLElBQ3RCLHNCQUFzQjtBQUFBLElBQ3RCLDBCQUEwQjtBQUFBLElBQzFCLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLE1BQVE7QUFBQSxJQUNSLFlBQWM7QUFBQSxJQUNkLE1BQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLE9BQVM7QUFBQSxJQUNULE9BQVM7QUFBQSxJQUNULFdBQVc7QUFBQSxJQUNYLFVBQVk7QUFBQSxJQUNaLFNBQVc7QUFBQSxJQUNYLG9CQUFvQjtBQUFBLElBQ3BCLE1BQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLG9CQUFvQjtBQUFBLElBQ3BCLFNBQVc7QUFBQSxJQUNYLGtCQUFrQjtBQUFBLElBQ2xCLEtBQU87QUFBQSxJQUNQLFlBQWM7QUFBQSxJQUNkLE1BQVE7QUFBQSxJQUNSLFFBQVU7QUFBQSxJQUNWLE1BQVE7QUFBQSxJQUNSLHVCQUF1QjtBQUFBLElBQ3ZCLDJCQUEyQjtBQUFBLElBQzNCLHVCQUF1QjtBQUFBLElBQ3ZCLE9BQVM7QUFBQSxFQUNWO0FBQUEsRUFDQSxjQUFnQjtBQUFBLElBQ2YsNEJBQTRCO0FBQUEsSUFDNUIseUJBQXlCO0FBQUEsSUFDekIsa0JBQWtCO0FBQUEsSUFDbEIsWUFBYztBQUFBLElBQ2QsT0FBUztBQUFBLElBQ1QsWUFBYztBQUFBLElBQ2QsWUFBYztBQUFBLElBQ2QsUUFBVTtBQUFBLElBQ1YsWUFBYztBQUFBLEVBQ2Y7QUFDRDs7O0FEbkdBLElBQU0scUJBQXFCLE1BQXlCO0FBQ25ELFFBQU0sU0FBUyxTQUFTLDRCQUE0QixFQUFFLFVBQVUsUUFBUSxDQUFDO0FBQ3pFLFNBQU8sS0FBSyxNQUFNLE9BQU8sTUFBTSxPQUFPLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDcEQsR0FBRztBQUNILElBQU0sVUFBVSxLQUFLLE1BQU0sR0FBRyxhQUFhLHlCQUF5QixFQUFFLFVBQVUsUUFBUSxDQUFDLENBQUM7QUFFMUYsSUFBTSxTQUFjLGtCQUFhLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBdUI7QUFDeEUsUUFBTSxZQUFZLFNBQVMsZUFBZSxlQUFlO0FBQ3pELFFBQU0sU0FBUztBQUVmLFFBQU0sY0FBYyxHQUFHLGFBQWEsc0JBQXNCLEVBQUUsVUFBVSxRQUFRLENBQUM7QUFDL0UsUUFBTSxjQUFjLE1BQU0sU0FBUyxhQUFhLEVBQUUsUUFBUSxTQUFTLENBQUMsRUFBRTtBQUFBLElBQ3JFO0FBQUEsSUFDQTtBQUFBLEVBQ0Q7QUFFQSxRQUFNLFVBQVUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxLQUFLLENBQUMsR0FBRyxjQUFjLENBQUM7QUFJL0QsTUFBSSxjQUFjLGNBQWM7QUFDL0IsWUFBUTtBQUFBLE1BQ1A7QUFBQSxRQUNDLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxVQUNaLE9BQU87QUFBQSxVQUNQLE1BQU0sUUFBUSxNQUFNLE9BQU87QUFDMUIsbUJBQU8sTUFBTSxTQUFTLFNBQVMsTUFBTSxJQUNsQyxRQUFRLFVBQVUsTUFBTTtBQUFBLGNBQ3hCLFdBQVc7QUFBQSxjQUNYLG1CQUFtQjtBQUFBLGNBQ25CLGNBQWM7QUFBQSxjQUNkLGtCQUFrQjtBQUFBLFlBQ25CLENBQUMsSUFDQTtBQUFBLFVBQ0o7QUFBQSxRQUNEO0FBQUEsTUFDRDtBQUFBLE1BQ0EsR0FBRyxlQUFlO0FBQUEsUUFDakIsU0FBUztBQUFBO0FBQUEsVUFFUixFQUFFLEtBQUssYUFBYSxNQUFNLElBQUk7QUFBQTtBQUFBLFFBRS9CO0FBQUEsTUFDRCxDQUFDO0FBQUEsSUFDRjtBQUFBLEVBQ0QsT0FBTztBQUNOLFlBQVE7QUFBQTtBQUFBLE1BRVA7QUFBQSxRQUNDLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxVQUNaLE1BQU0sVUFBVTtBQUNmLGVBQUcsVUFBVSxHQUFHLFNBQVMsS0FBSyxRQUFRLFFBQVEsWUFBWSxHQUFHLEdBQUcsQ0FBQztBQUFBLFVBQ2xFO0FBQUEsUUFDRDtBQUFBLE1BQ0Q7QUFBQTtBQUFBLE1BRUE7QUFBQSxRQUNDLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxRQUNQLGdCQUFnQixTQUFTO0FBQ3hCLGNBQUksUUFBUSxLQUFLLFdBQVcsTUFBTTtBQUFHO0FBRXJDLGNBQUksUUFBUSxLQUFLLFNBQVMsU0FBUyxHQUFHO0FBQ3JDLGtCQUFNLFdBQVcsUUFBUSxLQUFLLE1BQU0sUUFBUSxLQUFLLFFBQVEsT0FBTyxDQUFDO0FBQ2pFLG9CQUFRLElBQUkseUJBQXlCLFFBQVEsRUFBRTtBQUMvQyxlQUFHLFNBQVMsU0FBUyxRQUFRLE1BQU0sR0FBRyxNQUFNLElBQUksUUFBUSxFQUFFLEVBQUUsS0FBSyxNQUFNO0FBQ3RFLHNCQUFRLE9BQU8sR0FBRyxLQUFLO0FBQUEsZ0JBQ3RCLE1BQU07QUFBQSxnQkFDTixPQUFPO0FBQUEsZ0JBQ1AsTUFBTSxFQUFFLE1BQU0saUJBQWlCLFFBQVEsR0FBRztBQUFBLGNBQzNDLENBQUM7QUFBQSxZQUNGLENBQUM7QUFBQSxVQUNGLFdBQVcsUUFBUSxLQUFLLFNBQVMsTUFBTSxHQUFHO0FBQ3pDLGtCQUFNLFdBQVcsUUFBUSxLQUFLLE1BQU0sUUFBUSxLQUFLLFFBQVEsWUFBWSxDQUFDO0FBQ3RFLG9CQUFRLElBQUksNkJBQTZCLFFBQVEsRUFBRTtBQUNuRCxlQUFHLFNBQVMsU0FBUyxRQUFRLE1BQU0sR0FBRyxNQUFNLElBQUksUUFBUSxFQUFFLEVBQUUsS0FBSyxNQUFNO0FBQ3RFLHNCQUFRLE9BQU8sR0FBRyxLQUFLO0FBQUEsZ0JBQ3RCLE1BQU07QUFBQSxnQkFDTixPQUFPO0FBQUEsZ0JBQ1AsTUFBTSxFQUFFLE1BQU0saUJBQWlCLFFBQVEsR0FBRztBQUFBLGNBQzNDLENBQUM7QUFBQSxZQUNGLENBQUM7QUFBQSxVQUNGO0FBQUEsUUFDRDtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUdBLE1BQUksWUFBWSxTQUFTO0FBQ3hCLFVBQU0sVUFBVTtBQUNoQixPQUFHLGNBQWMsZ0JBQWdCLE9BQU8sT0FBTztBQUFBLENBQVM7QUFDeEQsUUFBSSxDQUFDLEdBQUcsV0FBVyxVQUFVO0FBQUcsU0FBRyxVQUFVLFVBQVU7QUFDdkQsT0FBRyxjQUFjLHNCQUFzQixPQUFPLE9BQU87QUFBQSxDQUFPO0FBQzVELE9BQUcsY0FBYyxlQUFlLE9BQU8sT0FBTztBQUFBO0FBQUE7QUFBQSxDQUFtQztBQUNqRixPQUFHLGNBQWMsZ0JBQWdCLE9BQU8sT0FBTztBQUFBLENBQU87QUFBQSxFQUN2RDtBQUlBLFNBQU87QUFBQSxJQUNOLE1BQU0sWUFBWSxVQUFVLE9BQU87QUFBQSxJQUNuQyxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsTUFDUCxZQUFZLEtBQUssVUFBVSxTQUFTO0FBQUEsTUFDcEMsbUJBQW1CLEtBQUssVUFBVSxpQkFBaUI7QUFBQSxNQUNuRCxTQUFTLEtBQUssVUFBVSxPQUFPO0FBQUEsTUFDL0IsYUFBYSxLQUFLLFVBQVUsV0FBVztBQUFBLE1BQ3ZDLElBQUk7QUFBQSxJQUNMO0FBQUEsSUFDQSxTQUFTLEVBQUUsV0FBVyxLQUFLO0FBQUEsSUFDM0IsT0FBTztBQUFBLE1BQ047QUFBQSxNQUNBLGFBQWE7QUFBQTtBQUFBLE1BQ2IsUUFBUTtBQUFBLE1BQ1IsV0FBVyxjQUFjO0FBQUEsTUFDekIsS0FBSztBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFFBQ1AsU0FBUyxDQUFDLElBQUk7QUFBQSxRQUNkLFVBQVU7QUFBQSxNQUNYO0FBQUEsTUFDQSxlQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBWWQsUUFBUTtBQUFBLFVBQ1AsZ0JBQWdCLENBQUMsRUFBRSxLQUFLLE1BQWUsU0FBUyxjQUFjLHFCQUFxQixRQUFRO0FBQUEsVUFDM0YsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsY0FBYztBQUFBLFlBQ2IsUUFBUSxjQUFjLGVBQWUsT0FBTyxLQUFLLGdCQUFZLFlBQVksSUFBSSxDQUFDO0FBQUEsVUFDL0U7QUFBQSxRQUNEO0FBQUEsUUFDQSxPQUFPLEVBQUUsWUFBWSxJQUFJO0FBQUEsTUFDMUI7QUFBQSxNQUNBLFFBQVE7QUFBQSxJQUNUO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTix3QkFBd0I7QUFBQSxRQUN4QixjQUFjO0FBQUEsVUFDYixRQUFRO0FBQUEsVUFDUixJQUFJO0FBQUEsUUFDTDtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsSUFDQTtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0osY0FBYyxjQUFjO0FBQUEsSUFDN0I7QUFBQSxFQUNEO0FBQ0QsQ0FBQztBQUVELElBQU8sc0JBQVE7IiwKICAibmFtZXMiOiBbXQp9Cg==
