import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

// Notifies IndexNow about pages that changed, so Bing and Copilot recrawl them without
// waiting for a scheduled crawl. One submission reaches every participating engine.
//
//   node scripts/submit-indexnow.mjs                    changed pages in the last commit
//   node scripts/submit-indexnow.mjs --since <ref>      changed pages since that commit
//   node scripts/submit-indexnow.mjs --all              every canonical URL
//   node scripts/submit-indexnow.mjs --dry-run …        print the list, send nothing
//   node scripts/submit-indexnow.mjs /trust/index.html  explicit files
//
// Only URLs listed in sitemap.xml are ever submitted. That filter is what keeps the
// retired redirect stubs and the noindex quiz demo out of the payload.

const root = process.cwd();
const origin = 'https://icewind.uk';
const endpoint = 'https://api.indexnow.org/IndexNow';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const everything = argv.includes('--all');
const skipKeyCheck = argv.includes('--skip-key-check');
const sinceIndex = argv.indexOf('--since');
const since = sinceIndex === -1 ? null : argv[sinceIndex + 1];
const explicitFiles = argv.filter((argument, index) => {
  if (argument.startsWith('--')) return false;
  if (sinceIndex !== -1 && index === sinceIndex + 1) return false;
  return true;
});

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

async function findKey() {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/^[0-9a-f]{8,128}\.txt$/.test(entry.name)) continue;
    const content = (await readFile(join(root, entry.name), 'utf8')).trim();
    if (content === entry.name.replace(/\.txt$/, '')) return content;
  }
  return null;
}

async function canonicalUrls() {
  const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
  return new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function changedFiles() {
  if (explicitFiles.length) return explicitFiles;
  const base = since ?? 'HEAD^';
  const output = execFileSync('git', ['diff', '--name-only', `${base}..HEAD`], { encoding: 'utf8' });
  return output.split('\n').filter(Boolean);
}

// site/index.html → /, site/trust/index.html → /trust/. Anything else has no URL of its own.
function fileToUrl(file) {
  if (file === 'index.html') return `${origin}/`;
  if (file.endsWith('/index.html')) return `${origin}/${file.slice(0, -'index.html'.length)}`;
  return null;
}

const key = await findKey();
if (!key) fail('no IndexNow key file in the site root — expected <key>.txt containing exactly that key');

const canonical = await canonicalUrls();

let urls;
if (everything) {
  urls = [...canonical];
} else {
  const files = changedFiles();
  const mapped = files.map(fileToUrl).filter(Boolean);
  urls = [...new Set(mapped)].filter((url) => canonical.has(url));

  const skipped = mapped.filter((url) => !canonical.has(url));
  if (skipped.length) console.log(`Skipped ${skipped.length} URL not in sitemap.xml: ${skipped.join(', ')}`);
  if (files.some((file) => file.startsWith('assets/')) && !urls.length) {
    console.log('Shared assets changed but no page did. Re-run with --all if the change alters every page.');
  }
}

if (!urls.length) {
  console.log('No canonical URL changed. Nothing submitted.');
  process.exit(0);
}

if (!skipKeyCheck && !dryRun) {
  const keyUrl = `${origin}/${key}.txt`;
  const response = await fetch(keyUrl).catch((error) => fail(`cannot fetch ${keyUrl}: ${error.message}`));
  if (!response.ok) fail(`${keyUrl} returned ${response.status}; IndexNow would answer 403`);
  const served = (await response.text()).trim();
  if (served !== key) fail(`${keyUrl} serves "${served}", expected "${key}"`);
}

console.log(`${urls.length} URL for IndexNow:`);
for (const url of urls) console.log(`  ${url}`);

if (dryRun) {
  console.log('Dry run — nothing sent.');
  process.exit(0);
}

const body = {
  host: 'icewind.uk',
  key,
  keyLocation: `${origin}/${key}.txt`,
  urlList: urls
};

const submission = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body)
}).catch((error) => fail(`IndexNow request failed: ${error.message}`));

// 200 accepted, 202 received and pending key validation. Everything else is a real failure.
if (submission.status !== 200 && submission.status !== 202) {
  fail(`IndexNow returned ${submission.status}: ${(await submission.text()).slice(0, 400)}`);
}

console.log(`IndexNow accepted the submission (HTTP ${submission.status}).`);
