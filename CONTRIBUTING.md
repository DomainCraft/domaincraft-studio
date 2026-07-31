# Contributing to DomainCraft Studio

This guide is for developers working on the Studio codebase. For usage, see the [README](README.md).

## Development Setup

```bash
npm install
npm run dev        # Start dev server on http://localhost:5173
```

Note: `generate:types` requires the core repo (`DomainCraft/`) checked out as a sibling directory (`../DomainCraft`). The script skips gracefully when it is absent.

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Type-check + build for production (uses committed generated types)
npm run lint             # Run ESLint
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run generate:types   # Regenerate types + constants from the core repo
npm run preview          # Preview production build
```

## Type System

TypeScript types and GUI constants are auto-generated from the core:

```bash
npm run generate:types
```

- `domain.generated.ts` -- auto-generated from `DomainCraft/spec/domain.schema.json`
- `constants.ts` -- auto-generated from `DomainCraft/internal/specmeta/specmeta.go`
- `domain.ts` -- GUI-specific types (e.g. `ParsedField`), re-exports generated types

**Do not edit `domain.generated.ts` or `constants.ts` manually.** Changes will be overwritten.

Generated files are committed to the repository, so the CI build does not need the core repo. Regenerate them only when the core schema or specmeta changes.

## Project Structure

```
├── index.html                # Vite entry HTML
├── main.tsx                  # React app entry point
├── vite.config.ts            # Vite configuration
├── vitest.config.ts          # Vitest test configuration
├── tsconfig.json             # Base TS config
├── tsconfig.app.json         # TS config for app source
├── tsconfig.node.json        # TS config for Vite/node tooling
├── eslint.config.js          # ESLint flat config
├── public/
│   └── wasm/                 # WASM validator binary (validate.wasm + wasm_exec.js)
├── src/
│   ├── components/
│   │   ├── canvas/          # React Flow graph (EntityNode, CrowFootEdge)
│   │   ├── editor/          # Monaco YAML editor
│   │   ├── explorer/        # Entity list, project settings, enum manager, index editor
│   │   │   ├── AuthSettings.tsx    # Auth configuration sub-component
│   │   │   ├── CacheSettings.tsx   # Cache configuration sub-component
│   │   │   ├── CorsSettings.tsx    # CORS configuration sub-component
│   │   │   ├── DeploySettings.tsx  # Deploy configuration sub-component
│   │   │   └── ProjectSettings.tsx # Main project settings (wraps auth/cache/cors/deploy)
│   │   ├── inspector/       # Field editor, entity inspector, numeric bound editor
│   │   ├── permissions/     # Permission matrix
│   │   ├── seed/            # Seed data editor
│   │   ├── edges/           # Crow's foot edge component
│   │   ├── ui/              # Shared UI components (Input, Select, AddItem, EmptyState, TagInput, TabBar, SelectableListItem)
│   │   └── layout/          # Toolbar, app layout, validation errors
│   ├── hooks/
│   │   ├── useDebouncedCallback.ts  # Shared debounce utility hook
│   │   ├── useFieldEditor.ts        # Field editor state + debounce logic (200ms)
│   │   └── useValidationErrors.ts   # WASM validation orchestration (500ms debounce)
│   ├── stores/
│   │   ├── domain-store.ts      # Domain schema state + fieldOrder + schemaVersion + getAllRoles
│   │   ├── domain-mutations.ts  # Schema mutation helpers with debounced YAML serialization (200ms)
│   │   ├── canvas-store.ts      # React Flow nodes/edges state
│   │   └── ui-store.ts          # UI state (panels, dark mode, view mode)
│   ├── lib/
│   │   ├── yaml-parser.ts           # YAML <-> DomainSchema conversion (WASM + fallback)
│   │   ├── yaml-parser-fallback.ts  # Client-side fallback parser (testable)
│   │   ├── wasm-loader.ts           # WASM binary loader + onWasmReady callback
│   │   ├── wasm-client.ts           # WASM API calls (goValidate, goParseField, goParseDomain)
│   │   ├── validator.ts             # WASM-based validation wrapper
│   │   ├── canvas-helpers.ts        # Entity-to-node/edge transformation (pure functions)
│   │   ├── constants.ts             # Auto-generated from core specmeta
│   │   ├── features.ts              # Feature config (label, color) — no React imports
│   │   ├── feature-icons.tsx        # Feature icons (lucide-react) — React component imports
│   │   ├── file-io.ts               # Import/export YAML file utilities
│   │   ├── utils.ts                 # Shared utilities (parseCommaSeparated, toCommaSeparated)
│   │   └── layout.ts                # Dagre auto-layout algorithm
│   ├── test/
│   │   ├── setup.ts                          # Test setup
│   │   ├── serialize-field-definition.test.ts # Round-trip serialize/parse tests
│   │   └── wasm-fallback-parity.test.ts      # WASM/fallback parity tests (including on_delete)
│   ├── types/
│   │   ├── domain.ts            # GUI-specific types (ParsedField) + re-exports
│   │   └── domain.generated.ts  # Auto-generated from JSON Schema
│   └── lib/
│       └── sample-data.ts       # Sample domain.yaml (lazy-loaded on demand)
```

## WASM Integration

The GUI uses Go WASM for **both parsing and validation**:

- **Parsing**: `wasmParseField()` and `wasmParseDomain()` delegate to Go core's Lexer and Parser
- **Validation**: `wasmValidate()` delegates to Go core's Validator
- **Fallback**: TypeScript implementations run when WASM is unavailable

The WASM binary is loaded from `/wasm/validate.wasm`. The core version is baked into the binary via `-X main.version` (from the nearest git tag) and exposed as `goVersion()`, displayed in the toolbar.

### WASM/fallback parity

The GUI must behave identically whether WASM is available or not. `src/test/wasm-fallback-parity.test.ts` asserts that the WASM contract (`WasmParsedField`) and the TypeScript fallback parser produce the same `ParsedField` results across field definitions, flags, `on_delete`, and defaults. Keep both paths in sync when changing either.

### Rebuilding WASM

After changes to core parsing/validation logic:

```bash
cd ../DomainCraft
make build-wasm-gui
```
