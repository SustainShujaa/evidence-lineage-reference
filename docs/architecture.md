# Architecture notes

## Objects

| Object | Purpose | Does not establish |
| --- | --- | --- |
| Artifact | A named body of source bytes with a SHA-256 digest | Authorship or custody |
| Citation | A bounded locator into an artifact | Truth of the locator or assertion |
| Assertion | A claim, its state, and its citation | A final decision outside the stated evidence |
| Retraction event | A preserved correction to an assertion | Erasure of the historical record |

## Sequence

1. Register synthetic source bytes as an artifact.
2. Record its SHA-256 digest and stable artifact ID.
3. Create a structured citation with a page, section, or other locator.
4. Create an assertion with an explicit state: `SUPPORTED`, `DISPUTED`, or `UNKNOWN`.
5. Verify later bytes against the recorded digest whenever they are available.
6. If an assertion must be withdrawn, append a retraction event and report the current state as `RETRACTED`.

## Scope

This repository is an educational reference, not a forensic finding engine, records-management system, or source-evaluation methodology. It intentionally demonstrates the data boundaries without claiming that hashes or citations answer questions they cannot answer.
