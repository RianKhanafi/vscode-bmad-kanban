## Why

BMAD Method uses file-based spec artifacts (epics, stories, sprint YAML) for spec-driven development, but there is no visual interface to navigate or manage workflow state inside VS Code. Developers resort to external tools like Trello or Jira, breaking the agent-native, file-first workflow. This change introduces a developer-native Kanban board directly in VS Code that reads from the BMAD file structure and writes status back to YAML — keeping the spec as the source of truth.

## What Changes

- Adds a new VS Code extension (TypeScript) that activates a Kanban board WebView panel
- Renders story `.md` files as draggable cards organized into workflow columns (todo, in-progress, review, done)
- Reads workflow state from `sprint-status.yml`; **never writes to or duplicates `.md` files**
- Supports drag-and-drop to reassign a story's column, persisting changes to `sprint-status.yml`
- Supports clicking a card to open the corresponding story `.md` file in the VS Code editor
- Watches `.md` and `sprint-status.yml` files for changes and refreshes the board in real time

## Capabilities

### New Capabilities
- `kanban-board-webview`: Core WebView panel that renders the Kanban board UI with configurable workflow columns inside VS Code
- `story-card-rendering`: Parses story `.md` files and `sprint-status.yml` to produce card data (title, status, metadata) displayed in the board
- `drag-drop-status-update`: Handles drag-and-drop interactions that update a story's workflow state and persist the change exclusively to `sprint-status.yml`
- `file-system-sync`: File system watchers that detect changes to `.md` and YAML files and push real-time updates to the board UI
- `story-file-navigation`: Card click handler that opens the source story `.md` file in the VS Code editor

### Modified Capabilities
<!-- No existing capabilities are being modified — this is a greenfield extension -->

## Impact

- **New package**: `vscode-bmad-kanban` VS Code extension (TypeScript + React WebView)
- **Dependencies**: `vscode` API, `js-yaml` or `yaml` for YAML parsing, `react` + `react-dom` for WebView UI, `remark` or `gray-matter` for Markdown frontmatter parsing, VS Code `FileSystemWatcher` API
- **File system writes**: Scoped exclusively to `sprint-status.yml`; no mutation of `.md` files
- **Compatibility**: Designed to be agent-compatible (DEV, PM, QA agents can all read/write the same YAML and Markdown files without conflict)
- **No external service dependencies**: Fully offline, no Trello/Jira API calls
