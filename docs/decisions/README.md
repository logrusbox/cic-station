# Architecture Decision Records

ADRs are the authoritative record for consequential CIC Station decisions.

## Format

Each ADR uses an immutable `ADR-####-short-title.md` filename and records:

- status;
- decision date;
- context;
- decision;
- rationale;
- consequences;
- supersedes / superseded-by when applicable.

ADR numbers are assigned only on the integration branch/PR and are never reused after merge to `main`.

## Current ADRs

- `ADR-0001-self-hostable-web-api-control-plane.md`
- `ADR-0002-public-application-private-deployment-split.md` — superseded by ADR-0010
- `ADR-0003-outbound-authenticated-worker-protocol.md`
- `ADR-0004-explicit-enrollment-and-revocation.md`
- `ADR-0005-assignment-leases-and-conservative-reassignment.md`
- `ADR-0006-human-approval-gates.md`
- `ADR-0007-ai-provider-identity-profiles.md`
- `ADR-0008-git-durable-project-authority-operational-database.md`
- `ADR-0009-agplv3-public-application-license.md` — visibility clause superseded by ADR-0020
- `ADR-0010-single-application-repository-private-until-release.md` — visibility portion superseded by ADR-0020
- `ADR-0011-versioning-and-build-identifiers.md`
- `ADR-0012-rename-product-to-cic-station.md`
- `ADR-0013-operator-identity-and-access-control.md`
- `ADR-0014-encrypted-transport-baseline.md`
- `ADR-0015-worker-generated-asymmetric-identity.md`
- `ADR-0016-versioned-idempotent-worker-protocol.md`
- `ADR-0017-worker-state-dimensions.md`
- `ADR-0018-persistent-operational-state-before-multi-worker-leases.md`
- `ADR-0019-decentralized-enrollment-and-worker-egress-policy.md`
- `ADR-0020-public-development-visibility.md`

Do not maintain a second full-text decision register.

- `ADR-0021-separate-work-selection-attempt-lease-result.md`
