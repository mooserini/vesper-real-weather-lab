# Vesper Real-Weather Lab

A browser-based experiential prototype in which current weather chooses Vesper’s body, atmosphere, motion profile, and lighting.

This repository candidate is standalone and client-side. It contains no credentials, account configuration, deployment automation, analytics, backend, or private infrastructure information.

## Experience

- Search for an unambiguous place such as `Portland, Maine`.
- Optionally use explicit browser geolocation; location access is never requested automatically.
- Switch between Fahrenheit and Celsius.
- Use **Find Live States** to survey 72 changing geographic sample points and find current examples of Vesper states.
- Pause ambient motion or enable optional SVG deformation.

Open-Meteo supplies geocoding and current conditions without a project API key.

## State model

Weather and illumination are independent dimensions:

1. Thunderstorm codes resolve to **Stormy**.
2. Snow and snow-shower codes resolve to **Snowy**.
3. Drizzle, rain, freezing rain, and rain-shower codes resolve to **Rainy**, even in high wind.
4. Wind at or above 25 km/h resolves to **Windy** only when the base condition is otherwise clear, cloudy, or foggy.
5. Clear conditions resolve to **Clear**.
6. `is_day=0` applies night lighting without replacing Rainy, Snowy, Stormy, or Windy.

Clear-at-night uses the dedicated Night motion profile and star field. Weather-at-night retains its weather-specific body, particles, and metabolism under night lighting.

## Run locally

No build step or package installation is required.

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8765/
```

The page loads two font stylesheets from jsDelivr and current weather from Open-Meteo, so those features require network access.

## Verify

Requires Node.js 22 or newer. Install the pinned project-local development tools:

```bash
npm ci
```

Then run the canonical check:

```bash
npm run verify
```

That command runs:

- 41 dependency-free core assertions;
- ESLint over the reusable core, tests, and verifier;
- HTML validation;
- Markdown linting;
- the Clear-night behavior contract;
- inline-script syntax validation.

Tool versions are pinned in `package-lock.json`; no global linter installation is required.

## Files

```text
index.html            Experience, rendering, controls, and animation engine
weather-core.js       Reusable weather/state resolution and discovery logic
weather-core.test.js  Dependency-free Node assertions
scripts/verify.mjs    Durable behavior and inline-script verifier
package.json          Canonical test/lint/verification commands
assets/               Six canonical Vesper PNG assets
```

## Repository status

This folder is a sanitized repository candidate derived from an actively evaluated prototype. It is not wired to deployment and does not contain historical creative receipts. Earlier frozen snapshots remain outside this repository by design.

## Rights and publication

All rights reserved unless and until the owner adds an explicit license. Do not assume public reuse rights from source availability or repository access.
