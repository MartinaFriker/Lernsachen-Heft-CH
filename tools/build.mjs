// Builds the installable, offline-capable web app from the original single-file
// Lernsachen-Heft.html (upstream/). The app code itself stays untouched; this only
//   - moves the inline (data: URI) web manifest and home-screen icons into real files,
//   - adds a service worker so the app works offline once it has been opened.
// Usage: node tools/build.mjs [path/to/Lernsachen-Heft.html]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyChf, swissSz } from "./chf.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2] ?? join(root, "upstream", "Lernsachen-Heft.html");
let html = readFileSync(src, "utf8");

// Replace exactly one match, so a changed upstream file fails loudly instead of silently.
function replaceOnce(re, fn, what) {
  const hits = html.match(new RegExp(re.source, "g")) ?? [];
  if (hits.length !== 1) throw new Error(`${what}: expected 1 match, found ${hits.length}`);
  html = html.replace(re, fn);
}

const dataUri = (uri) => {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(uri);
  if (!m) throw new Error("not a base64 data URI: " + uri.slice(0, 40));
  return { type: m[1], bytes: Buffer.from(m[2], "base64") };
};

mkdirSync(join(root, "icons"), { recursive: true });
const ext = { "image/png": "png", "image/svg+xml": "svg" };

// 1. Manifest: decode, write its icons as files, write manifest.webmanifest.
replaceOnce(/<link rel="manifest" href="(data:[^"]+)"\s*\/?>/, (_, uri) => {
  const manifest = JSON.parse(dataUri(uri).bytes.toString("utf8"));
  manifest.icons = manifest.icons.map((icon) => {
    const { type, bytes } = dataUri(icon.src);
    const name = `icons/icon-${icon.sizes === "any" ? "any" : icon.sizes.split("x")[0]}.${ext[type]}`;
    writeFileSync(join(root, name), bytes);
    return { ...icon, src: name };
  });
  Object.assign(manifest, { id: "./", start_url: "./", scope: "./" });
  // Swiss version: its own name, so it can be told apart from the author's app on the home screen.
  manifest.name = manifest.name.replace("Lernsachen-Heft", "Lernsachen-Heft CH");
  manifest.short_name = "Lernsachen-Heft CH";
  writeFileSync(join(root, "manifest.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");

  // The page snapshots its own HTML for exports, so this script also ends up in exported
  // files; it only registers when served over http(s) and fails silently without sw.js.
  const register =
    `<script>if("serviceWorker"in navigator&&/^https?:$/.test(location.protocol))` +
    `addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})</script>`;
  return `<link rel="manifest" href="manifest.webmanifest" />\n    ${register}`;
}, "manifest link");

// 2. Home-screen icon for iOS as a real file (iOS ignores data: URIs here in some versions).
replaceOnce(/<link rel="apple-touch-icon" sizes="180x180" href="(data:[^"]+)"/, (_, uri) => {
  writeFileSync(join(root, "icons/apple-touch-icon.png"), dataUri(uri).bytes);
  return `<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png"`;
}, "apple-touch-icon");

// Home-screen name on iOS.
replaceOnce(/<meta name="apple-mobile-web-app-title" content="Lernsachen-Heft" \/>/,
  () => `<meta name="apple-mobile-web-app-title" content="Lernsachen-Heft CH" />`, "apple title");

// 3. Swiss francs instead of euros in the calculator and checkout exercises.
html = applyChf(html);

// 4. Swiss spelling: ß -> ss in words.
const sz = swissSz(html);
html = sz.html;
console.log(`ß -> ss: ${sz.replaced} replaced, ${sz.kept} kept (patterns, letter classes, single key)`);

writeFileSync(join(root, "index.html"), html);

// 3. Service worker: the version is a hash of all app files, so every rebuild with
//    changed content makes installed devices pick up the new version.
const files = ["index.html", "manifest.webmanifest",
  ...JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8")).icons.map((i) => i.src),
  "icons/apple-touch-icon.png"];
const hash = createHash("sha256");
for (const f of files) hash.update(readFileSync(join(root, f)));
const version = hash.digest("hex").slice(0, 12);
const sw = readFileSync(join(root, "tools", "sw.template.js"), "utf8")
  .replace("__VERSION__", version)
  .replace("__FILES__", JSON.stringify(["./", ...files], null, 2));
writeFileSync(join(root, "sw.js"), sw);

console.log(`built index.html (${(html.length / 1e6).toFixed(1)} MB), sw version ${version}`);
