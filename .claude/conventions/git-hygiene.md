# Git hygiene

Read on demand by `/raise-pr` and `/pr-review`. It governs every change from the first commit on a
branch. Branch names and protected branches are registered in `CLAUDE.md` under `## Project-specific`.

## Branches

- Protected branches stay releasable. Never commit directly to one; a hook blocks it.
- One branch per piece of work, cut from an up-to-date default branch, named per **Branch Name**.
  Keep branches short-lived.

```bash
git switch main && git pull --ff-only
git switch -c <branch per Branch Name>
```

## Commits

- Short, meaningful, imperative subject lines, no trailing period, no emoticons.
- Atomic commits: each is one coherent step that builds and passes on its own, so a reviewer can read
  the diff commit by commit and any single commit can be reverted.
- Stage selectively with `git add -p` or named files, never a blanket `git add -A`.
- Squash only true fixup noise before opening the PR.
- Never `--no-verify` and never skip hooks.
- Never commit secrets, credentials or `.env` values. Use `.env.example` with placeholders.
- Do not rewrite shared history. Prefer a new commit over amending a pushed branch. If a pushed
  branch must be updated, use `--force-with-lease`, never `--force`, and never on a protected branch.

## Keeping a branch in sync

Merge the base into your branch; do not rebase a pushed branch.

```bash
git switch main && git pull --ff-only
git switch <your branch>
git merge main
```

## Before you push

- `git status` is clean, with no stray debug files, large binaries or build output.
- The **Gate Commands** pass.
- The branch is up to date with its base.

```bash
git push -u origin HEAD
```
