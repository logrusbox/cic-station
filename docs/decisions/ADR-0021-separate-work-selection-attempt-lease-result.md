# ADR-0021: Separate work, selection, attempt, lease and result

**Status:** Accepted
**Decision date:** 2026-09-25

## Context

Issue #25 identifies the need to preserve durable requested work across failures, retries, replacements and provider changes before schema implementation. Fleet ADR-0002 selects Paperclip as the application foundation; ADR-0003 retains Fleet-owned execution contracts.

## Decision

Adopt the objects and invariants in [WORK_MODEL.md](../WORK_MODEL.md). Work identity survives retries. Selection records intent. Each concrete execution has an attempt identity and monotonically increasing work generation. Leases bind exact attempts, workers and generations. Result submission and result acceptance are separate facts. Preserve superseded attempts and unaccepted late results as evidence.

The initial contract permits one current attempt. Reassignment requires explicit reconciliation. Apply changes with audit under transactional persistence. Keep this module independent of Paperclip transport and provider implementations, with an adapter to upstream issue/run records.

## Consequences

The pre-schema semantic gate in #25 is resolved. Executable contract tests cover retries, stale outcomes, idempotency, conflicting replays and exact ownership. This decision does not claim a deployed service, select lease clock policy (#18), bypass protected-action approvals, or complete the Paperclip foundation proof. No new deployment service or alternate database is introduced.
