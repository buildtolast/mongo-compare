# Issue tracker

Issues are tracked locally as markdown files under `.scratch/<feature>/` in this repository.

This is a solo/small-team project without a formal issue tracking system. All planned work is documented as feature specs in the repo root (`FEATURE-SPEC-*.md`), and implementation tickets are tracked as local markdown files under `.scratch/`.

## Creating issues

1. Create a directory under `.scratch/<feature-name>/`
2. Add `issue.md` with:
   - Title
   - Description
   - Acceptance criteria
   - Priority
3. Add `spec.md` (optional) for detailed technical spec

## Reading issues

Skills that need to read issues look for:
- Feature specs in repo root: `FEATURE-SPEC-*.md`
- Local issues: `.scratch/<feature>/issue.md`

## Workflow

- **Needs triage**: New issue files in `.scratch/`
- **Ready for agent**: Issues with complete specs
- **Ready for human**: Issues requiring design decisions
- **Won't fix**: Issues marked as deprecated or superseded
