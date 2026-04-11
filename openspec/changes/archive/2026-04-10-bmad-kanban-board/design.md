## Context

BMAD Method projects use a file-based spec structure: epics and stories as `.md` files with YAML frontmatter, sprint execution state in `sprint-status.yml`. Today, developers have no visual interface inside VS Code to see workflow state at a glance or move stories between stages without editing YAML directly. This design defines the technical architecture for a VS Code WebView extension that renders a Kanban board from these files and writes status changes back to YAML exclusively.

The extension runtime: TypeScript in the VS Code extension host process, communicating with a React-based WebView panel via the VS Code `postMessage` API.

## Goals / Non-Goals

**Goals:**
- Render a Kanban board panel inside VS Code from BMAD file structure
- Source card data from story `.md` files (frontmatter + heading)
- Source and persist workflow state exclusively in `sprint-status.yml`
- Support drag-and-drop column reassignment
- Support clicking a card to open the source `.md` file in the editor
- Refresh the board in real time when `.md` or YAML files change on disk

**Non-Goals:**
- Writing to or restructuring `.md` story files (read-only from extension perspective)
- Integrating with external project management tools (Trello, Jira, Linear)
- Supporting non-BMAD file structures or arbitrary Kanban boards
- Online/cloud sync or multi-user collaboration
- Creating or deleting stories from inside the board UI

## Decisions

### Decision 1: WebView panel over TreeView or custom editor

**Choice**: VS Code WebView panel (`vscode.WebviewPanel`)

**Rationale**: A Kanban board requires a multi-column drag-and-drop layout that cannot be expressed in VS Code's native TreeView. WebView provides a full HTML/CSS/JS sandbox, allowing use of React and CSS Grid for the board layout. Custom editors were rejected because the board is a computed view, not a file editor.

**Alternatives considered**:
- `TreeView` with collapsible items: Cannot represent horizontal columns or drag-and-drop
- Custom editor on `sprint-status.yml`: Conflates state file editing with board UX

### Decision 2: React + CSS Modules for WebView UI

**Choice**: React (with `@vscode/webview-ui-toolkit` for VS Code theming)

**Rationale**: React's component model maps cleanly to Board → Column → Card hierarchy. The `@vscode/webview-ui-toolkit` library provides native VS Code theme tokens so the board respects the user's color theme. Drag-and-drop handled via the HTML5 Drag and Drop API (no heavy library needed for this scope).

**Alternatives considered**:
- Vanilla JS: More boilerplate for component state management
- Svelte: Smaller bundle but smaller ecosystem familiarity

### Decision 3: `gray-matter` for Markdown parsing

**Choice**: `gray-matter` for YAML frontmatter extraction from story `.md` files

**Rationale**: Lightweight, battle-tested, returns frontmatter as a plain object. Only the frontmatter and first H1 heading are needed — no full Markdown AST required.

**Alternatives considered**:
- `remark` + `remark-frontmatter`: More powerful but heavyweight for this read-only use case
- Manual regex parsing: Error-prone

### Decision 4: `js-yaml` for YAML state read/write

**Choice**: `js-yaml` for reading and writing `sprint-status.yml`

**Rationale**: Standard YAML library with predictable serialization. Writing back uses `dump()` with `lineWidth: -1` to avoid unwanted line wrapping in the persisted file.

### Decision 5: PostMessage API for WebView ↔ host communication

**Choice**: VS Code `postMessage` / `onDidReceiveMessage` as the sole communication bridge

**Rationale**: Required by VS Code's WebView security model. Messages are typed (discriminated union on `type` field). All file I/O happens on the extension host side; the WebView only sends user-intent messages (e.g., `{ type: 'moveCard', storyId, newStatus }`) and receives board state updates.

### Decision 6: Debounced file watcher refresh

**Choice**: Debounce file system change events with a 300 ms delay before re-reading files

**Rationale**: Editors often emit multiple rapid change events during a save. Debouncing prevents redundant board refreshes. The 300 ms window is imperceptible to users but eliminates flicker from burst events.

## Risks / Trade-offs

- **WebView bundle size** → Mitigation: Use esbuild for tree-shaken production bundles; React is the only significant dependency
- **Sprint YAML schema drift** (BMAD may evolve the `sprint-status.yml` format) → Mitigation: Isolate all YAML access behind a `SprintStateAdapter` class; update one place if schema changes
- **File watcher performance on large repos** → Mitigation: Scope watchers to a configurable workspace sub-path (default: workspace root); dispose watchers when the panel is closed
- **WebView security (CSP)** → Mitigation: Apply a strict Content Security Policy (`default-src 'none'; script-src 'nonce-...'; style-src 'nonce-...'`); no external network requests from WebView
- **Drag-and-drop accessibility** → Mitigation: Keyboard-navigable fallback (arrow key + Enter to reassign column) is deferred to a follow-up; noted as a known gap at launch

## Migration Plan

This is a greenfield VS Code extension with no existing installation base. Deployment steps:

1. Publish extension to VS Code Marketplace (or install locally via `.vsix`)
2. No data migration required — extension reads the existing BMAD file structure
3. Rollback: Simply uninstall the extension; no files are modified except `sprint-status.yml` status values (which agents can continue editing manually)

## Open Questions

- Should the board be scoped to the currently open workspace folder, or support multi-root workspaces with a folder picker?
- What is the canonical schema for `sprint-status.yml` (story IDs as keys, status as values, or an array of objects)? Needs confirmation from BMAD spec before implementing `SprintStateAdapter`.
- Should column names (todo / in-progress / review / done) be hardcoded or configurable via a `bmad-kanban.columns` VS Code setting?
