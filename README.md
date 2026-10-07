# fe-interview-prep

Frontend interview prep assignment: five React + TypeScript features, each shipped as its own pull request.

## Questions

| # | Question | PR link |
|---|---|---|
| 1 | Todo App | |
| 2 | Live Search | |
| 3 | Registration Wizard | |
| 4 | Data Table | |
| 5 | Login & Session Handling | |

**Video:**

## Run the app

Requires Node 20 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173. Each question has its own route: `/todo`, `/search`, `/register`, `/table`, `/login`.

## Run the checks

```bash
pnpm test --run
pnpm eslint
pnpm typecheck
pnpm build
```

## Stack

React 19, TypeScript (strict), Vite, Tailwind CSS, React Router, Vitest and Testing Library.
