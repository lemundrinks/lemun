import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
const html = await readFile('site/index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
for (const m of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(m[1]), `Missing anchor ${m[1]}`);
for (const file of ['index.html', 'privacy.html']) {
  const page = await readFile(`site/${file}`, 'utf8');
  for (const m of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const link = m[1];
    if (/^(https?:|mailto:|tel:|sms:|#)/.test(link)) continue;
    await access(resolve('site', link.split('#')[0]));
  }
  assert(page.includes('name="viewport"'), 'Missing viewport');
  assert(page.includes('noindex, nofollow'), 'Preview must stay noindex');
}
assert.equal((html.match(/class="product /g) || []).length, 8, 'Eight confirmed drinks');
assert.equal((html.match(/data-city=/g) || []).length, 6, 'Six confirmed retailers');
for (const claim of ['no added sugar', '100% natural', 'supports immunity', 'detoxifies', 'healing power', 'vegan']) assert(!html.toLowerCase().includes(claim), `Unresolved claim: ${claim}`);
assert(html.includes('action="https://api.web3forms.com/submit"'), 'Expected Web3Forms endpoint');
assert(html.includes('name="access_key"'), 'Missing Web3Forms access key field');
assert(!html.includes('id="draft"'), 'Remove the obsolete email draft UI');
console.log('Passed: local links/assets, unique anchors, eight drinks, six retailers, responsive metadata, preview indexing and unresolved-claim checks.');
