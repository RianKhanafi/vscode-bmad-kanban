## ADDED Requirements

### Requirement: Filter bar renders above the board
The board SHALL display a filter bar above the column area containing a search input and filter chip groups for epic, assignee, and tag metadata fields.

#### Scenario: Filter bar is always visible
- **WHEN** the board loads with any cards
- **THEN** the filter bar is displayed above all columns

#### Scenario: Epic chips populated from board data
- **WHEN** the board loads and cards contain `epic` metadata
- **THEN** each distinct epic value appears as a selectable chip in the filter bar

#### Scenario: Filter bar hides chips with no data
- **WHEN** no cards contain an `assignee` field
- **THEN** the assignee chip group is not rendered

### Requirement: Search filters cards in real-time
The board SHALL filter cards across all columns to only show cards whose title or any metadata string value contains the search query (case-insensitive substring match).

#### Scenario: Matching cards remain visible
- **WHEN** user types a search query
- **THEN** only cards matching the query are shown in their respective columns

#### Scenario: Non-matching cards are hidden
- **WHEN** user types a search query
- **THEN** cards that do not match are removed from the column card list

#### Scenario: Empty search shows all cards
- **WHEN** user clears the search input
- **THEN** all cards are visible again

### Requirement: Active filter chips narrow visible cards
The board SHALL hide cards that do not match all currently active filter chips.

#### Scenario: Single chip selected
- **WHEN** user clicks an epic chip
- **THEN** only cards with that epic value are shown

#### Scenario: Multiple chips selected act as AND
- **WHEN** user selects an epic chip and a tag chip simultaneously
- **THEN** only cards matching both values are shown

#### Scenario: Clicking an active chip deselects it
- **WHEN** user clicks a chip that is already selected
- **THEN** that filter is removed and cards are re-evaluated
