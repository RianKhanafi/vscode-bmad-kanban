## ADDED Requirements

### Requirement: Column header shows card count badge
Each column header SHALL display a count badge showing the number of visible cards in that column, updating in real-time when filters are applied.

#### Scenario: Badge shows filtered count
- **WHEN** a filter is active and reduces visible cards
- **THEN** the column badge shows the filtered count, not the total count

#### Scenario: Collapsed column retains total count
- **WHEN** a column is collapsed
- **THEN** the badge shows the total card count (unfiltered) to indicate hidden work

### Requirement: Column can be collapsed and expanded
Each column SHALL have a toggle control in its header that hides the card list while preserving the column header and badge.

#### Scenario: Column collapses on toggle click
- **WHEN** user clicks the collapse toggle on an expanded column
- **THEN** the column card list is hidden and the column shrinks to header-only width

#### Scenario: Column expands on toggle click
- **WHEN** user clicks the expand toggle on a collapsed column
- **THEN** the column card list is shown again

#### Scenario: Collapsed column does not accept drops
- **WHEN** a card is dragged over a collapsed column
- **THEN** the drop is not triggered

### Requirement: Cards within a column can be sorted
Each column SHALL have a sort selector allowing the user to sort cards by date, title, or effort estimate.

#### Scenario: Sort by title alphabetically
- **WHEN** user selects "Title" sort on a column
- **THEN** cards are rendered in ascending alphabetical order by title

#### Scenario: Sort by date descending
- **WHEN** user selects "Date" sort on a column
- **THEN** cards with dates are sorted newest-first; cards without dates appear at the end

#### Scenario: Sort by effort ascending
- **WHEN** user selects "Effort" sort on a column
- **THEN** cards are sorted by the numeric lower bound of their estimate; cards without estimates appear at the end

#### Scenario: Default sort preserves insertion order
- **WHEN** no sort is selected for a column
- **THEN** cards appear in the order provided by the board state
