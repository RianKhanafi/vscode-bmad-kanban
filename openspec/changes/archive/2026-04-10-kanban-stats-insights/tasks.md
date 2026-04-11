## 1. BoardState Extension

- [x] 1.1 Add `completedDates: string[]` to `BoardState` type in `BoardDataAggregator.ts`
- [x] 1.2 Collect `completed` / `completed_date` values from done-column cards and populate the field

## 2. Status Distribution Chart

- [x] 2.1 Create `StatusDistributionBar` component accepting `columns: { [status]: StoryCard[] }`
- [x] 2.2 Compute each column's pixel/percentage width based on its card count vs total
- [x] 2.3 Render as a flex row of `<div>` segments colored by `STATUS_COLORS`
- [x] 2.4 Show column label + count as tooltip (`title` attribute) on each segment
- [x] 2.5 Minimum visible width of 2px for non-zero columns; hide zero-count columns entirely
- [x] 2.6 Place `StatusDistributionBar` in the board toolbar above columns

## 3. Stale Card Detection

- [x] 3.1 In `Card` component, read `updated_at` or `updated` metadata
- [x] 3.2 Parse as `new Date()` — skip badge if invalid or absent
- [x] 3.3 If date is more than 7 days before today, add `⏱ Stale` badge to card
- [x] 3.4 Add `.stale-badge` CSS (amber/yellow color)

## 4. Burndown Sparkline

- [x] 4.1 Create `BurndownSparkline` component accepting `completedDates: string[]`
- [x] 4.2 Generate a 14-day date range ending today
- [x] 4.3 Accumulate completed card count per day (step function — carry forward previous day's total)
- [x] 4.4 Render as an inline SVG `<polyline>` with appropriate viewBox and stroke
- [x] 4.5 Show "no data" label when `completedDates` is empty
- [x] 4.6 Place `BurndownSparkline` in the board toolbar beside the distribution bar

## 5. Toolbar Layout & CSS

- [x] 5.1 Add `.board-stats-bar` CSS for the toolbar row holding both chart components
- [x] 5.2 Add responsive sizing so toolbar doesn't crowd on narrow boards
- [x] 5.3 Add CSS for `.stale-badge`, `.sparkline-container`, `.dist-bar-segment`

## 6. Build & Verify

- [x] 6.1 Run `npm run build` — confirm no TypeScript errors
- [x] 6.2 Verify distribution bar segments reflect column card counts
- [x] 6.3 Verify stale badge appears on a card with an old `updated_at` date
- [x] 6.4 Verify stale badge absent on cards with no date or recent date
- [x] 6.5 Verify burndown sparkline plots correctly from `completedDates`
- [x] 6.6 Package VSIX with `vsce package --no-dependencies --allow-missing-repository`
