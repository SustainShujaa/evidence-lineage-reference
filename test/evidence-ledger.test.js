import test from "node:test";
import assert from "node:assert/strict";
import { AssertionState, EvidenceLedger } from "../src/evidence-ledger.js";

const makeLedger = () => {
  const ledger = new EvidenceLedger();
  ledger.registerArtifact({ artifactId: "source-1", label: "Synthetic source", bytes: "source bytes" });
  return ledger;
};

test("records a deterministic SHA-256 identity for source bytes", () => {
  const ledger = makeLedger();
  const result = ledger.verifyArtifact({ artifactId: "source-1", bytes: "source bytes" });
  assert.equal(result.matches, true);
  assert.match(result.expectedDigest, /^[a-f0-9]{64}$/);
});

test("detects when later bytes differ from the registered artifact", () => {
  const ledger = makeLedger();
  const result = ledger.verifyArtifact({ artifactId: "source-1", bytes: "changed source bytes" });
  assert.equal(result.matches, false);
});

test("requires a known artifact and a structured locator", () => {
  const ledger = makeLedger();
  assert.throws(() => ledger.recordAssertion({ statement: "Claim", state: AssertionState.UNKNOWN, citation: { artifactId: "source-1" } }), /STRUCTURED_CITATION_REQUIRED/);
  assert.throws(() => ledger.recordAssertion({ statement: "Claim", state: AssertionState.UNKNOWN, citation: { artifactId: "missing", locator: "Page 1" } }), /ARTIFACT_NOT_FOUND/);
});

test("preserves UNKNOWN rather than inferring a conclusion", () => {
  const ledger = makeLedger();
  const assertion = ledger.recordAssertion({ assertionId: "a-unknown", statement: "Outcome is not established.", state: AssertionState.UNKNOWN, citation: { artifactId: "source-1", locator: "Page 1" } });
  assert.equal(ledger.currentView(assertion.assertionId).currentState, AssertionState.UNKNOWN);
});

test("retraction changes the current view without deleting the original assertion", () => {
  const ledger = makeLedger();
  const assertion = ledger.recordAssertion({ assertionId: "a-retract", statement: "Delivery date is confirmed.", state: AssertionState.SUPPORTED, citation: { artifactId: "source-1", locator: "Page 2" } });
  ledger.retractAssertion({ assertionId: assertion.assertionId, reason: "Later review found the cited section was superseded." });
  const view = ledger.currentView(assertion.assertionId);
  assert.equal(view.currentState, AssertionState.RETRACTED);
  assert.equal(view.state, AssertionState.SUPPORTED);
  assert.equal(view.retraction.reason, "Later review found the cited section was superseded.");
});
