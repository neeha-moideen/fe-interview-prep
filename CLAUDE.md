# CLAUDE.md

Thin router for this repository. It loads every session; everything else loads on demand. Do not
pre-read the convention files "just in case".

## Routing (run these even if the user never typed the command)

| The user wants to... | Run |
|---|---|
| decide what to work on next ("what's next", "triage the backlog") | `/triage-issues` |
| start an issue (a pasted issue URL or number, "work on this", "pick up #N") | `/start-issue <N>` |
| create an issue ("file an issue", "raise a ticket", "log this bug") | `/create-issue` |
| open a PR ("raise the PR", "open the PR") | `/raise-pr` |
| review a PR ("review this PR", a pasted PR URL) | `/pr-review <N>` |
| act on a review ("fix the review comments on PR N") | `/fix-review-comments <N>` |

React work is held to the `react-conventions` skill; load it when a change touches `src/`.

## Guardrails (hooks)

`.claude/hooks/` block secrets on write, block commits and pushes on protected branches, block
`--no-verify` and hard force-pushes, and run eslint on edited files. They fire automatically. If one
blocks you, fix the cause; do not work around it.

## Where the rules live

| Topic | Source |
|---|---|
| React standards, gate commands, what review flags | `.claude/skills/react-conventions/SKILL.md` |
| Comments in source files | `.claude/conventions/comment-conventions.md` |
| Git, commit and branch hygiene | `.claude/conventions/git-hygiene.md` |
| Issues, PR titles and merge rules | `.claude/conventions/github-pr.md` |
| Review method and verdict shape | `.claude/conventions/review-conventions.md` |
| Reviewer agent | `.claude/agents/senior-react-engineer.md` |
| PR body | `.github/PULL_REQUEST_TEMPLATE.md` |

Each rule lives in one place; everything else points there.

## Project structure

Five questions, one page and route each: Q1 Todo, Q2 Live Search, Q3 Registration Wizard, Q4 Data Table, Q5 Login & Session Handling.

```
src/
  main.tsx          entry point
  App.tsx           shell with navigation and routes
  setupTests.ts     test setup
  index.css         Tailwind import
  pages/            one page per question
  routes/           route list
  components/       reusable UI, one folder per component with its test beside it
  hooks/            custom hooks, named use*
  lib/              shared helpers, such as the storage logic reused across questions
  features/         feature code that outgrows a page: its API, state, components and tests
```

- Import from `src/` through the `@/` alias; a relative path never climbs more than one level.
- A new route is registered in `src/routes/` and `src/App.tsx`.
- Add a folder only when a question needs it.

## Project-specific

The only register of this repo's values. Every convention file and skill reads them here.

- **Repo**: neeha-moideen/fe-interview-prep
- **Stack**: Vite + React + TypeScript (strict); Tailwind CSS; Vitest with Testing Library
- **Package Manager**: pnpm
- **Default Branch**: `main`
- **Protected Branches**: `main`
- **Branch Name**: one per question: `feature/q1-todo`, `feature/q2-search`, `feature/q3-form-wizard`, `feature/q4-data-table`, `feature/q5-auth-flow`, each cut from the latest `main`
- **PR Title**: `Q<N>: <short imperative description>`, 10-100 characters
- **PR Title Regex**: `^Q[1-5]: .{5,95}$`
- **PR Template**: `.github/PULL_REQUEST_TEMPLATE.md`
- **Gate Commands**: `pnpm typecheck`, `pnpm eslint`, `pnpm test --run`, `pnpm build`
- **Project Board**: NULL
- **Assign On Start**: no
- **Milestones**: no
- **Label Routing**: NULL, single area
- **Merge Method**: merge commit; after each merge, `git switch main && git pull --ff-only` before the next branch
- **Review**: read your own diff before merging; every PR carries screenshots or a GIF
- **Conventions Skills**: `react-conventions`
- **Reviewer Agents**: `senior-react-engineer`
