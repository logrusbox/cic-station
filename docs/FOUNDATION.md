# Paperclip foundation preparation

Fleet ADR-0002 selects an upstream-friendly Paperclip foundation. The reusable work contract remains in CIC Station; the source checkout below is the integration/build work area, not a deployed second service.

## Reproducible source

`upstream/paperclip.lock.json` pins commit `bd203093235b28631760a76b602b35028322e06f`, the root license, package manifest and dependency lockfile hashes. `upstream/PAPERCLIP_LICENSE` preserves the inspected MIT notice. No modifications to upstream implementation are imported in this change.

Run from this repository:

```sh
python3 scripts/prepare_foundation.py /absolute/new/path/paperclip
```

The script fetches the exact commit and verifies the pinned files. Repeating against a clean matching checkout is safe. Dirty, different-revision or interrupted checkouts are preserved and require a new target path. It does not install dependencies, run migrations, start services or access credentials. A local mirror may be passed with `--source`; commit/hash checks remain mandatory.

The exact upstream source checkout was successfully materialized and verified on 2026-09-25. Three Git integration tests cover repeat preparation, dirty-work preservation and hash mismatch. This is source reproducibility evidence, not the managed-worker proof.

## Toolchain

The inspected upstream package declares Node >=24.11.0 and pnpm 9.15.4. Use that exact pnpm version with `--frozen-lockfile`; the environment's default pnpm 11 rejected upstream patch configuration. Never rewrite the upstream lockfile merely to accommodate a different local toolchain. Initial dependency inspection uses `--ignore-scripts`; necessary lifecycle scripts must be assessed explicitly before builds.

## Next integration work

1. Run the automated real PostgreSQL foundation proof and record its outcome.
2. Add the Fleet contract as a modular extension to upstream issues and heartbeat runs using the mapping in [WORK_MODEL.md](WORK_MODEL.md).
3. Add transactional persistence with tenant-scoped identities, revision comparisons, immutable attempts/results and audit.
4. Implement the authenticated Vincent adapter and ChatGPT-facing Fleet MCP operations.
5. Prove ChatGPT → Fleet MCP → Paperclip-derived CIC task → Vincent → Codex → durable CIC result on the authorized worker.

No deployed service, operational database, UI, approved provider credentials or successful end-to-end execution is claimed. Upstream dependency licensing and formal release audits remain separate from the root MIT source notice.


## September 25 validation evidence

The exact pnpm 9.15.4 frozen dependency installation completed with lifecycle scripts
disabled. Database migration numbering/safety checks and TypeScript compilation
passed through `node --import tsx` and `tsc --noEmit`. The usual tsx CLI IPC launcher
was restricted in the execution environment, so the supported loader was used.
The migration safety check reports 20 historical findings covered by upstream's
baseline, with one stale baseline identifier; this is not a clean security audit.

Local real PostgreSQL startup is blocked: the environment runs as root and denies
switching to a non-root account (`runuser: cannot set groups`). PostgreSQL refuses
root execution. The `Paperclip foundation` GitHub workflow runs on a normal non-root
runner, installs the locked source, checks the database module, applies actual
upstream migrations to a disposable database, and verifies the issue/run columns
used by Fleet's mapping. It never connects to a deployed fleet or uses credentials.
Only a green run supplies database-foundation evidence; it does not prove Vincent,
Codex, enrollment, MCP or the complete application.
