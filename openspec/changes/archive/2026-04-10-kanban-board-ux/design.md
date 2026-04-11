## Context

The BMAD Kanban board webview (`webview-src/App.tsx`) renders all story cards across fixed columns with no filtering, search, or sorting capabilities. `BoardDataAggregator.ts` already computes `columns: { [status]: StoryCard[] }` with full metadata. All UX enhancements in this change are purely client-side — no backend, YAML, or file-parsing changes needed.

## Goals / Non-Goals

**Goals:**
- Real-time filter bar that narrows visible cards by epic, assignee, or tag
- Fuzzy search over card title + metadata values
- Card count badge in each column header reflecting filtered count
- Per-column collapse toggle
- Per-column sort (date / title / effort)

**Non-Goals:**
- Persisting filter/sort state across board reloads
- Server-side filtering
- Custom filter expressions or saved filter presets

## Decisions

### Filter state in a single top-level React state object
All active filters (`search`, `epic`, `assignee`, `tag`) are kept in one `filters` state object in the `App` component and passed down as needed. This avoids prop-drilling through multiple intermediate components by using a single derived `filteredColumns` memo computed from `activeBoardState + filters`.

**Alternative considered:** Individual `useState` per filter — rejected because coordinating resets and deriving the filtered board would require multiple `useEffect` calls.

### Fuzzy search via simple substring matching (no library)
Fuzzy search uses case-insensitive `includes()` across title and all metadata string values. No dependency on fuse.js or similar — the card count is small enough that full string search is instantaneous.

**Alternative considered:** Adding fuse.js — rejected to avoid increasing bundle size for marginal gain on small datasets.

### Filter chip values derived from current board data
Epic/assignee/tag chips are dynamically computed from the current `boardState` — only values that actually exist on cards appear as options. This avoids stale filter chips.

### Sort applied after filter, independently per column
Each column has its own sort selector stored in `columnSort: { [colId]: SortKey }` state. Sort is applied last (after filter) so counts reflect filtered state. Default sort is insertion order (no sort applied).

### Collapse stored as a `Set<string>` of collapsed column IDs
Simple `collapsedColumns` Set in state. When a column is collapsed, only the header is rendered (with badge showing total card count, not filtered).

## Risks / Trade-offs

- **Filter chip overflow on wide boards** — mitigated by using a scrollable chip row rather than wrapping
- **Sort by effort on non-numeric estimates** (e.g. `"8-12 hours"`) — parse the first number from the string; cards without estimates sort to the end
- **Collapsed columns still receive drag-drop events** — mitigation: disable `onDrop` when collapsed

## Migration Plan

Pure UI addition — no migration needed. Existing boards load identically; filters default to "none" on mount.

## Open Questions

- Should filter chips show a count badge (e.g. `epic: Auth (4)`)? Deferred to implementation — add if space allows.
- Should search also match against the story ID? Likely yes — implement as part of the search scope.
