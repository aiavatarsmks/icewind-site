import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = process.cwd();
const expectedOrganization = JSON.parse(await readFile(join(root, 'schema', 'organization.json'), 'utf8'));
const organizationId = 'https://icewind.uk/#organization';
const expectedSameAs = [
  'https://clutch.co/profile/icewind-dale-consulting',
  'https://www.instagram.com/icewind.consult/',
  'https://techbehemoths.com/company/icewind-dale-consulting-ltd',
  'https://www.goodfirms.co/company/icewind-dale-consulting-ltd',
  'https://themanifest.com/company/icewind-dale-consulting'
];

async function findPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    if (['.git', 'assets', 'schema', 'scripts'].includes(entry.name)) continue;
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...await findPages(entryPath));
    if (entry.isFile() && entry.name === 'index.html') pages.push(entryPath);
  }
  return pages;
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

for (const page of await findPages(root)) {
  const html = await readFile(page, 'utf8');
  const blocks = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>\s*([\s\S]*?)\s*<\/script>/gi)];
  const schemas = blocks.map((block, index) => {
    try {
      return JSON.parse(block[1]);
    } catch (error) {
      fail(`${relative(root, page)} JSON-LD block ${index + 1} is invalid JSON: ${error.message}`);
      return null;
    }
  }).filter(Boolean);
  const organizations = schemas.filter((schema) => schema['@type'] === 'Organization' && schema['@id'] === organizationId);
  if (organizations.length !== 1) fail(`${relative(root, page)} must have exactly one primary Organization schema; found ${organizations.length}`);
  const organization = organizations[0];
  if (!organization) continue;
  if (JSON.stringify(organization) !== JSON.stringify(expectedOrganization)) fail(`${relative(root, page)} Organization schema differs from schema/organization.json`);
  if (JSON.stringify(organization.sameAs) !== JSON.stringify(expectedSameAs)) fail(`${relative(root, page)} has an incorrect sameAs array`);
  if (new Set(organization.sameAs).size !== organization.sameAs.length) fail(`${relative(root, page)} has duplicate sameAs URLs`);
  if (!organization.sameAs.every((url) => url.startsWith('https://'))) fail(`${relative(root, page)} has a non-HTTPS sameAs URL`);
  if (JSON.stringify(organization).toLowerCase().includes('icewindstudio')) fail(`${relative(root, page)} contains the old Instagram handle in structured data`);
  for (const schema of schemas.filter((schema) => schema['@type'] === 'Service')) {
    if (schema.provider?.['@id'] !== organizationId) fail(`${relative(root, page)} Service provider does not reference the shared Organization @id`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log('Structured-data validation passed.');
