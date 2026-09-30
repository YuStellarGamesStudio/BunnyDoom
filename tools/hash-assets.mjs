import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, mkdir, rm, access } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = resolve(root, 'dist');
const check = process.argv.includes('--check');
const exists = async (path) => { try { await access(path); return true; } catch { return false; } };
async function walk(dir) {
  const entries = await readdir(resolve(root, dir), { withFileTypes: true });
  const files = await Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name)).map((entry) => entry.isDirectory() ? walk(`${dir}/${entry.name}`) : `${dir}/${entry.name}`));
  return files.flat();
}
const runtime = ['app.js', ...await walk('src'), ...await walk('assets')].filter((path) => !/\.(?:md|tgz|map)$/.test(path));
const shell = ['index.html', 'manifest.webmanifest', 'favicon.ico', 'CNAME', 'LICENSE', '.nojekyll'];
const inputs = [...new Set([...runtime, ...shell, 'sw.js', 'tools/hash-assets.mjs'])].sort();
const buffers = new Map(await Promise.all(inputs.map(async (path) => [path, await readFile(resolve(root, path))])));
const hash = createHash('sha256');
for (const [path, bytes] of buffers) hash.update(path).update('\0').update(bytes).update('\0');
const version = hash.digest('hex').slice(0, 20);
const release = `releases/${version}`;
const generated = new Map();
for (const path of runtime) generated.set(`${release}/${path}`, buffers.get(path));
for (const path of shell.filter((path) => path !== 'index.html')) generated.set(path, buffers.get(path));
for (const path of runtime.filter((path) => path.startsWith('assets/icons/'))) generated.set(path, buffers.get(path));
let html = buffers.get('index.html').toString();
// Only HTML resource URLs are rewritten; all ES modules/worklets/workers keep relative imports in an immutable release tree.
const resourceHashes = new Map();
html = html.replace(/\b(src|href)=(['"])(\.\/)?(app\.js|assets\/[^'"?#]+|manifest\.webmanifest|favicon\.ico)(\?[^'"#]*)?\2/g, (match, attr, quote, dot, path) => {
  const target = runtime.includes(path) ? `${release}/${path}` : path;
  const digest = createHash('sha256').update(buffers.get(path)).digest('hex').slice(0, 20);
  resourceHashes.set(target, `${target}?=${digest}`);
  return `${attr}=${quote}${target}?=${digest}${quote}`;
});
html = html.replace('</head>', `<meta name="bunnydoom-version" content="${version}">\n</head>`);
generated.set('index.html', Buffer.from(html));
const precache = [...generated.keys()].filter((path) => !['CNAME', 'LICENSE', '.nojekyll'].includes(path)).flatMap((path) => resourceHashes.has(path) ? [path, resourceHashes.get(path)] : [path]).sort();
const sw = buffers.get('sw.js').toString()
  .replace("const VERSION = '__BUNNY_VERSION__';", `const VERSION = 'bunnydoom-${version}';`)
  .replace('/* BUNNY_PRECACHE */ []', JSON.stringify(precache));
generated.set('sw.js', Buffer.from(sw));
generated.set('.bunnydoom-generated', Buffer.from(`${version}\n`));
if (check) {
  for (const [path, bytes] of generated) {
    const target = resolve(out, path);
    if (!await exists(target) || !bytes.equals(await readFile(target))) throw new Error(`Stale deployment asset: ${path}. Run npm run build.`);
  }
  console.log(`Asset check passed: ${version}, ${precache.length} offline resources.`);
} else {
  if (await exists(out)) {
    if (!await exists(resolve(out, '.bunnydoom-generated'))) throw new Error('Refusing to replace an unmarked dist directory.');
    await rm(out, { recursive: true });
  }
  for (const [path, bytes] of generated) {
    const target = resolve(out, path);
    if (!relative(out, target).startsWith('..' + sep)) {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, bytes);
    }
  }
  console.log(`Built Bunny Doom ${version}: ${precache.length} offline resources in dist/.`);
}
