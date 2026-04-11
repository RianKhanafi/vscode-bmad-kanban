## 1. BoardState Extensions

- [x] 1.1 Add optional `sprintGroups: Record<string, StoryCard[]>` to `BoardState` type
- [x] 1.2 Add optional `epicGroups: Record<string, StoryCard[]>` to `BoardState` type
- [x] 1.3 Compute `sprintGroups` in `getBoardState()` by grouping on `story.metadata['sprint']`
- [x] 1.4 Compute `epicGroups` in `getBoardState()` by grouping on `story.metadata['epic']`
- [x] 1.5 Place ungrouped cards (no sprint/epic) under an `"Unassigned"` key

## 2. View Mode Switcher

- [x] 2.1 Add `viewMode: 'kanban' | 'sprint' | 'swimlane'` state to `App`
- [x] 2.2 Render a segmented control (Kanban / Sprint / Swimlane) in the board toolbar
- [x] 2.3 Pass `viewMode` to the board render area to switch layout component

## 3. Sprint View

- [x] 3.1 Create `SprintView` component that renders one column per sprint group from `boardState.sprintGroups`
- [x] 3.2 Show status badge on each card in sprint view
- [x] 3.3 Render done-count progress bar in each sprint group header
- [x] 3.4 Compute `doneCount / totalCount` per sprint group for the bar

## 4. Swimlane View

- [x] 4.1 Create `SwimlaneView` component with CSS Grid layout (row per epic × column per status)
- [x] 4.2 Cell at `[epicRow][statusCol]` shows cards matching that epic AND status
- [x] 4.3 Render progress bar in each epic row header
- [x] 4.4 Each cell accepts drag-drop (drop triggers `moveCard` with target status)

## 5. Overdue Highlighting

- [x] 5.1 In `Card` component, parse `due_date` or `due` metadata as `new Date()`
- [x] 5.2 If parsed date < today, add `overdue` CSS class to card and show `⚠ Overdue` badge
- [x] 5.3 Add `.card.overdue` CSS with red left border

## 6. CSS & Styling

- [x] 6.1 Add CSS for `.board-toolbar`, `.view-switcher`, `.view-btn` in `index.tsx`
- [x] 6.2 Add CSS for `.sprint-group`, `.progress-bar`, `.progress-bar-fill`
- [x] 6.3 Add CSS for `.swimlane-grid`, `.swimlane-row-header`, `.swimlane-cell`
- [x] 6.4 Add CSS for `.card.overdue`, `.overdue-badge`

## 7. Build & Verify

- [x] 7.1 Run `npm run build` — confirm no TypeScript errors
- [x] 7.2 Verify sprint view groups cards by sprint field
- [x] 7.3 Verify swimlane view places cards in correct epic × status cells
- [x] 7.4 Verify progress bars show correct done ratio
- [x] 7.5 Verify overdue cards show red border and badge
- [x] 7.6 Package VSIX with `vsce package --no-dependencies --allow-missing-repository`
