## 1. Filter State & Data Model

- [x] 1.1 Add `filters` state to `App` component (`search`, `activeEpics`, `activeAssignees`, `activeTags` as Sets)
- [x] 1.2 Add `columnSort` state (`Record<string, 'date'|'title'|'effort'|'none'>`)
- [x] 1.3 Add `collapsedColumns` state (`Set<string>`)
- [x] 1.4 Write `deriveFilterOptions()` helper that extracts distinct epic/assignee/tag values from `boardState`
- [x] 1.5 Write `applyFilters()` helper that returns filtered+sorted columns given `boardState`, `filters`, `columnSort`

## 2. Search & Filter Bar Component

- [x] 2.1 Create `FilterBar` component with search `<input>` and three chip groups (epic, assignee, tag)
- [x] 2.2 Render filter option chips dynamically from `deriveFilterOptions()` output
- [x] 2.3 Highlight active chips with distinct style; clicking toggles selection
- [x] 2.4 Hide chip groups when no values exist for that field
- [x] 2.5 Wire search input change to update `filters.search` with debounce (150ms)
- [x] 2.6 Add "Clear all" button that resets all filters at once

## 3. Column Header Controls

- [x] 3.1 Add card count badge to column header (shows filtered count; collapsed shows total)
- [x] 3.2 Add collapse/expand toggle button (chevron icon) to column header
- [x] 3.3 When column is collapsed render header-only strip (no card list, fixed narrow width)
- [x] 3.4 Disable `onDrop` handler when column is collapsed

## 4. Sort Controls

- [x] 4.1 Add sort dropdown (or cycle button) to each column header: None / Title / Date / Effort
- [x] 4.2 Implement sort comparators: alphabetical title, newest date first, effort lower-bound ascending
- [x] 4.3 Parse effort from strings like `"8-12 hours"` → integer `8`; missing effort sorts last
- [x] 4.4 Apply selected sort after filter in `applyFilters()`

## 5. Styling

- [x] 5.1 Add CSS for `.filter-bar`, `.filter-group`, `.filter-chip`, `.filter-chip.active` in `index.tsx`
- [x] 5.2 Add CSS for `.column-badge`, `.column-collapse-btn`, `.column-sort-select`
- [x] 5.3 Add CSS for collapsed column state (`.column.collapsed` — narrow, header only)
- [x] 5.4 Ensure filter bar doesn't overflow horizontally (scrollable chip rows)

## 6. Build & Verify

- [x] 6.1 Run `npm run build` and confirm no TypeScript errors
- [x] 6.2 Verify filter chips appear and narrow cards correctly
- [x] 6.3 Verify count badge updates when filter is active
- [x] 6.4 Verify collapse hides cards and disables drop
- [x] 6.5 Verify sort reorders cards within a column
- [x] 6.6 Package VSIX with `vsce package --no-dependencies --allow-missing-repository`
