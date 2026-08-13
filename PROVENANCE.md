# Repository provenance

## Source boundary

This private repository was prepared from the active Vesper real-weather laboratory on 2026-08-13 and promoted to the official off-hardware source after review and verification.

Included:

- the browser experience;
- reusable weather-state core;
- dependency-free core tests;
- pinned project-local verification tooling;
- canonical seated PNG assets;
- standalone usage and architecture documentation.

Excluded intentionally:

- machine-specific absolute paths;
- private account, bucket, domain, and infrastructure details;
- deployment credentials or automation;
- historical creative receipts and agent handoffs;
- frozen checkpoint bundles and publication receipts;
- unrelated Desktop or developer-workspace material.

## Source of truth

The private GitHub repository `mooserini/vesper-real-weather-lab` is the official source of truth for current development.

Local Desktop laboratories and frozen snapshots remain valuable history and visual evidence, but they are not independent editable authorities. New work should begin from the repository or an up-to-date clone, pass `npm run verify`, and return through Git history.

## Deployment boundary

This repository contains no production deployment binding, credentials, or automatic R2 publication. Repository authority and deployment authority remain separate.
