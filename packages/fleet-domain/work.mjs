/** Fleet-owned domain rules. Persistence must apply these under a transaction/lock. */
export class DomainConflict extends Error {}
const require = (ok, message) => { if (!ok) throw new DomainConflict(message); };
const id = value => typeof value === 'string' && value.length > 0;

export function createWork({id: workId, projectId, objective, repository, acceptance}) {
  require([workId, projectId, objective, repository, acceptance].every(id), 'bounded work fields required');
  return {schemaVersion: 1, id: workId, projectId, objective, repository, acceptance,
    revision: 1, generation: 0, status: 'open', currentAttemptId: null,
    acceptedResultId: null, selections: [], attempts: [], results: [], audit: []};
}

/** Selection records intent; it grants no execution or publication authority. */
export function selectWorker(work, {id: selectionId, workerId, actorId, expectedRevision}) {
  require(work.status === 'open' && work.revision === expectedRevision, 'stale or closed work');
  require([selectionId, workerId, actorId].every(id), 'selection identity required');
  require(!work.selections.some(s => s.id === selectionId), 'duplicate selection');
  const next = structuredClone(work);
  next.selections.push({id: selectionId, workId: work.id, workerId, actorId});
  next.revision++;
  next.audit.push({type: 'worker_selected', selectionId, actorId, revision: next.revision});
  return next;
}

/** Lease validity/clock decisions are supplied by the authoritative service, not a worker timestamp. */
export function startAttempt(work, {id: attemptId, selectionId, provider, expectedRevision, lease}) {
  require(work.status === 'open' && work.revision === expectedRevision, 'stale or closed work');
  require(!work.currentAttemptId, 'previous attempt must be reconciled before replacement');
  const selection = work.selections.find(s => s.id === selectionId);
  require(selection && id(attemptId) && id(provider), 'attempt context required');
  require(!work.attempts.some(a => a.id === attemptId), 'duplicate attempt');
  const generation = work.generation + 1;
  require(lease && id(lease.id) && lease.attemptId === attemptId &&
    lease.workerId === selection.workerId && lease.generation === generation,
    'lease must bind exact attempt, worker and generation');
  require(!work.attempts.some(a => a.lease.id === lease.id), 'lease identity cannot be reused');
  const next = structuredClone(work);
  next.generation = generation;
  next.currentAttemptId = attemptId;
  next.attempts.push({id: attemptId, workId: work.id, selectionId, workerId: selection.workerId,
    provider, generation, status: 'running', lease: structuredClone(lease)});
  next.revision++;
  next.audit.push({type: 'attempt_started', attemptId, generation, revision: next.revision});
  return next;
}

/** Called only after an authorized service reconciliation; timeout alone cannot prove a worker stopped. */
export function reconcileAttempt(work, {attemptId, expectedRevision, actorId, reason}) {
  require(work.revision === expectedRevision && work.currentAttemptId === attemptId, 'stale reconciliation');
  require(id(actorId) && id(reason), 'attributable reconciliation required');
  const next = structuredClone(work);
  next.attempts.find(a => a.id === attemptId).status = 'superseded';
  next.currentAttemptId = null;
  next.revision++;
  next.audit.push({type: 'attempt_reconciled', attemptId, actorId, reason, revision: next.revision});
  return next;
}

/** Authenticated identity and verified live lease are service inputs, never trusted request-body flags. */
export function recordResult(work, result, {authenticatedWorkerId, leaseIsCurrent}) {
  require(result && [result.id, result.attemptId, result.leaseId, result.summary].every(id), 'result identity required');
  require(['succeeded', 'failed', 'blocked'].includes(result.outcome), 'unknown result outcome');
  require(Array.isArray(result.artifacts) && result.artifacts.every(id), 'artifact references required');
  const normalized = {id: result.id, attemptId: result.attemptId, leaseId: result.leaseId,
    generation: result.generation, outcome: result.outcome, summary: result.summary, artifacts: [...result.artifacts]};
  const attempt = work.attempts.find(a => a.id === result.attemptId);
  require(attempt && attempt.workerId === authenticatedWorkerId, 'worker cannot submit for this attempt');
  const prior = work.results.find(r => r.id === result.id);
  if (prior) {
    require(JSON.stringify(prior.payload) === JSON.stringify(normalized), 'conflicting result replay');
    return structuredClone(work);
  }
  require(Number.isSafeInteger(result.generation) && result.generation > 0, 'invalid result generation');
  const accepted = work.status === 'open' && work.currentAttemptId === attempt.id &&
    attempt.status === 'running' && result.generation === work.generation &&
    result.generation === attempt.generation && result.leaseId === attempt.lease.id && leaseIsCurrent === true;
  const next = structuredClone(work);
  next.results.push({id: result.id, workId: work.id, payload: normalized, accepted,
    disposition: accepted ? 'accepted' : 'stale_or_unauthorized'});
  next.revision++;
  next.audit.push({type: 'result_recorded', resultId: result.id, attemptId: attempt.id, accepted, revision: next.revision});
  if (accepted) {
    next.attempts.find(a => a.id === attempt.id).status = result.outcome;
    next.currentAttemptId = null;
    if (result.outcome === 'succeeded') {
      next.status = 'completed';
      next.acceptedResultId = result.id;
    }
  }
  return next;
}
