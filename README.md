# fe-interview-prep

Frontend interview prep assignment: five React + TypeScript features, each shipped as its own pull request.

## Questions

| # | Question | PR link |
|---|---|---|
| 1 | Todo App | [PR #1](https://github.com/neeha-moideen/fe-interview-prep/pull/1) |
| 2 | Live Search | [PR #2](https://github.com/neeha-moideen/fe-interview-prep/pull/2) |
| 3 | Registration Wizard | [PR #3](https://github.com/neeha-moideen/fe-interview-prep/pull/3) |
| 4 | Data Table | [PR #4](https://github.com/neeha-moideen/fe-interview-prep/pull/4) |
| 5 | Login & Session Handling | |

**Video:**

## Run the app

Requires Node 20 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173. Each question has its own route: `/todo`, `/search`, `/register`, `/table` and `/session` (login, orders and admin stats).

## Run the checks

```bash
pnpm test --run
pnpm eslint
pnpm typecheck
pnpm build
```

## Stack

React 19, TypeScript (strict), Vite, Tailwind CSS, React Router, Vitest and Testing Library.

## Notes

- Q4 loads 600 users from randomuser.me with a fixed seed. The suggested dummyjson.com/users endpoint returns only 208 rows, which is below the 500 the question asks for.
- Q5 uses a mock backend that runs inside the Vite dev server (`pnpm dev` or `pnpm preview`), so its requests show up in the browser's Network tab. Sign in with `user` / `user123` or `admin` / `admin123`. The access token lasts 30 seconds and the refresh token 10 minutes.
- Q5 token storage: the access token lives in memory only, and the refresh token is an `HttpOnly`, `SameSite=Strict` cookie that JavaScript cannot read.
- To see the single refresh call, open the Network tab, sign in, click "Expire access token now" and then "Fire 3 requests at once" on the Orders page. Three requests fail with 401, one `POST /api/auth/refresh` follows, and the three requests succeed on retry.
