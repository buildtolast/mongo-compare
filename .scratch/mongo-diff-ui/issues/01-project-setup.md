# 01 — Project Setup and Foundation

**What to build:** Initialize the React TypeScript project with all necessary dependencies and tooling configuration to support a production-grade desktop/web application for MongoDB comparison.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Initialize Vite React TypeScript project with `npm create vite@latest mongo-diff-ui -- --template react-ts`
- [ ] Install core dependencies: `mongodb` (for Node.js backend), `@tanstack/react-query`, `zustand`, `framer-motion`
- [ ] Install dev dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `@types/react`, `@types/node`, `vitest`, `@testing-library/react`
- [ ] Configure Tailwind CSS with base styles from STYLE_PRESETS.md (viewport fitting, density limits, typography scaling)
- [ ] Set up TypeScript configuration with strict mode enabled
- [ ] Configure ESLint and Prettier for consistent code quality
- [ ] Set up basic directory structure following component architecture
- [ ] Create core TypeScript interfaces: `ConnectionConfig`, `CollectionSelector`, `ChangedField`, `DocumentDiff`, `ComparisonResult`
- [ ] Create basic UI component library: `Button.tsx`, `Input.tsx`, `Checkbox.tsx`, `Tabs.tsx`
- [ ] Write unit tests for core types and basic components (target: >80% coverage)
