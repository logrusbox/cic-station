# CIC Station Architecture

## Product boundary

CIC Station is the managed-fleet control plane. Vincent is the worker platform. Project repositories remain authoritative for project source, requirements, tests, repository-local instructions, and durable development artifacts.

A fresh Vincent worker does not require CIC Station. CIC Station authority begins after explicit enrollment.

## Application foundation

Fleet ADR-0002 selects an upstream-friendly Paperclip fork as the initial application foundation. Fleet ADR-0003 requires replaceable domain contracts and a modular monolith by default. CIC Station integrates Fleet work/attempt/lease/result authority through explicit adapters; it must not silently replace the accepted foundation with a separate greenfield service.

See [Work and execution domain](WORK_MODEL.md) and ADR-0021 for the canonical object relationships, reducer tests, transaction requirements and exact upstream mapping.

## Logical layers

1. **Web UI** — responsive authenticated operator interface for enrollment, fleet status, worker details, assignments, approvals, failures, reports, and policy.
2. **Authenticated API/application service** — authenticates operator/service identities and worker identities, enforces authorization, workflow/state transitions, leases, approval gates, session lifecycle, and audit recording.
3. **Persistent operational database** — stores operator/role state, worker registry, worker public/verifier identities, enrollment state, capabilities, leases, health, policy, audit events, notification state, and other operational data that is not appropriate for Git.
4. **Worker protocol** — authenticated encrypted outbound Vincent connections for registration, heartbeat, assignment/lease exchange, provider-profile policy, results, and health, using explicit protocol compatibility and retry-safe state transitions.
5. **Durable project authorities** — Git repositories containing source, product/requirements, ADRs, tasks where applicable, commits, reports, and project-specific rules.
6. **Protected secret system** — separate mechanism for any future unattended credential delivery; raw secrets do not live in Git or ordinary fleet records.

## Data authority

| Data | Canonical authority |
|---|---|
| Project source, product requirements, repository instructions, commits | Project Git repository |
| CIC Station product requirements/ADRs (Fleet owns program roadmap) | CIC Station Git repository |
| Operator identities, roles/permissions, and session state | CIC Station service/database once implemented |
| Worker identity/enrollment/authorization state and public/verifier material | CIC Station service/database once implemented |
| Worker private installation credential | Protected Vincent-local storage; never CIC Station or Git |
| Worker heartbeat and current liveness | CIC Station operational state |
| Assignment lease ownership | CIC Station operational state |
| Durable task result/source changes | Project Git plus CIC Station audit/reference |
| Installer provenance and current Vincent version | Reported by Vincent; recorded by CIC Station |
| Raw credentials | Protected secret store/local protected worker storage, never Git |

Git-backed fixtures and durable project artifacts are permitted. ADR-0018 requires persistent operational service/database authority before multi-worker lease coordination; Git is not live lease authority.

## Operator identity and access control

The baseline self-hosted deployment supports application-local operator accounts so CIC Station does not depend on an external identity provider to remain operable. External OIDC/SSO integration may be added later without replacing the local recovery/control boundary.

Each human operator has a distinct identity. Authentication establishes identity; authorization separately determines which fleet-control operations that identity may perform. The initial model should remain small and explicit rather than importing enterprise IAM complexity before it is needed, but it must preserve least privilege and avoid treating every authenticated operator as an unrestricted administrator.

The first administrator is established through an explicit one-time bootstrap path. CIC Station must not ship with a reusable default administrator credential. After the first administrator is created, bootstrap capability is disabled or restricted to an explicit recovery procedure.

Interactive browser access uses secure server-side session state. Sessions expire and support explicit logout/revocation. High-impact actions may require reauthentication according to policy. Browser session cookies and equivalent credentials must receive the normal protections appropriate to their transport and client context.

Non-human API/service identities are separate from interactive human operators. They receive their own bounded scope, lifecycle, revocation, and audit attribution rather than borrowing a human session or shared administrator identity.

Operator-authentication recovery is an explicit self-hosted administrative procedure. Recovery may rely on trusted local host administration, but it must establish fresh authority rather than silently resurrecting old credentials and must preserve an attributable recovery/audit record where operationally possible.

## Transport security

Real operator/API and routine Vincent-to-CIC-Station communication is encrypted in transit using TLS or equivalent authenticated encryption. Plaintext communication is limited to explicitly local non-production development that carries no real credentials or operational data.

TLS termination may occur in CIC Station itself or at a trusted deployment boundary such as a reverse proxy. A deployment must not introduce an unprotected network hop across a trust boundary merely because TLS terminates upstream.

This baseline does not require mutual TLS. Reverse-proxy choice and certificate-authority strategy remain implementation decisions provided they satisfy the authenticated-encrypted transport requirement.

## Worker identity and enrollment trust

Each Vincent installation generates an asymmetric installation credential before enrollment. The worker retains the private credential in protected local storage and presents only the corresponding public identity/fingerprint with its inspectable non-secret enrollment request.

Operator approval binds the CIC Station worker record and granted authority to that exact public identity. Hostname, hardware metadata, worker labels, or a claimed worker identifier are informational and are not sufficient authentication by themselves.

