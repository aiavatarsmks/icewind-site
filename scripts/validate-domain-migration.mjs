import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const root = process.cwd();
const oldHost = 'www.icewinddaleconsulting.com';
const oldApex = 'icewinddaleconsulting.com';
const newOrigin = 'https://icewind.uk';
const preservedEmail = 'manager@icewinddaleconsulting.com';
const failures = [];

function fail(message) {
  failures.push(message);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(entryPath));
    if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function pagePath(file) {
  const directory = relative(root, file).split(sep).slice(0, -1).join('/');
  return directory ? `/${directory}/` : '/';
}

function metaContent(html, attribute, value) {
  const pattern = new RegExp(`<meta[^>]+${attribute}=["']${value}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const direct = html.match(pattern);
  if (direct) return direct[1];
  const reverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${value}["'][^>]*>`, 'i');
  return html.match(reverse)?.[1];
}

const files = await walk(root);
const repositoryFiles = new Set(files.map((file) => relative(root, file).split(sep).join('/')));
const pages = files.filter((file) => file.endsWith(`${sep}index.html`) || file === join(root, 'index.html'));
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapSet = new Set(sitemapUrls);

if (sitemapUrls.length !== 30) fail(`sitemap.xml must contain 30 URLs; found ${sitemapUrls.length}`);
if (sitemapSet.size !== sitemapUrls.length) fail('sitemap.xml contains duplicate URLs');
for (const url of sitemapUrls) {
  if (!url.startsWith(`${newOrigin}/`)) fail(`sitemap.xml contains a non-canonical URL: ${url}`);
}

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const relativePage = relative(root, page);
  const expectedUrl = `${newOrigin}${pagePath(page)}`;
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1]
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i)?.[1];
  const robots = metaContent(html, 'name', 'robots') ?? '';
  const noindex = /\bnoindex\b/i.test(robots);

  if (!canonical) fail(`${relativePage} has no canonical URL`);
  if (canonical && !canonical.startsWith(`${newOrigin}/`)) fail(`${relativePage} has an invalid canonical URL: ${canonical}`);
  if (!noindex && canonical !== expectedUrl) fail(`${relativePage} canonical should be ${expectedUrl}; found ${canonical}`);
  if (!noindex && !sitemapSet.has(expectedUrl)) fail(`${relativePage} is indexable but missing from sitemap.xml`);
  if (noindex && sitemapSet.has(expectedUrl)) fail(`${relativePage} is noindex but present in sitemap.xml`);

  const ogUrl = metaContent(html, 'property', 'og:url');
  if (ogUrl && ogUrl !== expectedUrl) fail(`${relativePage} og:url should be ${expectedUrl}; found ${ogUrl}`);
  if (html.includes(`https://${oldHost}`) || html.includes(`http://${oldHost}`)) fail(`${relativePage} contains an old absolute web URL`);

  for (const tag of html.matchAll(/<[^>]+>/g)) {
    for (const match of tag[0].matchAll(/\s(?:href|src)=["'](\/[^"'?#]*)[^"']*["']/gi)) {
      const localPath = match[1];
      if (localPath.startsWith('//')) continue;
      const decoded = decodeURIComponent(localPath);
      const target = decoded === '/'
        ? 'index.html'
        : decoded.endsWith('/')
          ? `${decoded.slice(1)}index.html`
          : decoded.slice(1);
      if (!repositoryFiles.has(target)) fail(`${relativePage} references a missing local file: ${localPath}`);
    }
  }
}

const textExtensions = new Set(['.html', '.js', '.json', '.xml', '.txt', '.svg', '.css']);
for (const file of files) {
  if (!textExtensions.has(extname(file)) || relative(root, file) === 'README.md') continue;
  const content = await readFile(file, 'utf8');
  const withoutPreservedEmail = content.split(preservedEmail).join('');
  if (withoutPreservedEmail.includes(oldHost) || withoutPreservedEmail.includes(oldApex)) {
    fail(`${relative(root, file)} still contains the old domain outside the preserved email address`);
  }
}

const cname = (await readFile(join(root, 'CNAME'), 'utf8')).trim();
if (cname !== 'icewind.uk') fail(`CNAME should be icewind.uk; found ${cname}`);

const robots = await readFile(join(root, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${newOrigin}/sitemap.xml`)) fail('robots.txt does not reference the new sitemap URL');

const analytics = await readFile(join(root, 'assets', 'analytics.js'), 'utf8');
if (!analytics.includes("['icewind.uk', 'www.icewind.uk']")) fail('analytics production host allowlist is not configured for the new domain');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}

console.log(`Domain-migration validation passed: ${pages.length} HTML pages, ${sitemapUrls.length} canonical sitemap URLs.`);
