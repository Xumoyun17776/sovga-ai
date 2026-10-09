import esbuild from "esbuild";
import fs from "fs";

console.log("Bundling complete standalone backend with esbuild...");
await esbuild.build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/server/index.js",
  external: [
    "lightningcss",
    "vite",
    "pg-native"
  ],
  banner: {
    js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
  },
});

console.log("Backend bundled into single standalone file dist/server/index.js!");
