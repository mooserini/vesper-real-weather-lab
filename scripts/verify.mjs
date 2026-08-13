import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

import core from '../weather-core.js';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.equal(core.selectMotionProfile('clear', true), 'night');
assert.equal(core.selectMotionProfile('clear', false), 'clear');
assert.equal(core.selectMotionProfile('rainy', true), 'rainy');
assert.equal(
  core.resolveVesperState({ weatherCode: 61, isDay: 1, windKmh: 32 }),
  'rainy'
);
assert.equal(
  core.resolveVesperState({ weatherCode: 0, isDay: 1, windKmh: 28 }),
  'windy'
);
assert.doesNotMatch(html, /nightProfileBtn|Night Motion:/);
assert.match(html, /selectMotionProfile\(eng\.state, eng\.isNight\)/);

for (const match of html.matchAll(/<script(?: src=[^>]*)?>([\s\S]*?)<\/script>/g)) {
  const source = match[1].trim();
  if (source) new vm.Script(source);
}

console.log('structure: behavior contract and inline scripts passed');
