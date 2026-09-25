import test from 'node:test';
import assert from 'node:assert/strict';
import {createWork, selectWorker, startAttempt, reconcileAttempt, recordResult} from '../packages/fleet-domain/work.mjs';
const work = () => createWork({id:'work-1', projectId:'project-1', objective:'bounded change', repository:'logrusbox/example', acceptance:'tests pass'});
function start(w=work(), n=1) {
  w=selectWorker(w,{id:`selection-${n}`,workerId:`worker-${n}`,actorId:'operator',expectedRevision:w.revision});
  return startAttempt(w,{id:`attempt-${n}`,selectionId:`selection-${n}`,provider:'codex',expectedRevision:w.revision,
    lease:{id:`lease-${n}`,attemptId:`attempt-${n}`,workerId:`worker-${n}`,generation:n}});
}
const result = (n=1, outcome='succeeded') => ({id:`result-${n}`,attemptId:`attempt-${n}`,leaseId:`lease-${n}`,generation:n,outcome,summary:'done',artifacts:['git:commit-reference']});
const auth = (n=1) => ({authenticatedWorkerId:`worker-${n}`,leaseIsCurrent:true});
test('durable work survives failed execution and a successful retry',()=>{
 let w=start();w=recordResult(w,result(1,'failed'),auth());w=start(w,2);w=recordResult(w,result(2),auth(2));
 assert.equal(w.id,'work-1');assert.equal(w.attempts.length,2);assert.equal(w.results.length,2);
 assert.equal(w.acceptedResultId,'result-2');assert.equal(w.status,'completed');
 assert.equal(w.attempts[0].status,'failed');assert.equal(w.audit.length,6);
});
test('selection is not execution authority and concurrent starts conflict',()=>{
 const initial=work();const selected=selectWorker(initial,{id:'s',workerId:'w',actorId:'o',expectedRevision:1});
 assert.equal(selected.currentAttemptId,null);assert.equal(initial.revision,1);
 assert.throws(()=>startAttempt(selected,{id:'a',selectionId:'s',provider:'codex',expectedRevision:1,lease:{}}));
 assert.throws(()=>start(start(),2),/reconciled/);
});
test('late result is retained but cannot complete replacement attempt',()=>{
 let w=start();w=reconcileAttempt(w,{attemptId:'attempt-1',expectedRevision:w.revision,actorId:'operator',reason:'stopped worker confirmed'});
 w=start(w,2);w=recordResult(w,result(),auth());
 assert.equal(w.results[0].accepted,false);assert.equal(w.currentAttemptId,'attempt-2');
 w=recordResult(w,result(2),auth(2));assert.equal(w.acceptedResultId,'result-2');
});
test('exact retry is idempotent; conflicting retry is rejected even after completion',()=>{
 const r=result();const w=recordResult(start(),r,auth());
 assert.deepEqual(recordResult(w,r,{...auth(),leaseIsCurrent:false}),w);
 assert.throws(()=>recordResult(w,{...r,summary:'changed'},auth()),/conflicting/);
 assert.throws(()=>recordResult(w,r,auth(2)),/worker/);
});
test('wrong worker, expired lease, wrong generation and wrong lease cannot publish',()=>{
 assert.throws(()=>recordResult(start(),result(),auth(2)),/worker/);
 for(const [r,a] of [[result(),{...auth(),leaseIsCurrent:false}], [{...result(),generation:2},auth()], [{...result(),leaseId:'other'},auth()]]) {
  const w=recordResult(start(),r,a);assert.equal(w.status,'open');assert.equal(w.results[0].accepted,false);
 }
});
test('one accepted outcome per attempt and completed work cannot restart',()=>{
 const w=recordResult(start(),result(),auth());
 const late=recordResult(w,{...result(),id:'second',outcome:'failed'},auth());
 assert.equal(late.acceptedResultId,'result-1');assert.equal(late.results[1].accepted,false);
 assert.throws(()=>start(w,2),/closed/);
});
test('lease identity binds worker, attempt, generation and is not reusable',()=>{
 const selected=selectWorker(work(),{id:'s',workerId:'w',actorId:'o',expectedRevision:1});
 for(const lease of [{id:'l',workerId:'other',attemptId:'a',generation:1},{id:'l',workerId:'w',attemptId:'other',generation:1},{id:'l',workerId:'w',attemptId:'a',generation:0}])
  assert.throws(()=>startAttempt(selected,{id:'a',selectionId:'s',provider:'codex',expectedRevision:2,lease}),/lease/);
});
