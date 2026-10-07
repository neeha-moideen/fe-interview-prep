# GitHub and PR conventions

Read on demand by `/raise-pr` and `/pr-review`. Values come from `CLAUDE.md` under
`## Project-specific`.

## Issues are the plan of record

- Every PR implements an issue and says `Closes #N` in its body. Work without an issue gets one first.
- Issues are plain-English user stories with acceptance criteria. They name outcomes, not files or
  line numbers.
- Read the repo's labels with `gh label list` rather than assuming a vocabulary.

## One closing keyword per issue

`Closes #46, #48` closes only #46. Write `Closes #46, closes #48`, then verify with
`gh pr view <N> --json closingIssuesReferences`.

## The PR

- The base branch is the default branch.
- The title follows **PR Title**; check it against **PR Title Regex** before creating.
- Fill every section of the PR template. Tick a checklist item only when it is true.

```bash
git push -u origin HEAD
gh pr create --base main --title "<per PR Title>" --body-file pr-body.md
```

## Review and merge

- `/pr-review` posts one review. `PASS` approves; `FAIL` requests changes; on the author's own PR both
  post as a comment.
- Merge only when checks are green and the latest review is `PASS`, using **Merge Method**.
