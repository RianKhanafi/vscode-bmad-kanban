## Why

The kanban board currently scans all `.md` files in the workspace, pulling in documentation, READMEs, and other markdown that should not appear as tickets or planning documents. For BMAD Method projects, only files inside specific artifact folders are meaningful as board items — everything else creates noise.

## What Changes

- Only `.md` files inside `implementation-artifacts/` are treated as **tickets** (stories, tasks, sprints)
- Only `.md` files inside `planning-artifacts/` are treated as **planning documents**
- `.md` files in `mockups/` or `_mockups/` folders are shown in a dedicated **Mockups board**
- The Mockups board tab is hidden entirely when no mockups folder exists in the workspace
- All other `.md` files outside these three folder types are excluded from the board entirely
- File watchers are scoped to match the same folder restrictions

## Capabilities

### New Capabilities

- `artifact-folder-scoping`: Restrict file discovery to `implementation-artifacts/`, `planning-artifacts/`, and `mockups/`|`_mockups/` folders, with the mockups board conditionally shown

### Modified Capabilities

<!-- No existing specs require requirement-level changes -->

## Impact

- `src/StoryParser.ts` — `collectMdFiles()` must filter by allowed folder roots
- `src/KanbanPanel.ts` — file watcher glob patterns must be scoped; mockups board tab rendered conditionally
- `src/BoardDataAggregator.ts` — source folder used to determine card type (ticket vs. document vs. mockup)
- Webview UI — new "Mockups" board tab, hidden when no mockups folder is detected
