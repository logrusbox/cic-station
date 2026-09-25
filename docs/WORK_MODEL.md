# Work and execution domain

## Authority and implementation

This contract implements the semantic separation requested in CIC Station #25 under Fleet ADR-0003. The executable reference is `packages/fleet-domain/work.mjs`; run `npm test`. It is a pure reducer and **not a database, scheduler, authenticated API, or running service**. Callers must authenticate, authorize and commit state plus audit atomically under a database transaction. An expected revision is meaningful only when persistence compares it under that transaction.

## Objects

| Object | Identity and relationship | Authority |
|---|---|---|
| Work item | Stable ID; project, objective, exact repository scope, acceptance intent | Durable requested work; retries preserve ID |
| Selection | Own ID; work ID, worker ID, selecting actor | Records dispatch intent; grants no authority |
| Attempt | Own ID; work ID, selection ID, worker ID, provider context, generation | One concrete execution; terminal history is retained |
| Lease | Own ID; exact attempt, worker, generation | Bounded exclusive authority, validated by service |
| Result | Own ID; exact attempt, lease, generation; outcome and artifact references | Immutable submission; acceptance is a separate service decision |
| Audit event | Transactional event sequence/revision and object references | Attributable state transition history |

One work item has many selections, attempts and results. The first implementation permits one current attempt and one accepted terminal outcome for that attempt. Failed/blocked attempts leave work open for explicit retry. Successful accepted completion closes work. Parallel/speculative attempts are deferred.

The work revision detects concurrent mutations. The execution generation fences superseded ownership. Neither substitutes for the other. Lease identity never becomes work identity. Reusing a lease for a replacement attempt is forbidden. Provider choice is captured per attempt, permitting provider changes between retries.

## State and result rules

1. Selection requires open work and its expected revision.
2. Starting requires a selection, matching revision, no unresolved current attempt, and a fresh lease bound to the selected worker and next generation.
3. Replacement requires an attributable reconciliation of the old attempt. An expired timer or missed heartbeat alone does not prove the old worker stopped.
4. Result submission requires the authenticated worker of the referenced attempt. A body field claiming that identity is insufficient.
5. Acceptance requires the current running attempt, matching lease and generation, and authoritative current lease verification. Unknown workers/attempts are rejected. Known late or fenced submissions are retained as unaccepted evidence; they cannot close work or alter a replacement attempt.
6. Identical result-ID retries return the same state, including after lease expiry. Changed content under that ID conflicts. A new ID cannot create a second accepted terminal outcome.
7. State and audit are committed together. Database uniqueness must cover IDs and idempotency keys within the deployment/tenant boundary. Cross-tenant IDs must never resolve outside authenticated scope.

The reducer accepts `authenticatedWorkerId` and `leaseIsCurrent` only as **trusted service inputs**. Do not deserialize these directly from a worker request. It does not authorize Git writes; Vincent must independently enforce its publication boundary. Accepting a result does not authorize protected integration, release, or destructive actions.

## Persistence integration

Use immutable selection/attempt/result rows with foreign keys and a locked/versioned work row. Acceptance, attempt terminal transition, current-attempt removal, work completion and audit append form one transaction. Preserve rejected-result evidence with retention/access policy. Never store secrets in result summaries or artifact URLs. Production tables and migrations must follow the Paperclip foundation adapter; this package does not introduce a second operational datastore.

Lease clock authority, skew, restart reconciliation, renewable deadlines and disconnection behavior remain CIC Station #18. This contract deliberately contains no clock-based lease allocator. A production service cannot use `true` as a placeholder for lease validation.

## Paperclip foundation mapping

Inspected upstream `paperclipai/paperclip` commit `bd203093235b28631760a76b602b35028322e06f` on 2026-09-25. The root LICENSE at that commit is MIT, copyright 2025 Paperclip AI. No upstream source is copied in this change; this is a mapping based on inspected schemas. Importing code later requires preservation of notices and exact provenance under Fleet ADR-0002.

| Fleet contract | Upstream integration candidate | Required distinction |
|---|---|---|
| Work item | `packages/db/src/schema/issues.ts` | Issue ID remains stable across executions; retain project/company scope |
| Selection | Fleet extension attached to issue | Current assignee is not immutable selection history; execution decisions are review-stage decisions |
| Attempt | `packages/db/src/schema/heartbeat_runs.ts` | Bind run to one Fleet attempt, worker installation and generation explicitly |
| Lease | Fleet extension attached to attempt | Upstream controller lease does not automatically grant Vincent repository publication authority |
| Result | Fleet result row linked to run and issue | `resultJson` alone does not define fenced acceptance or idempotency |
| Audit | Upstream activity plus Fleet transactional events | Preserve exact transition identity and rejection evidence |

Pinning this inspection does not approve every upstream dependency or claim the full foundation proof. The complete Paperclip-derived service, authenticated Vincent adapter, Fleet MCP surface and real Codex result remain to be integrated and verified.
