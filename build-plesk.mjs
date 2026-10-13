import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("Building frontend...");
// execSync("npm run build", { stdio: "inherit" });

console.log("Building backend...");
await esbuild.build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outdir: "dist/server",
  external: [
    "express", 
    "mongoose", 
    "pg", 
    "drizzle-orm", 
    "bcryptjs", 
    "cors", 
    "express-session", 
    "connect-mongo", 
    "connect-pg-simple", 
    "passport", 
    "passport-local", 
    "passport-google-oauth20", 
    "compression", 
    "@google/generative-ai", 
    "uuid",
    "express-rate-limit",
    "node-cache",
    "vite",
    "lightningcss"
  ],
});

console.log("Creating start.js for Plesk...");
fs.writeFileSync("start.js", `process.env.NODE_ENV = 'production';\nawait import('./dist/server/index.js');\n`);

console.log("Build complete! To deploy to Plesk:");
console.log("1. Zip the following files/folders: dist, package.json, .env, start.js");
console.log("2. Upload to Eskiz Plesk File Manager");
console.log("3. In Node.js settings, set 'Application Startup File' to 'start.js'");
console.log("4. Click 'NPM Install' then 'Restart App'");
