## Context

The BMAD Kanban extension currently discovers all `.md` files workspace-wide (excluding `node_modules/` and dotfiles). In a typical BMAD Method project the folder structure is:

```
project/
  implementation-artifacts/   ← tickets, stories, sprints, tasks
  planning-artifacts/         ← PRDs, architecture docs, meeting notes
  mockups/ OR _mockups/       ← UI mockups / wireframes
  (everything else — README, config docs, etc. — should be ignored)
```

File discovery lives in `src/StoryParser.ts → collectMdFiles()`. The card type (ticket vs. document) is currently inferred from whether a file has a numeric prefix or `status:` frontmatter, not from folder location. Board tabs are fixed: Kanban, Sprint, Swimlane.

## Goals / Non-Goals

**Goals:**
- Restrict file ingestion to the three BMAD artifact folder types
- Derive card type from source folder, not heuristics
- Add a conditionally-visible Mockups board tab
- Keep the file watcher scoped to the same paths to avoid unnecessary refreshes

**Non-Goals:**
- Configurable folder names via VS Code settings (could be a follow-up)
- Nested artifact folders (only top-level `implementation-artifacts/`, `planning-artifacts/`, `mockups/`|`_mockups/` are checked)
- Changing the kanban column structure for any existing board

## Decisions

### D1 — Folder detection at scan time, not card-parse time

Folder membership is checked in `collectMdFiles()` before any card parsing, rather than adding a `sourceFolder` field during parse and filtering later.

**Why:** Simpler — files outside allowed folders never enter the pipeline at all. Avoids carrying dead data through `StoryParser`, `BoardDataAggregator`, and the webview.

**Alternative considered:** Tag each parsed card with its source folder and filter in `BoardDataAggregator`. Rejected because it pollutes the data model without benefit.

### D2 — Three explicit folder roots, matched by path segment

Allowed roots (relative to workspace): `implementation-artifacts`, `planning-artifacts`, `mockups`, `_mockups`. A file is included if its path contains one of these as a path segment (e.g. `src/implementation-artifacts/story.md` would still match). If project nests them deeper, they still work.

**Why:** BMAD projects may keep these folders at any depth. Matching by segment is more resilient than anchoring at root.

**Alternative considered:** Require folders at workspace root only. Rejected as too rigid for monorepos or nested project layouts.

### D3 — Card type determined by source folder

- `implementation-artifacts/**` → treated as tickets (same parse path as today)
- `planning-artifacts/**` → treated as documents (rendered in the Documents column or equivalent)
- `mockups/` or `_mockups/` → new `mockup` card type

**Why:** Removes the fragile heuristic (numeric prefix, presence of `status:` field) and makes intent explicit via folder placement.

### D4 — Mockups board: conditional tab in the webview

The extension checks on startup and on file-change events whether any `mockups/` or `_mockups/` folder exists in the workspace. A boolean `hasMockups` is sent with the board data payload. The webview renders the Mockups tab only when `hasMockups === true`.

**Why:** Avoids showing an empty, confusing tab for projects that never use mockups. The tab appears automatically the moment a user creates the folder.

### D5 — File watcher glob scoping

Replace the current `**/*.md` watcher with four watchers:
```
**/implementation-artifacts/**/*.md
**/planning-artifacts/**/*.md
**/mockups/**/*.md
**/_mockups/**/*.md
```

**Why:** Prevents spurious board refreshes when the user edits a README, commit message preview, or any other markdown outside the artifact folders.

## Risks / Trade-offs

- **Folder rename breaks the board** — If a user renames `implementation-artifacts` to something custom, all tickets disappear. Mitigation: display a clear empty-state message with guidance ("No artifact folders found. Expected `implementation-artifacts/` or `planning-artifacts/`"). Future work: configurable folder names.
- **Existing projects with flat structure** — Projects not using BMAD folder layout will see an empty board. Mitigation: same empty-state message as above.
- **`_mockups` vs `mockups` ambiguity** — Both are supported. If a project has both, files from each are merged into the same Mockups board. This is intentional.

## Migration Plan

No data migration needed — this is purely a read-time filtering change. Existing users will notice previously-visible files disappear if they are outside the artifact folders. The empty-state message guides them to the correct folder layout.
