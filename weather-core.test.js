const assert = require('node:assert/strict');
const {
  codeToBaseState,
  resolveVesperState,
  resolveVesperAppearance,
  formatPlace,
  buildForecastUrl,
  buildDiscoveryPoints,
  chooseLiveExamples,
  createLatestGate,
  selectMotionProfile
} = require('./weather-core.js');

assert.equal(codeToBaseState(0), 'clear');
assert.equal(codeToBaseState(61), 'rainy');
assert.equal(codeToBaseState(75), 'snowy');
assert.equal(codeToBaseState(95), 'stormy');
assert.equal(codeToBaseState(2), 'clear');

assert.equal(resolveVesperState({ weatherCode: 0, isDay: 0, windKmh: 4 }), 'night');
assert.equal(resolveVesperState({ weatherCode: 61, isDay: 0, windKmh: 4 }), 'rainy');
assert.equal(resolveVesperState({ weatherCode: 0, isDay: 1, windKmh: 28 }), 'windy');
assert.equal(resolveVesperState({ weatherCode: 95, isDay: 1, windKmh: 45 }), 'stormy');
assert.equal(resolveVesperState({ weatherCode: 75, isDay: 1, windKmh: 45 }), 'snowy');
assert.equal(resolveVesperState({ weatherCode: 61, isDay: 1, windKmh: 32 }), 'rainy');
assert.equal(resolveVesperState({ weatherCode: 51, isDay: 1, windKmh: 28 }), 'rainy');
assert.equal(resolveVesperState({ weatherCode: 67, isDay: 1, windKmh: 40 }), 'rainy');

assert.deepEqual(resolveVesperAppearance({ weatherCode:0, isDay:0, windKmh:4 }), { state:'clear', isNight:true });
assert.deepEqual(resolveVesperAppearance({ weatherCode:61, isDay:0, windKmh:4 }), { state:'rainy', isNight:true });
assert.deepEqual(resolveVesperAppearance({ weatherCode:75, isDay:0, windKmh:4 }), { state:'snowy', isNight:true });
assert.deepEqual(resolveVesperAppearance({ weatherCode:95, isDay:0, windKmh:4 }), { state:'stormy', isNight:true });
assert.deepEqual(resolveVesperAppearance({ weatherCode:1, isDay:0, windKmh:32 }), { state:'windy', isNight:true });
assert.deepEqual(resolveVesperAppearance({ weatherCode:80, isDay:0, windKmh:32 }), { state:'rainy', isNight:true });
assert.deepEqual(resolveVesperAppearance({ weatherCode:0, isDay:1, windKmh:4 }), { state:'clear', isNight:false });

assert.equal(formatPlace({ name: 'Portland', admin1: 'Maine', country_code: 'US' }), 'Portland, Maine');
assert.match(buildForecastUrl(43.65, -70.26, 'fahrenheit'), /current=temperature_2m%2Capparent_temperature%2Cweather_code%2Cwind_speed_10m%2Cis_day/);
assert.match(buildForecastUrl(43.65, -70.26, 'fahrenheit'), /timezone=auto/);

const points = buildDiscoveryPoints();
assert.ok(points.length >= 40);
assert.ok(new Set(points.map(p => p.label)).size === points.length);

const examples = chooseLiveExamples([
  { label:'Day Clear', weatherCode:0, isDay:1, windKmh:4 },
  { label:'Night Clear', weatherCode:0, isDay:0, windKmh:4 },
  { label:'Rain', weatherCode:61, isDay:1, windKmh:3 },
  { label:'Wind', weatherCode:1, isDay:1, windKmh:32 },
  { label:'Storm A', weatherCode:95, isDay:1, windKmh:20 },
  { label:'Storm B', weatherCode:96, isDay:1, windKmh:45 }
]);
assert.equal(examples.clear.label, 'Day Clear');
assert.equal(examples.night.label, 'Night Clear');
assert.equal(examples.rainy.label, 'Rain');
assert.equal(examples.windy.label, 'Wind');
assert.equal(examples.stormy.label, 'Storm B');
assert.equal(examples.snowy, undefined);

const nightWeatherExamples = chooseLiveExamples([
  { label:'Night Rain', weatherCode:61, isDay:0, windKmh:4 },
  { label:'Night Snow', weatherCode:75, isDay:0, windKmh:4 },
  { label:'Night Wind', weatherCode:1, isDay:0, windKmh:32 }
]);
assert.equal(nightWeatherExamples.rainy.label, 'Night Rain');
assert.equal(nightWeatherExamples.snowy.label, 'Night Snow');
assert.equal(nightWeatherExamples.windy.label, 'Night Wind');

const gate = createLatestGate();
const oldRequest = gate.begin();
const newRequest = gate.begin();
assert.equal(gate.isLatest(oldRequest), false);
assert.equal(gate.isLatest(newRequest), true);
gate.invalidate();
assert.equal(gate.isLatest(newRequest), false);

assert.equal(selectMotionProfile('clear', false), 'clear');
assert.equal(selectMotionProfile('clear', true), 'night');
assert.equal(selectMotionProfile('rainy', true), 'rainy');

console.log('weather-core: 41 assertions passed');
