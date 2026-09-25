# CIC Station Documentation

This directory contains the canonical CIC Station component documentation.

The Fleet roadmap, Fleet status, cross-component integration issues, and Fleet-level ADRs are owned by [`logrusbox/fleet`](https://github.com/logrusbox/fleet).

## Canonical documents

- `PRODUCT.md` — CIC Station purpose, users, goals, non-goals, and component boundaries.
- `REQUIREMENTS.md` — stable `MC-REQ-####` functional and non-functional requirements.
- `ARCHITECTURE.md` — control-plane architecture and Vincent integration boundary.
- `ROADMAP.md` — CIC Station component/release roadmap only.
- `STATUS.md` — current CIC Station implementation, proof, and blocker state.
- `decisions/README.md` — CIC Station ADR index.
- `PROGRAM_ROADMAP.md` — migration pointer to the canonical Fleet repository.

## Supporting material

- GitHub issues — CIC Station-specific backlog, active work, blockers, and follow-ups.
- Pull requests — implementation/review state and change-specific evidence.
- `CHANGELOG.md` — concise release history.
- `CONTRIBUTING.md` — repository workflow and contribution policy.
- `SECURITY.md` — security reporting and public-repository security boundary.

## Lifecycle rules

- Do not recreate permanent handoff, Project Start, or planned-feature backlog documents.
- Consequential CIC Station decisions become CIC Station ADRs; genuinely cross-component Fleet decisions belong in `logrusbox/fleet`.
- Requirements retain their IDs permanently; superseded requirements keep their identifiers and status.
- Completed migration/project-reset material belongs in Git history, not the active documentation tree.
- Large raw logs, screenshots, generated builds, and CI bundles belong in Actions/release artifacts rather than ordinary Git history.
- Documentation and source change through the same pull-request/CI workflow.

- [Work and execution domain](WORK_MODEL.md) — canonical work/attempt/lease/result semantics and upstream mapping.

- [Paperclip foundation](FOUNDATION.md) — exact source pin and reproducible preparation.
