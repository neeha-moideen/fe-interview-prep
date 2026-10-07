---
name: react-conventions
description: >-
  Engineering standard for the React code in this repo: the bar code is held to, what a review flags
  as blocking, and the gate commands that must pass. Load on demand for work or diffs touching React
  code; never pre-read.
---

# React conventions

A standard, not a description. Apply it to the lines a change adds or modifies; pre-existing
violations in untouched code are backlog, not blockers. Surrounding code is never precedent.

`.claude/conventions/comment-conventions.md` applies to every source file: a comment fails the change.

**Package Manager** and **Gate Commands** are registered in `CLAUDE.md` under `## Project-specific`.

## Scope

`src/`

## Architecture

- Import from `src/` through the `@/` alias; a relative path never climbs more than one level.
- A reusable component lives in its own folder under `src/components/`, with its test beside it.
- A custom hook lives in `src/hooks/` and is named `use*`.
- Shared helpers, formatters and validators live in `src/lib/` rather than being copied.
- A route is registered in `src/routes/`, behind a guard when it needs a signed-in user.
- Styling is Tailwind utilities; no inline styles. Variants come from `class-variance-authority` and
  classes are merged with `cn()`. Shared colours and fonts are tokens in the `@theme` block of
  `src/index.css`.
- A large page is split with `React.lazy()` and `Suspense`.

## State, data and API

- Server state goes through a data layer such as RTK Query, not `useState` with `useEffect`.
- A component never calls the API itself, and no URL is hardcoded at a call site.
- A query declares what it provides and a mutation what it invalidates, so data is fresh after a change.
- Redux state is mutated only inside a `createSlice` reducer.
- A form uses React Hook Form with a Zod resolver, not one piece of state per field.
- A component renders the loading, empty and error states of its query.
- An effect declares every dependency it reads and cleans up subscriptions, timers and in-flight work.
- A collection that can grow is fetched with pagination.

## Testing

- Every new or changed component has a test beside it that exercises behaviour.
- Drive the UI the way a person would, with `userEvent` rather than `fireEvent`.
- Assert what the user can observe, not implementation details.

## Blocking in review

- User-supplied data rendered as raw HTML without sanitisation.
- A secret, key or credential in source, or a token or personal data written to the console.
- A route that needs a session but can be reached without one, or a new route missing from the router.
- A call that bypasses the data layer, or an endpoint URL hardcoded in a component.
- Server state held in component state where it can drift from the server.
- Redux state mutated outside a `createSlice` reducer.
- An effect with a missing dependency or no cleanup.
- A comment in a changed source file.

## Definition of done

- The gate commands pass.
- Server state goes through the data layer with correct invalidation.
- New routes are registered and guarded.
- Every new or changed component has a behaviour test.
