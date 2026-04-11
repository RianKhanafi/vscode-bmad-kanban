## Context

The board has no summary view of work distribution or trend. `BoardState.columns` already contains all cards with their metadata including dates. All visualisation is client-side SVG — no charting library needed. The stale threshold needs to compare against a metadata date field which may be in several formats.

## Goals / Non-Goals

**Goals:**
- Stacked bar chart (status proportions) in toolbar
- Stale card badge using `updated`/`updated_at` metadata
- Burndown sparkline from `completed` dates

**Non-Goals:**
- Persisting stale threshold in user settings (use hard-coded 7-day default for v1)
- Interactive burndown with tooltips (v1 is static sparkline)
- Historical data beyond what's in the current story metadata

## Decisions

### All charts are hand-rolled SVG — no chart library
The data is tiny (≤5 columns, ≤14 data points). A charting library would triple the webview bundle. Inline SVG `<rect>` and `<polyline>` elements are sufficient.

### Stale detection uses `updated_at`, `updated`, then falls back to none
Parse the field value as `new Date()`. If the result is invalid or the field is absent, no stale badge is shown. Threshold defaults to 7 days and is a constant — no configurability in v1.

### Burndown uses `completed` dates from done-column cards only
Each card in the `done` column is checked for a `completed` or `completed_date` field. Group by date string, accumulate counts over 14 days. Missing days show the previous day's total (step chart).

### `BoardState` gains `completedDates: string[]`
Rather than parsing dates in the webview, `BoardDataAggregator` extracts all non-null `completed` values from done-column cards and emits them as a flat array. The webview groups them by date.

## Risks / Trade-offs

- **Date parsing fragility** — `new Date("2026-02-09")` is reliable for ISO dates; other formats may parse incorrectly → stale badge simply won't show (safe degradation)
- **Burndown may be empty** — if no cards have `completed` dates, the sparkline shows a flat zero line (still valid)
- **Stacked bar tiny segments** — columns with 0 cards render 0-width segments (hidden); minimum visible width of 2px applied only when count > 0

## Migration Plan

`BoardState.completedDates` is a new optional field — no breaking change. Webview uses `?? []` fallback.
