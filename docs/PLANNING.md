# Planning and Work Tracking

GitHub issues are the active planning system for the VINCENT product family.

## Authority

- `logrusbox/cic-station` issues: CIC Station-specific active work, defects, verification, blockers, and unscheduled ideas.
- `logrusbox/vincent` issues: Vincent-specific active work.
- `logrusbox/fleet` issues: only genuinely cross-product integration/governance work.
- Pull requests: implementation/review state and change-specific evidence.
- Repository milestones: target product releases.
- Repository labels: lightweight priority/workstream classification where useful.
- `logrusbox/fleet/docs/PROGRAM_ROADMAP.md`: cross-product milestone outcomes.
- Each product repository's `docs/ROADMAP.md`: product/release outcomes.
- Product `docs/REQUIREMENTS.md`: stable product requirements.
- Product ADRs: consequential product decisions.
- Program ADRs: consequential decisions that genuinely apply above both products.
- Product `docs/STATUS.md`: concise current product implementation/test state.
- Program `docs/STATUS.md`: concise cross-product state.

A separate GitHub Projects v2 board is intentionally not part of the authoritative workflow because the connected automation cannot maintain it directly without creating manual synchronization burden.

## Issue placement

Use the narrowest correct owner:

- If one product can implement and accept the work independently, keep the issue in that product repository.
- If acceptance genuinely requires coordinated changes/proof in both products, use one issue in `logrusbox/fleet` and link the authoritative product issues/PRs.
- Do not create duplicate mirror issues merely for visibility.

## Lightweight metadata

Prefer native GitHub metadata over custom planning documents: issue state, product milestone, labels, assignee when useful, linked PRs, and dependency links.

Avoid story points, sprint fields, duplicated release fields, permanent handoff documents, and other metadata requiring continual synchronization without demonstrated value.
