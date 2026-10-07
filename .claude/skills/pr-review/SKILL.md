---
name: pr-review
description: >-
  Reviews a pull request against its issue and the repo's conventions and posts one review with a
  PASS or FAIL verdict. Use for "/pr-review <N>", "review this PR", or a pasted PR URL.
---

# Review a PR

Follow `.claude/conventions/review-conventions.md`; this skill says where the inputs come from.

1. **Read the PR.** `gh pr view <N> --json title,body,mergeable,closingIssuesReferences,commits` and
   `gh pr diff <N>`. If `mergeable` is `CONFLICTING`, stop and post the conflict `FAIL`.
2. **Read the issue** from `closingIssuesReferences` for the acceptance criteria.
3. **Read prior discussion:** `gh pr view <N> --comments` and the review threads.
4. **Review the code.** Hand the diff, the issue summary and the `react-conventions` skill to the
   `senior-react-engineer` agent. It returns blocking findings only.
5. **Filter and decide** per the review conventions: `FAIL` if any finding remains, otherwise `PASS`.
6. **Post one review.** `gh pr review <N> --approve|--request-changes --body-file review.md`. On your
   own PR, post it as a comment with `gh pr comment <N> --body-file review.md` instead. Delete
   `review.md` afterwards.
