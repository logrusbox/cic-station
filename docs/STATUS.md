# CIC Station Status

**Updated:** 2026-09-25

## Repository state

- The repository rename from `Gordonfive/mission-control` to `Gordonfive/cic-station` is complete; ownership subsequently moved to the Logrus Box organization, and `logrusbox/cic-station` is the canonical control-plane repository.
- `logrusbox/cic-station` is public during pre-release development and is the canonical home for the reusable CIC Station application and CIC Station-specific component documentation. ADR-0020 supersedes the private-until-release visibility clause of ADR-0010 without changing the single-repository or source/operational-data boundary.
- `logrusbox/vincent` is the canonical Vincent worker repository.
- `logrusbox/fleet` owns the Fleet roadmap, cross-component integration issues, Fleet status, and Fleet governance.
- A third application repository is not planned. Private fleet information will be stored as deployed application data, with secrets and production configuration outside Git.
- CIC Station is currently `0.1.0` build `0003`.
- A Fleet-owned work-domain reducer and seven executable contract tests are implemented. No service, authenticated API, database migration or web UI is implemented yet. Paperclip remains the accepted application foundation; the exact inspected source and adapter mapping are documented in [WORK_MODEL.md](WORK_MODEL.md).
- `main` is the only permanent branch; automatic deletion of merged temporary branches is enabled.
- No GitHub repository ruleset is currently configured. The documented PR + CI, no-force-push, branch-protection, linear-history, and squash-merge policy remains to be enforced through GitHub settings.
- GitHub Projects v2 is intentionally not part of the authoritative workflow. Repository issues remain concrete work authority, repository milestones own component release targets, and `logrusbox/fleet` owns Fleet-level M0-M8 outcomes.

Current `main` (`6d2a228a9d2ddee03e90ab239fbcc2ebac0534b3`) passed [validation run 33423502131](https://github.com/logrusbox/cic-station/actions/runs/33423502131). Open issues #25, #18, #12, #6, and #4 remain unresolved; no application implementation or open PR was present during the September 25 rescan.

## Foundation preparation

The exact Paperclip source pin, license notice and reproducible preparation script are present; see [FOUNDATION.md](FOUNDATION.md). Source materialization and three preservation/hash tests pass. Dependency/build validation is still in progress; no operational application has been started.

## Current Fleet state

- The canonical documentation/governance reset is complete in both CIC Station and Vincent.
- Vincent QA cleanup has been consolidated to its `main`; physical installer/runtime verification remains the current Vincent gate.
- The large workstation is intended to remain the first useful persistent Vincent worker and future first managed-worker CIC Station subject.
- The old laptop remains the expendable installer/recovery test target.
- ADR-0017 establishes a multidimensional managed-worker state model: scheduling/availability, liveness/health, execution, and power are independent facts; Working/Available/Offline/Standby are derived operator-facing summaries rather than one canonical enum.
- ADR-0018 establishes that the minimum persistent CIC Station service/API/database foundation precedes multi-worker lease coordination. Git is not the authoritative live lease/heartbeat database.
- Issue #25 tracks the pre-schema domain-model refinement separating durable work items from assignments/selections, execution attempts, leases, and results.
- The 0.1.0 operator-security baseline includes distinct operator identities, self-hostable local authentication, explicit least-privilege authorization, one-time first-admin bootstrap, revocable server-side sessions, separate service identities, administrative authentication recovery, and encrypted real operator/worker transport.
- The approved worker-trust baseline uses a worker-generated asymmetric installation credential, operator approval bound to the exact public identity, proof-of-possession on subsequent connections, replay-resistant enrollment/bootstrap, explicit credential rotation/revocation/recovery transitions, and fail-closed CIC Station server-trust verification.
- The approved worker-protocol baseline is explicitly versioned independently of product SemVer, declares compatibility rather than guessing, assumes network retries/duplicates can occur, uses stable idempotency identity for retryable state changes, and rejects stale/conflicting/out-of-order state transitions rather than relying on arrival order.
- External OIDC/SSO, mTLS, asymmetric algorithm choice, hardware-backed keys, certificate-authority selection, reverse-proxy choice, REST/WebSocket/gRPC selection, and serialization format remain optional/later implementation decisions rather than baseline dependencies.
- Reusable CIC Station application coding may begin in this repository under the documented source/operational-data, worker-trust, protocol, state-model, persistence, and security boundaries.

## Current blockers / gates

- Vincent physical installer/runtime verification remains incomplete.
- The large workstation has not yet completed the persistent bounded-work worker proof required before the first managed-worker integration proof.
- CIC Station implementation must keep operational data, worker private credentials, secrets, and private production configuration out of Git.
- Vincent client requirements/implementation must be aligned with the approved CIC Station worker-trust and protocol contract before the first managed-worker proof.
- ADR-0021 resolves the semantic gate in #25; persistence must enforce its relationships transactionally.
- Lease clock authority/skew/restart semantics remain to be defined before the 0.3.0 multi-worker lease implementation.
- GitHub repository rulesets/merge settings and native release milestones require GitHub UI configuration because the connected automation cannot currently create them.

## Next actions

1. Complete Vincent physical installer/runtime acceptance and bring the large workstation fully online as a bounded-work Vincent worker.
2. Align Vincent with the approved asymmetric worker identity, proof-of-possession, server-trust, protocol-versioning, retry/idempotency, managed authorization, and task/credential isolation boundaries.
3. Integrate the tested work domain with the pinned Paperclip foundation and transactional persistence.
4. Begin CIC Station 0.1.0 with the minimum persistent service/API/database foundation for operators, workers/public identities, enrollment/authorization, protocol compatibility, work items, attempts, results, and audit state.
5. Prove the first managed worker through the corresponding cross-component Fleet integration issue before implementing multi-worker lease coordination in 0.3.0.
