## ADDED Requirements

### Requirement: User can drag a card to reassign its workflow status
The system SHALL allow the user to drag a story card from one column and drop it onto another column, updating the story's status in `sprint-status.yml`.

#### Scenario: Successful drag-and-drop moves card
- **WHEN** the user drags a card from the "Todo" column and drops it onto the "In Progress" column
- **THEN** the card appears in the "In Progress" column and `sprint-status.yml` is updated to reflect the new status

#### Scenario: Card returns to original column on invalid drop
- **WHEN** the user drags a card and releases it outside any valid column
- **THEN** the card returns to its original column and no changes are written to `sprint-status.yml`

#### Scenario: Sprint YAML is the only file written during drag-and-drop
- **WHEN** a successful drag-and-drop occurs
- **THEN** only `sprint-status.yml` is modified; no `.md` files are touched

#### Scenario: Board reflects new status immediately after drop
- **WHEN** a drag-and-drop completes successfully
- **THEN** the board updates the card's column position without requiring a manual refresh
