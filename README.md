# DomainCraft Studio

**Visual editor for designing domain models. Create `domain.yaml` files with a drag-and-drop canvas, real-time YAML editing, and instant validation.**

## Quick Start

### Use Online

Open **[DomainCraft Studio](https://domaincraft.github.io/domaincraft-studio/)** in your browser -- no installation required.

### Run Locally

```bash
git clone https://github.com/DomainCraft/domaincraft-studio.git
cd domaincraft-studio
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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, project structure, WASM integration, and how types are generated from the core.

## License

Part of the [DomainCraft](https://github.com/DomainCraft/DomainCraft) project.
