## ADDED Requirements

### Requirement: Board supports Sprint grouping view
The board SHALL provide a Sprint view mode that groups cards by their `sprint` metadata field instead of by status column.

#### Scenario: Sprint view renders one group per distinct sprint value
- **WHEN** user selects Sprint view and cards have `sprint` metadata
- **THEN** one column/group is rendered per distinct sprint value containing all cards for that sprint

#### Scenario: Cards without sprint field appear in Unassigned group
- **WHEN** a card has no `sprint` metadata
- **THEN** it appears in an "Unassigned" group in sprint view

#### Scenario: Status badge still visible in sprint view
- **WHEN** sprint view is active
- **THEN** each card still shows its status badge

### Requirement: Board supports Epic swimlane view
The board SHALL provide an Epic swimlane view mode where rows correspond to epic values and columns correspond to status columns.

#### Scenario: Swimlane renders row per epic
- **WHEN** user selects swimlane view
- **THEN** one horizontal row per distinct epic value is rendered with all status columns across

#### Scenario: Card appears in correct epic × status cell
- **WHEN** a card has `epic: "Epic 2"` and status `in-progress`
- **THEN** it appears in the "Epic 2" row under the "In Progress" column

#### Scenario: Cards without epic appear in Unassigned row
- **WHEN** a card has no `epic` metadata
- **THEN** it appears in an "Unassigned" row

### Requirement: Group headers display done-count progress bar
Sprint and epic group headers SHALL display a progress bar showing the fraction of cards in that group that are in the `done` column.

#### Scenario: Progress bar reflects done proportion
- **WHEN** a sprint group has 3 done cards out of 10 total
- **THEN** the group header shows "3 / 10 done" with a 30%-filled progress bar

### Requirement: Overdue cards are visually highlighted
Cards whose `due_date` or `due` metadata value is earlier than today SHALL be rendered with a distinct overdue indicator.

#### Scenario: Overdue card shows warning indicator
- **WHEN** a card's `due_date` is before today's date
- **THEN** the card displays a red left border and an `⚠ Overdue` badge

#### Scenario: Future due date shows no warning
- **WHEN** a card's `due_date` is today or in the future
- **THEN** no overdue indicator is shown
