## Why

The board shows the current snapshot of work but gives no insight into progress over time or health of the backlog. A simple visual overview of status distribution and flagging of stale or at-risk cards would help teams spot bottlenecks without leaving the board.

## What Changes

- Add a **status distribution mini chart** in the board toolbar (horizontal stacked bar) showing proportion of cards in each column
- Add a **stale card warning badge** on cards that haven't changed status in N days (configurable, default 7)
- Add a **burndown sparkline** in the toolbar showing done-card count per day over the last 14 days (uses `completed` dates from story metadata)

## Capabilities

### New Capabilities
- `status-distribution-chart`: Horizontal stacked bar rendered in the board toolbar showing the proportion of total cards in each column, color-coded by status; clicking a segment scrolls to that column
- `stale-card-detection`: Cards whose status has not changed in more than a configurable threshold of days (read from `updated` or `updated_at` metadata) display a `⏱ Stale` warning badge; threshold defaults to 7 days
- `burndown-sparkline`: SVG sparkline in the board toolbar plotting the cumulative count of done cards per day for the past 14 days, derived from `completed` date metadata on cards in the done column

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `webview-src/App.tsx` — toolbar component, chart components (pure SVG, no chart library)
- `webview-src/index.tsx` — CSS for toolbar, stale badge, sparkline container
- `src/BoardDataAggregator.ts` — expose `completedDates: string[]` on `BoardState` for burndown data
- No changes to YAML or file parsing beyond reading existing metadata date fields
