## Agent skills

### Issue tracker

Issues tracked locally as markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Standard triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Demo scripts

Quick-start scripts for common workflows:

- `demo.sh` - Build and launch the MongoDB Compare demo application
- `demo.html` - Interactive HTML demo with embedded walkthrough
- `run-integration-tests.sh` - Run comprehensive integration tests
- `demo-e2e.sh` - End-to-end test with CSS verification
- `start-app.sh` - Start the application with verbose mode support
- `verify-css.sh` - Verify CSS build includes Tailwind classes
- `check-css.sh` - Quick CSS verification script

See `demo/` directory for more information.

### Domain docs

Single-context project with `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### QA & Verification

- **Recap Skill** (`/Users/chiya/.agents/skills/recap/SKILL.md`) - Execute comprehensive project quality assurance including code review, bug fixes, test validation, and cleanup before committing and pushing changes. Run 3-5 integration tests and verify CSS/build before final commit.
