## Context

The board currently has two views (Kanban status columns + Documents). Planning and sprint work requires a way to group cards by sprint or epic and to see how much work is done. Overdue tracking requires comparing `due_date` metadata against today's date client-side.

## Goals / Non-Goals

**Goals:**
- Sprint-grouped view using `sprint:` story field
- Epic swimlane layout (rows per epic, status columns across)
- Done/total progress bar per group header
- Overdue card visual indicator

**Non-Goals:**
- Writing sprint or epic assignments back to story files
- User-defined sprint date ranges
- Velocity calculations

## Decisions

### View mode is a top-level toggle, not a separate panel
A segmented control (Kanban / Sprint / Swimlane) renders in the board toolbar. The selected mode is React state — all three views use the same `activeBoardState` but render it differently.

### Sprint/epic grouping is computed in `BoardDataAggregator` and exposed on `BoardState`
`BoardState` gains two optional fields: `sprintGroups: { [sprint]: StoryCard[] }` and `epicGroups: { [epic]: StoryCard[] }`. This keeps grouping logic in the TypeScript backend and keeps the React component simple.

### Swimlane grid uses CSS Grid
Epic rows × status columns = `display: grid` with `grid-template-columns` matching `COLUMN_ORDER`. Each cell is a small card dropzone.

### Overdue detection is purely client-side
Compare `due_date` string → `new Date(value) < new Date()`. Done in the `Card` render — no backend involvement.

## Risks / Trade-offs

- **`BoardState` interface change** — consumers (webview) must handle `undefined` sprint/epic groups gracefully (already optional fields)
- **Swimlane cells may be very small** — mitigated by allowing cells to grow with card content; swimlane view may scroll both axes
- **Stories without `sprint:` or `epic:` don't appear in grouped views** — show an "Unassigned" group for these

## Migration Plan

`BoardState` change is additive (new optional fields). Existing webview code paths are unaffected if the fields are absent.
