# PR review conventions

The method `/pr-review` follows. The reviewer decides whether the diff faithfully implements its
issue and conforms to the repo's conventions, then posts one review. If nothing blocks the merge, the
verdict is `PASS` and there are no findings. Never invent findings to have something to say.

## 0. Stop if the PR conflicts with its base

Read the PR's mergeable state first. If it is `CONFLICTING`, stop: post a `FAIL` with the single
conflict finding and end the run. `UNKNOWN` is treated as `MERGEABLE` after one re-read.

## 1. Check intent alignment

- **Issue versus diff:** does the change do what the issue asks, no more and no less? Scope creep and
  missing acceptance criteria are both findings.
- **PR description versus diff:** is the description accurate and is `Closes #N` present?
- **Commits:** short, meaningful, no secrets, no `--no-verify` traces.
- **Contracts:** if an interface changed, what must accompany it is a finding when missing.

## 2. Review the code

Hand the diff, the issue summary and the **Conventions Skills** to the **Reviewer Agents**. Every
changed source line is also held to `comment-conventions.md`. A finding is blocking when it is:

- a correctness bug, security hole, data loss or crash;
- a regression the issue did not ask for;
- a contract break without its accompanying change;
- a violation of a rule the conventions skill states as a gate;
- an acceptance criterion the diff does not meet.

Style preferences, alternative designs, "consider" and "nit" remarks are not findings and are never
posted.

## 3. Filter before you post

- Drop anything you cannot substantiate against the diff, the issue or a convention.
- Do not re-raise a point that is already an open thread, and do not reopen a resolved one.
- Drop a finding about a problem this diff did not introduce that is already tracked in an open issue.

## 4. Verdict

`FAIL` when any finding remains on the current head, otherwise `PASS`. Start the body with
`# Verdict: PASS` or `# Verdict: FAIL`, followed by a findings table of
`file:line | issue | fix` rows, most serious first.
