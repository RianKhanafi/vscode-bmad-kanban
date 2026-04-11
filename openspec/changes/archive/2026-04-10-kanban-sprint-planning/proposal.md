## Why

The board only supports a single flat status grouping. Teams using BMAD Method often work in sprints and organise stories by epic — the board has no way to reflect that structure. This change adds sprint-based grouping, epic swimlanes, done-count progress indicators, and overdue highlighting.

## What Changes

- Add a **Sprint view** toggle that groups cards by `sprint:` field value instead of status
- Add **Epic swimlanes** view: rows = epics, columns = status columns intersected
- Show a **Done counter** bar (`X / Y done`) per epic or sprint group header
- Highlight cards with a red tint when `due_date` is in the past

## Capabilities

### New Capabilities
- `sprint-grouping`: Board view mode where card groups are sprint values read from story metadata; status badges still shown on cards; column header shows sprint name
- `epic-swimlanes`: Alternative board layout with one horizontal row per epic and status columns across; cards appear at the intersection cell of their epic × status
- `progress-indicators`: Done-counter progress bar rendered on each epic or sprint group header showing completed vs total tasks in that group
- `overdue-highlighting`: Cards whose `due_date` (or `due`) metadata value is earlier than today are rendered with a red left border and a `⚠ Overdue` badge

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `webview-src/App.tsx` — view mode switcher, swimlane layout component, progress bar
- `webview-src/index.tsx` — CSS for swimlane grid, progress bar, overdue card style
- `src/BoardDataAggregator.ts` — may expose `sprints` and `epics` groupings in `BoardState`
- No changes to YAML or file parsing beyond reading existing metadata fields
