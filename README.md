# DomainCraft Studio

**Visual editor for designing domain models. Create `domain.yaml` files with a drag-and-drop canvas, real-time YAML editing, and instant validation.**

## Quick Start

### Use Online

Open **[DomainCraft Studio](https://domaincraft.github.io/domaincraft-studio/)** in your browser -- no installation required.

### Run Locally

```bash
git clone https://github.com/DomainCraft/DomainCraftGui.git
cd DomainCraftGui
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Features

- **Visual Canvas** -- drag-and-drop entity diagrams with crow's foot relation notation
- **Code Editor** -- Monaco-based YAML editor with syntax highlighting
- **Split View** -- graph and code side-by-side with real-time two-way sync
- **Entity Inspector** -- edit fields, validations, features, and permissions per entity
- **Permission Matrix** -- configure RBAC roles across all entities with a shared role registry
- **Enum Manager** -- define and manage enum types
- **Auto-layout** -- one-click graph arrangement via dagre algorithm
- **Validation** -- WASM-based schema validation (Go core) with client-side fallback
- **Import/Export** -- load and download `domain.yaml` files
- **Dark Mode** -- full dark theme support

## Usage

1. **Graph Mode** -- drag to pan, scroll to zoom. Click entities to inspect.
2. **Code Mode** -- edit YAML directly. Changes sync to canvas after 500ms debounce.
3. **Split Mode** -- both views visible. Edit in either pane.

### Creating Entities

- Click **+** in the Explorer panel
- Or add in YAML code editor

### Adding Fields

- Select an entity, go to **Fields** tab in Inspector
- Click **+** to add a new field
- Configure type, validations, and relation targets

### Permissions

- Select an entity, go to **Permissions** tab
- Add roles (derived from `auth.roles` in schema, plus `*` and `@Owner`)
- Roles are shared across all entities
- Check CRUD permissions per role

### Features

Toggle entity features with badges (derived from core specmeta):
- **Audit** -- createdAt, updatedAt tracking
- **Audit Log** -- createdBy, updatedBy tracking
- **Soft Delete** -- deletedAt field
- **Optimistic Lock** -- version field for concurrency

## Type System

TypeScript types and GUI constants are auto-generated from the core:

```bash
# Regenerate types from JSON Schema + constants from specmeta.go
npm run generate:types
```

- `domain.generated.ts` -- auto-generated from `DomainCraft/spec/domain.schema.json`
- `constants.ts` -- auto-generated from `DomainCraft/internal/specmeta/specmeta.go`
- `domain.ts` -- GUI-specific types (e.g. `ParsedField`), re-exports generated types

**Do not edit `domain.generated.ts` or `constants.ts` manually.** Changes will be overwritten.

Note: `npm run build` automatically runs `generate:types` via the `prebuild` script.

## Scripts

```bash
npm run dev              # Start dev server
npm run build            # Type-check + build for production (auto-generates types)
npm run lint             # Run ESLint
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run generate:types   # Regenerate types + constants from core
npm run preview          # Preview production build
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite + TypeScript |
| Canvas | React Flow (@xyflow/react) |
| Code Editor | Monaco Editor |
| State | Zustand |
| YAML | yaml (npm) |
| Styling | Tailwind CSS v4 |
| Validation | WASM (Go core) + client-side fallback |
| Parsing | WASM (Go core) + client-side fallback |
| Auto-layout | Dagre |
| Testing | Vitest |
| Icons | Lucide React |

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
├── components/
│   ├── canvas/          # React Flow graph (EntityNode, CrowFootEdge)
│   ├── editor/          # Monaco YAML editor
│   ├── explorer/        # Entity list, project settings, enum manager, index editor
│   │   ├── AuthSettings.tsx    # Auth configuration sub-component
│   │   ├── CacheSettings.tsx   # Cache configuration sub-component
│   │   ├── CorsSettings.tsx    # CORS configuration sub-component
│   │   ├── DeploySettings.tsx  # Deploy configuration sub-component
│   │   └── ProjectSettings.tsx # Main project settings (wraps auth/cache/cors/deploy)
│   ├── inspector/       # Field editor, entity inspector, numeric bound editor
│   ├── permissions/     # Permission matrix
│   ├── seed/            # Seed data editor
│   ├── edges/           # Crow's foot edge component
│   ├── ui/              # Shared UI components (Input, Select, AddItem, EmptyState, TagInput, TabBar, SelectableListItem)
│   └── layout/          # Toolbar, app layout, validation errors
├── hooks/
│   ├── useDebouncedCallback.ts  # Shared debounce utility hook
│   ├── useFieldEditor.ts        # Field editor state + debounce logic (200ms)
│   └── useValidationErrors.ts   # WASM validation orchestration (500ms debounce)
├── stores/
│   ├── domain-store.ts      # Domain schema state + fieldOrder + schemaVersion + getAllRoles
│   ├── domain-mutations.ts  # Schema mutation helpers with debounced YAML serialization (200ms)
│   ├── canvas-store.ts      # React Flow nodes/edges state
│   └── ui-store.ts          # UI state (panels, dark mode, view mode)
├── lib/
│   ├── yaml-parser.ts           # YAML <-> DomainSchema conversion (WASM + fallback)
│   ├── yaml-parser-fallback.ts  # Client-side fallback parser (testable)
│   ├── wasm-loader.ts           # WASM binary loader + onWasmReady callback
│   ├── wasm-client.ts           # WASM API calls (goValidate, goParseField, goParseDomain)
│   ├── validator.ts             # WASM-based validation wrapper
│   ├── canvas-helpers.ts        # Entity-to-node/edge transformation (pure functions)
│   ├── constants.ts             # Auto-generated from core specmeta
│   ├── features.ts              # Feature config (label, color) — no React imports
│   ├── feature-icons.tsx        # Feature icons (lucide-react) — React component imports
│   ├── file-io.ts               # Import/export YAML file utilities
│   ├── utils.ts                 # Shared utilities (parseCommaSeparated, toCommaSeparated)
│   └── layout.ts                # Dagre auto-layout algorithm
├── test/
│   ├── setup.ts                          # Test setup
│   ├── serialize-field-definition.test.ts # Round-trip serialize/parse tests
│   └── wasm-fallback-parity.test.ts      # WASM/fallback parity tests (including on_delete)
├── types/
│   ├── domain.ts            # GUI-specific types (ParsedField) + re-exports
│   └── domain.generated.ts  # Auto-generated from JSON Schema
└── lib/
    └── sample-data.ts       # Sample domain.yaml (lazy-loaded on demand)
```

## WASM Integration

The GUI uses Go WASM for **both parsing and validation**:

- **Parsing**: `wasmParseField()` and `wasmParseDomain()` delegate to Go core's Lexer and Parser
- **Validation**: `wasmValidate()` delegates to Go core's Validator
- **Fallback**: TypeScript implementations run when WASM is unavailable

The WASM binary is loaded from `/wasm/validate.wasm.gz` (with fallback to `/wasm/validate.wasm`).

### Rebuilding WASM

After changes to core parsing/validation logic:

```bash
cd ../DomainCraft
make build-wasm-gui
```

## License

Part of the [DomainCraft](https://github.com/Gitlawb/domaincraft) project.
