/* ============================================================
   react-lint hook test
   (node .claude/hooks/tests/react-lint.test.cjs)

   On a file edit the hook runs ESLint against matching src/**.{js,jsx}
   files and, if it complains, surfaces the output to the model (exit 2);
   otherwise it allows. Files that match no rule (non-src, non-js/jsx), or
   edits made when no local eslint binary is installed, must pass through.

   The lint-violation case requires a local eslint, so it is GUARDED: when
   node_modules/.bin/eslint is absent the case is skipped (logged) and the
   no-binary pass-through is asserted instead — so the suite stays green
   both locally (deps installed) and in the lightweight CI job (no install).
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');
const HOOK = path.join(__dirname, '..', 'react-lint.cjs');

let passed = 0,
  failed = 0,
  skipped = 0;
function ok(cond, msg) {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}
function skip(msg) {
  skipped++;
  console.log(`  SKIP: ${msg}`);
}

function eslintInstalled() {
  const dir = path.join(REPO, 'node_modules', '.bin');
  return ['eslint', 'eslint.cmd', 'eslint.CMD', 'eslint.ps1'].some((b) => fs.existsSync(path.join(dir, b)));
}

// 2 = surfaced (lint failed), 0 = allowed. Write/Edit pass an absolute
// file_path; run from REPO so the hook's src/ relative match resolves.
function edit(relPath, content) {
  const filePath = relPath ? path.join(REPO, relPath) : '';
  const payload = { tool_name: 'Edit', tool_input: { file_path: filePath, new_string: content || '' } };
  return spawnSync(process.execPath, [HOOK], { input: JSON.stringify(payload), encoding: 'utf8', cwd: REPO }).status;
}

function withFixture(relPath, content, fn) {
  const abs = path.join(REPO, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  try {
    fn();
  } finally {
    fs.rmSync(abs, { force: true });
  }
}

// Pass-through cases — deterministic on any machine (never reach eslint).
ok(edit('', '') === 0, 'no file path is allowed');
ok(edit('docs/notes.md', '# hi') === 0, 'unmatched extension (.md) is allowed');
ok(edit('README.md', '# project') === 0, 'root README is allowed');
ok(edit('vite.config.js', 'export default {}') === 0, 'non-src js file is allowed');

if (eslintInstalled()) {
  // A clean src file lints clean and is allowed.
  withFixture('src/_hook_lint_fixture_clean.jsx', 'export const sum = (a, b) => a + b;\n', () => {
    ok(edit('src/_hook_lint_fixture_clean.jsx', 'export const sum = (a, b) => a + b;\n') === 0, 'clean src file is allowed');
  });
  // An obvious no-unused-vars violation is surfaced (eslint runs at --max-warnings=0).
  withFixture('src/_hook_lint_fixture_bad.jsx', 'export const X = () => { const unused = 1; return null; };\n', () => {
    ok(
      edit('src/_hook_lint_fixture_bad.jsx', 'export const X = () => { const unused = 1; return null; };\n') === 2,
      'src file with unused var is surfaced (eslint)'
    );
  });
} else {
  // With no local eslint binary the hook must not block the edit.
  ok(edit('src/_fixture.jsx', 'export const X = () => null;') === 0, 'src file allowed when eslint not installed');
  skip('node_modules/.bin/eslint absent — eslint lint cases skipped');
}

console.log(`\nreact-lint: ${passed} passed, ${failed} failed, ${skipped} skipped`);
process.exit(failed === 0 ? 0 : 1);
