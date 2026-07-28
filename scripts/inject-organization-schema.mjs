import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const organizationPath = join(root, 'schema', 'organization.json');
const organization = JSON.parse(await readFile(organizationPath, 'utf8'));
const organizationId = organization['@id'];
const startMarker = '<!-- ICEWIND:ORGANIZATION-SCHEMA:START -->';
const endMarker = '<!-- ICEWIND:ORGANIZATION-SCHEMA:END -->';
const schemaBlock = `${startMarker}\n<script type="application/ld+json">\n${JSON.stringify(organization, null, 2)}\n</script>\n${endMarker}`;

async function findPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'assets' || entry.name === 'schema' || entry.name === 'scripts') continue;
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...await findPages(entryPath));
    if (entry.isFile() && entry.name === 'index.html') pages.push(entryPath);
  }
  return pages;
}

function replacePrimaryOrganization(html) {
  const jsonLdPattern = /<script\s+type=["']application\/ld\+json["'][^>]*>\s*([\s\S]*?)\s*<\/script>/gi;
  return html.replace(jsonLdPattern, (script, json) => {
    try {
      const data = JSON.parse(json);
      return data['@type'] === 'Organization' && data['@id'] === organizationId ? schemaBlock : script;
    } catch {
      return script;
    }
  });
}

function normalizeServiceProviders(html) {
  const jsonLdPattern = /<script\s+type=["']application\/ld\+json["'][^>]*>\s*([\s\S]*?)\s*<\/script>/gi;
  return html.replace(jsonLdPattern, (script, json) => {
    try {
      const data = JSON.parse(json);
      if (data['@type'] !== 'Service' || data.provider?.['@type'] !== 'Organization') return script;
      data.provider = { '@id': organizationId };
      return `<script type="application/ld+json">\n${JSON.stringify(data)}\n</script>`;
    } catch {
      return script;
    }
  });
}

for (const page of await findPages(root)) {
  let html = await readFile(page, 'utf8');
  html = html.replace(new RegExp(`${startMarker}[\s\S]*?${endMarker}`, 'g'), schemaBlock);
  html = replacePrimaryOrganization(html);
  html = normalizeServiceProviders(html);
  if (!html.includes(startMarker)) html = html.replace('</head>', `${schemaBlock}\n</head>`);
  await writeFile(page, html);
}