After enrollment, the worker authenticates by proving possession of the private credential corresponding to the approved public identity. CIC Station stores only public/verifier material and authorization state needed to validate that proof; it does not receive or store the worker private credential.

Any additional bootstrap token, claim code, challenge, or similar material used to bridge the untrusted enrollment request and approval must be bounded, expiring, and single-use wherever reuse could confer authority. Enrollment and credential-transition flows must resist replay and substitution.

Worker credential rotation, suspension, revocation, replacement, and recovery are explicit auditable transitions. A new credential may be bound to an existing worker record only through an authorized transition. Reinstallation otherwise receives fresh worker authority rather than silently inheriting the old installation credential.

Vincent verifies CIC Station's authenticated transport identity and fails closed on invalid or untrusted server identity. A deliberately defined bootstrap or recovery flow may establish initial trust, but it must not silently weaken already-established trust.

This contract does not require a specific asymmetric algorithm, hardware-backed key store, certificate authority, or mTLS. Those remain implementation choices constrained by the proof-of-possession and trust requirements.

## Worker connection model

Normal worker communication is initiated outbound by Vincent over an authenticated encrypted protocol. This allows workers behind NAT and ordinary firewalls to participate without inbound management ports.

CIC Station exposes bounded operations and state transitions, not arbitrary shell execution. SSH remains an independent administrative fallback.

## Worker protocol compatibility and retry safety

The logical Vincent/CIC Station worker protocol is explicitly versioned independently of product Semantic Versions. Each exchange carries enough protocol/schema-version information for both sides to determine whether they have a declared compatible interpretation.

Compatibility is explicit through supported versions/ranges or equivalent rules. If compatibility cannot be established, the operation fails visibly and safely rather than guessing or silently applying unknown behavior. Worker inventory, diagnostics, and release metadata expose the relevant compatibility information.

The protocol never assumes exactly-once network delivery. Reconnects, timeouts, duplicate delivery, and retries are expected failure modes. Retryable state-changing operations therefore use stable request, operation, assignment, event, or equivalent identifiers so a receiver can detect duplicates and apply idempotent behavior.

State transitions carry sufficient identity, revision/generation, or equivalent precondition context to detect stale, conflicting, superseded, or out-of-order updates. Arrival order alone may not let an older message overwrite newer authoritative state.

This logical contract is transport-neutral. REST, WebSocket, SSE, gRPC, message queues, serialization formats, and database concurrency mechanisms remain implementation choices as long as they satisfy the versioning, compatibility, retry, and state-transition requirements.

## Enrollment and trust

1. Vincent generates its unique installation identity and asymmetric installation credential.
2. The worker presents a non-secret enrollment request containing its public identity/fingerprint.
3. An authenticated and authorized operator verifies the request and approves that exact public identity.
4. CIC Station binds scoped, revocable authority to the approved identity.
5. Subsequent worker communication proves possession of the corresponding private credential over authenticated encrypted transport.
6. The worker registers capabilities and health using the declared compatible worker protocol.
7. Reinstallation normally creates a new identity unless an explicit recovery transition authorizes otherwise.

## Assignments and leases

Assignments describe bounded work and hard requirements. CIC Station may explicitly select a worker or choose one by capabilities.

Exclusive managed work uses time-bounded leases. Heartbeats show liveness but do not replace lease ownership. A worker that loses or cannot verify its lease must not continue publishing exclusive results indefinitely. Reassignment is conservative when network state is uncertain.

Lease clock authority and skew/restart semantics are intentionally deferred to the 0.3.0 lease-design gate tracked separately; implementations must not infer unsafe ownership merely from synchronized wall-clock assumptions.

## AI-provider identity boundary

CIC Station may assign the desired provider and non-secret identity context. Vincent owns provider installation, provider-specific enrollment, local credential storage, and effective-identity/health verification.

CIC Station receives only non-secret effective identity/scope/status information needed to detect mismatches and enforce policy.

If unattended provider credentials are required later, a protected secret broker or one-time delivery mechanism must provide unique/scoped/rotatable/revocable credentials over authenticated encrypted transport. Shared fleet-wide AI credentials are prohibited.

## Recovery

The CIC Station service is replaceable. Recovery should reconstruct durable product/project knowledge from Git, restore private deployment configuration from protected operational backups, start the service/database, restore or deliberately recover operator access, request fresh worker registrations/heartbeats, validate worker proof-of-possession and protocol compatibility, expire or reconcile uncertain leases conservatively, and resume dispatch only after ownership is safe.

Loss of CIC Station must not destroy project source, product intent, completed work, or the ability to rebuild workers. Loss of worker private credentials does not permit CIC Station to recreate them; recovery must use explicit replacement/re-enrollment semantics.

## Repository and operational-data boundary

`logrusbox/cic-station` contains the reusable application code, schemas, safe examples, tests, packaging, and product documentation and is public during pre-release development. Public visibility is separate from formal release readiness.

Logrus Box fleet data is application data: operator identities/authorization state, worker public identities and authorization state, assignments, results, leases, and audit history belong in the deployed operational database and protected backups. Worker private credentials, raw secrets, and private production configuration remain outside Git and outside ordinary CIC Station records. Formal release still requires the applicable audit of the complete Git history and proposed release contents.
