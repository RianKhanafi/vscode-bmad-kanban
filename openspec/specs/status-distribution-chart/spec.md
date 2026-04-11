## ADDED Requirements

### Requirement: Board toolbar shows status distribution chart
The board SHALL display a horizontal stacked bar chart in the toolbar showing the proportion of total visible cards in each status column, color-coded consistently with column badges.

#### Scenario: Chart segments reflect card distribution
- **WHEN** the board has 8 todo, 4 in-progress, 2 review, 6 done cards
- **THEN** each column's segment width is proportional to its card count

#### Scenario: Chart updates when filters change
- **WHEN** a search or filter reduces visible cards
- **THEN** the chart recomputes based on filtered counts

#### Scenario: Empty columns have no chart segment
- **WHEN** a column has zero cards
- **THEN** no segment is rendered for that column in the chart

### Requirement: Stale cards display a warning badge
Cards whose last-updated date (from `updated_at` or `updated` metadata) is more than 7 days before today SHALL display a stale warning badge.

#### Scenario: Stale card shows badge
- **WHEN** a card's `updated_at` value is 8+ days ago
- **THEN** the card displays a `⏱ Stale` badge

#### Scenario: Recently updated card shows no badge
- **WHEN** a card's `updated_at` is within the last 7 days
- **THEN** no stale badge is shown

#### Scenario: Card with no date field shows no badge
- **WHEN** a card has no `updated_at` or `updated` metadata
- **THEN** no stale badge is shown

### Requirement: Board toolbar shows burndown sparkline
The board toolbar SHALL display a compact SVG sparkline showing the cumulative count of done cards per day over the past 14 days.

#### Scenario: Sparkline plots done-card accumulation
- **WHEN** the board has 3 done cards with `completed` dates in the past 14 days
- **THEN** the sparkline shows an upward step at each completion date

#### Scenario: No completed dates renders flat zero line
- **WHEN** no done cards have a `completed` metadata field
- **THEN** the sparkline renders a flat line at zero
