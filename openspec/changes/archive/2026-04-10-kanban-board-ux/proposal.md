## Why

The BMAD Kanban board currently displays all cards in fixed columns with no way to filter, search, or reorganize them. As a project grows beyond a handful of stories, finding relevant cards becomes tedious — the board needs basic navigation controls to stay usable at scale.

## What Changes

- Add a **filter bar** at the top of the board with chips for epic, assignee, and tag/label
- Add a **search input** that fuzzy-matches card titles and metadata in real-time
- Show a **card count badge** next to each column header (e.g. `TODO (8)`)
- Add **collapse/expand toggle** on each column to hide it from view
- Add **sort controls** within each column: by date, title, or effort estimate

## Capabilities

### New Capabilities
- `board-filter-search`: Real-time filter and fuzzy search bar rendered above the board columns; filters apply to all columns simultaneously and persist while the board is open
- `column-controls`: Per-column card count badge in the header and a collapse/expand toggle that hides the card list while keeping the column label visible
- `column-sort`: Sort order selector per column (date / title / effort); sort state is stored in-memory for the session

### Modified Capabilities
<!-- No existing specs — this is the first UX enhancement pass -->

## Impact

- `webview-src/App.tsx` — filter bar, search input, column header controls, sort logic
- `webview-src/index.tsx` — new CSS for filter bar, badges, collapse state, sort dropdown
- No backend changes required; filtering/sorting is purely client-side
- No changes to `sprint-status.yaml` or story file parsing
