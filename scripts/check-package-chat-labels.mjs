import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// Owner-approved UI: keep retention and Chat privacy, without the removed AI label.
for (const [page,dictionaries] of [['limitedoffer','assets/offer-i18n'],['business-website-699','business-website-699/assets']]) {
 const html=await readFile(`${page}/index.html`,'utf8');
 const note=html.match(/<p class="chat-note">([\s\S]*?)<\/p>/)?.[1];
 assert.ok(note,`${page}: missing chat note`);
 assert.ok(!/powered by AI|AI assistant/i.test(note),`${page}: removed label returned`);
 assert.ok(note.includes('Conversations are saved by ICE WIND until deletion.'),`${page}: preserve retention note`);
 assert.ok(note.includes('Chat privacy'),`${page}: preserve privacy link`);
 for(const language of ['ru','es','uk']) {
  const dict=JSON.parse(await readFile(`${dictionaries}/${language}.json`,'utf8'));
  assert.ok(dict['Conversations are saved by ICE WIND until deletion.'],`${page}: missing ${language} translation`);
  assert.ok(!Object.hasOwn(dict,'Chat powered by AI. Conversations are saved by ICE WIND until deletion.'),`${page}: obsolete ${language} copy`);
 }
}
console.log('Package chat labels passed: £499 / £699, EN / RU / ES / UK.');
