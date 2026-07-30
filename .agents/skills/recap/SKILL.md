# Recap Skill

**Purpose:** Execute comprehensive project quality assurance including code review, bug fixes, test validation, and cleanup before committing and pushing changes.

## When to Use

Use this skill when:
- Preparing to commit changes to a repository
- Running end-to-end verification before deployment
- Conducting regular quality assurance checks
- Reviewing work done in a session before finalizing

## Input

Any project context or conversation about recent work.

## Output

A structured recap document with:
1. Complete review of all work done
2. Bug fixes summary
3. Redundant/dead code cleanup list
4. Integration test results (3-5 runs)
5. Build verification status
6. GitHub issues to create/update
7. Commit message draft

## Process

### Step 1: Review All Work Done
- List all features implemented
- List all files created/modified
- Identify any incomplete work
- Note any technical debt

### Step 2: Bug Fixes Summary
- Document all bugs found
- List fixes applied
- Verify fixes with tests
- Add to RECAP.md

### Step 3: Code Cleanup
- Identify redundant code
- Remove unused components
- Delete deprecated files
- Clean up test artifacts

### Step 4: Integration Testing
Run tests 3-5 times:
```bash
./run-integration-tests.sh
./demo-e2e.sh
./verify-css.sh
```

If failures found:
- Go back to Step 1
- Document the failure
- Fix the issue
- Re-run tests

### Step 5: Build Verification
- Run `npm run build`
- Run `docker-compose build`
- Verify no build errors
- Verify all dependencies

### Step 6: Final Commit
- Create RECAP.md with all findings
- Run `git add -A`
- Run `git commit` with detailed message
- Run `git push`

## Example Output

```markdown
# Project Recap

## Work Done
- Feature A: ...
- Feature B: ...

## Bug Fixes
1. Bug X: Fixed by...
2. Bug Y: Fixed by...

## Cleanup
- Deleted: file1.ts
- Deleted: file2.ts

## Test Results
Run 1: 15/15 passed
Run 2: 15/15 passed
Run 3: 15/15 passed

## Status
✅ Ready for commit
```

## Commands

```bash
# Quick verification
./verify-css.sh

# Full integration test
./run-integration-tests.sh

# End-to-end test
./demo-e2e.sh

# Build verification
npm run build
docker-compose build

# Commit
git add .
git commit -m "chore: update recap and fix issues"
git push
```

## Notes

- Always run tests multiple times before committing
- Document ALL bug fixes found
- Delete redundant code before committing
- Update RECAP.md with each session
- Never commit without running verification