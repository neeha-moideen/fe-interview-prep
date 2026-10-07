---
name: raise-pr
description: >-
  Opens a pull request the way this repo requires. Verifies the branch, runs the gate commands,
  enforces clean commits, writes a body that closes the issue, and creates the PR with the required
  title. Use when work is done, e.g. "/raise-pr", "open the PR for this", "raise the PR".
---

# Raise a PR

Land the change as a PR that passes review on the first try. `.claude/conventions/git-hygiene.md` and
`.claude/conventions/github-pr.md` carry the full rules; this is the checklist that applies them.
The repo's values are in `CLAUDE.md` under `## Project-specific`.

Precondition: `gh` is installed and authenticated (`gh auth status`).

## Pre-flight (block on any failure)

1. **Branch.** `git rev-parse --abbrev-ref HEAD` must not be a protected branch. If it is, create a
   branch and move the commits first.
2. **Issue linkage.** Identify the issue this implements; the PR must say `Closes #N`.
3. **Gate Commands.** Run every command under **Gate Commands**; each must exit 0. Fix failures
   rather than skipping them.
4. **Commit hygiene.** Atomic commits, short imperative messages, no secrets, no `--no-verify`,
   `git status` clean, branch up to date with its base.

## Write the body

Read `.github/PULL_REQUEST_TEMPLATE.md` and fill every section into `pr-body.md`. One closing keyword
per issue. Plain English; no pasted diffs.

## Open it

```bash
git push -u origin HEAD
gh pr create --base main --title "<title per PR Title>" --body-file pr-body.md
```

Check the title against **PR Title Regex** first. Delete `pr-body.md` afterwards.

## Definition of done

The PR exists against `main`, its title matches **PR Title**, its body says `Closes #N`, and every
gate command passed. Post the PR URL.
