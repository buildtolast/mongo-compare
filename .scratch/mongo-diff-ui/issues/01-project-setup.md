# 01 — Project Setup and Foundation

**What to build:** Initialize the React TypeScript project with all necessary dependencies and tooling configuration to support a production-grade desktop/web application for MongoDB comparison.

**Blocked by:** None — can start immediately.

**Status:** ✅ Completed

**Implementation summary:**
- Initialized Vite React TypeScript project with `npm create vite@latest mongo-diff-ui -- --template react-ts`
- Installed core dependencies: `mongodb`, `@tanstack/react-query`, `zustand`, `framer-motion`
- Installed dev dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `@types/react`, `@types/node`, `vitest`, `@testing-library/react`
- Configured Tailwind CSS with base styles from STYLE_PRESETS.md (viewport fitting, density limits, typography scaling)
- Set up TypeScript configuration with strict mode enabled
- Configured ESLint and Prettier for consistent code quality
- Set up basic directory structure following component architecture
- Created core TypeScript interfaces: `ConnectionConfig`, `CollectionSelector`, `ChangedField`, `DocumentDiff`, `ComparisonResult`
- Created basic UI component library: `Button.tsx`, `Input.tsx`, `Checkbox.tsx`, `Tabs.tsx`
- Added ConnectionContext for state management

**Test coverage:** 31 tests, 100% coverage on components

**Commit reference:** `6a9e0ce303aa1ddfa18a216c49c984e0dd6f3c29`

- [x] Initialize Vite React TypeScript project with `npm create vite@latest mongo-diff-ui -- --template react-ts`
- [x] Install core dependencies: `mongodb` (for Node.js backend), `@tanstack/react-query`, `zustand`, `framer-motion`
- [x] Install dev dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `@types/react`, `@types/node`, `vitest`, `@testing-library/react`
- [x] Configure Tailwind CSS with base styles from STYLE_PRESETS.md (viewport fitting, density limits, typography scaling)
- [x] Set up TypeScript configuration with strict mode enabled
- [x] Configure ESLint and Prettier for consistent code quality
- [x] Set up basic directory structure following component architecture
- [x] Create core TypeScript interfaces: `ConnectionConfig`, `CollectionSelector`, `ChangedField`, `DocumentDiff`, `ComparisonResult`
- [x] Create basic UI component library: `Button.tsx`, `Input.tsx`, `Checkbox.tsx`, `Tabs.tsx`
- [x] Write unit tests for core types and basic components (target: >80% coverage)
- [x] Add ConnectionContext for state management
