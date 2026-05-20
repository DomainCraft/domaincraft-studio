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
- **Validation** -- inline error checking for field definitions, ranges, and relations
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
- Add roles (Admin, User, @Owner, *)
- Roles are shared across all entities
- Check CRUD permissions per role

### Features

Toggle entity features with badges:
- **Audit** -- createdAt, updatedAt tracking
- **Audit Log** -- createdBy, updatedBy tracking
- **Soft Delete** -- deletedAt field
- **Optimistic Lock** -- version field for concurrency

## Type System

TypeScript types are auto-generated from the core's JSON Schema:

```bash
# Regenerate types (requires DomainCraft core at ../DomainCraft)
npm run generate:types
```

The `domain.generated.ts` file is the single source of truth for the YAML structure. GUI-specific types like `ParsedField` live in `domain.ts`.

## Scripts

```bash
npm run dev              # Start dev server
npm run build            # Type-check + build for production
npm run lint             # Run ESLint
npm run generate:types   # Regenerate types from JSON Schema
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
| Validation | Zod |
| Auto-layout | Dagre |
| Icons | Lucide React |

## Project Structure

```
src/
├── components/
│   ├── canvas/          # React Flow graph (EntityNode, CrowFootEdge)
│   ├── editor/          # Monaco YAML editor
│   ├── explorer/        # Entity list, project settings, enum manager
│   ├── inspector/       # Field editor, entity inspector
│   ├── permissions/     # Permission matrix
│   ├── edges/           # Crow's foot edge component
│   └── layout/          # Toolbar, app layout
├── stores/
│   ├── domain-store.ts  # Domain schema state
│   ├── canvas-store.ts  # React Flow nodes/edges state
│   └── ui-store.ts      # UI state (panels, dark mode, view mode)
├── lib/
│   ├── yaml-parser.ts   # YAML <-> DomainSchema conversion
│   ├── validator.ts     # Zod-based schema validation
│   └── layout.ts        # Dagre auto-layout algorithm
└── types/
    ├── domain.ts        # Hand-written GUI types + re-exports
    └── domain.generated.ts  # Auto-generated from JSON Schema
```

## License

Part of the [DomainCraft](https://github.com/Gitlawb/domaincraft) project.
