# Comment Conventions

Every rule below is a gate. One violation fails the change when writing it, when reviewing it, and
when auditing what already shipped.

- No comments. A source file contains code; any comment in it is a fail, whatever it says.
- Code that needs narration is poor implementation. The fix is always the code: a better name, a
  smaller unit, an explicit type. Never a sentence added beside it.
- The ban is categorical. Narration, summaries, region headings, documentation blocks, rationales,
  caveats and bylines all fail alike.
- No comment narrates history: why the code is shaped this way, what it was before, or what defect
  changed it. That record belongs to version control.
- No commented-out code. Deleted code lives in version history.
- No deferred-work markers. Unfinished work is a tracked issue, not a string in a source file.
- Comment syntax is permitted only where a tool reads it and no alternative exists, in its minimum
  form with no prose attached.
- Knowledge that is not the code, such as a cause, a constraint or a removal condition, goes in the
  commit message, the PR description, the issue or a test name.
