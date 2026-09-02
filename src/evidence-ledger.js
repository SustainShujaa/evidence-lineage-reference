import { createHash, randomUUID } from "node:crypto";

export const AssertionState = Object.freeze({
  SUPPORTED: "SUPPORTED",
  DISPUTED: "DISPUTED",
  UNKNOWN: "UNKNOWN",
  RETRACTED: "RETRACTED"
});

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export class EvidenceLedger {
  #artifacts = new Map();
  #assertions = new Map();
  #retractions = new Map();

  registerArtifact({ artifactId = randomUUID(), label, bytes }) {
    if (!label || bytes === undefined) throw new Error("ARTIFACT_IDENTITY_INCOMPLETE");
    if (this.#artifacts.has(artifactId)) throw new Error("ARTIFACT_ALREADY_EXISTS");

    const artifact = { artifactId, label, digestAlgorithm: "SHA-256", digest: sha256(bytes) };
    this.#artifacts.set(artifactId, artifact);
    return artifact;
  }

  verifyArtifact({ artifactId, bytes }) {
    const artifact = this.#artifact(artifactId);
    return { artifactId, expectedDigest: artifact.digest, observedDigest: sha256(bytes), matches: artifact.digest === sha256(bytes) };
  }

  recordAssertion({ assertionId = randomUUID(), statement, state, citation }) {
    if (!Object.values(AssertionState).includes(state) || state === AssertionState.RETRACTED) {
      throw new Error("ASSERTION_STATE_INVALID");
    }
    if (!statement || !citation?.artifactId || !citation?.locator) throw new Error("STRUCTURED_CITATION_REQUIRED");
    this.#artifact(citation.artifactId);
    if (this.#assertions.has(assertionId)) throw new Error("ASSERTION_ALREADY_EXISTS");

    const assertion = { assertionId, statement, state, citation: { artifactId: citation.artifactId, locator: citation.locator } };
    this.#assertions.set(assertionId, assertion);
    return assertion;
  }

  retractAssertion({ assertionId, reason, retractedBy = "reviewer" }) {
    if (!reason) throw new Error("RETRACTION_REASON_REQUIRED");
    this.#assertion(assertionId);
    if (this.#retractions.has(assertionId)) throw new Error("ASSERTION_ALREADY_RETRACTED");

    const event = { eventId: randomUUID(), assertionId, reason, retractedBy };
    this.#retractions.set(assertionId, event);
    return event;
  }

  currentView(assertionId) {
    const assertion = this.#assertion(assertionId);
    const retraction = this.#retractions.get(assertionId) ?? null;
    return { ...assertion, currentState: retraction ? AssertionState.RETRACTED : assertion.state, retraction };
  }

  #artifact(artifactId) {
    const artifact = this.#artifacts.get(artifactId);
    if (!artifact) throw new Error("ARTIFACT_NOT_FOUND");
    return artifact;
  }

  #assertion(assertionId) {
    const assertion = this.#assertions.get(assertionId);
    if (!assertion) throw new Error("ASSERTION_NOT_FOUND");
    return assertion;
  }
}
