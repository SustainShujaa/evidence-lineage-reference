import { AssertionState, EvidenceLedger } from "./evidence-ledger.js";

const ledger = new EvidenceLedger();
const sourceBytes = "Synthetic weekly program brief. Section 2: A delivery risk remains unresolved.";
const artifact = ledger.registerArtifact({ artifactId: "brief-001", label: "Synthetic program brief", bytes: sourceBytes });
const assertion = ledger.recordAssertion({
  assertionId: "assertion-001",
  statement: "A delivery risk remains unresolved.",
  state: AssertionState.SUPPORTED,
  citation: { artifactId: artifact.artifactId, locator: "Section 2" }
});

console.log(JSON.stringify({ artifact, verification: ledger.verifyArtifact({ artifactId: artifact.artifactId, bytes: sourceBytes }), assertion: ledger.currentView(assertion.assertionId) }, null, 2));
