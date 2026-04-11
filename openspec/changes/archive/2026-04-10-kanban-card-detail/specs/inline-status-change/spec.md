## ADDED Requirements

### Requirement: Modal displays inline status change dropdown
The preview modal SHALL display a status dropdown showing the card's current column, with all available column options, allowing the user to move the card without closing the modal first.

#### Scenario: Dropdown shows current status pre-selected
- **WHEN** the preview modal opens for a card in the `in-progress` column
- **THEN** the status dropdown shows `in-progress` as the selected value

#### Scenario: Selecting a new status moves the card
- **WHEN** user selects a different status from the dropdown
- **THEN** a `moveCard` message is dispatched with the new status and the modal closes

#### Scenario: Selecting the same status is a no-op
- **WHEN** user selects the already-active status
- **THEN** no `moveCard` message is sent and the modal remains open

### Requirement: Modal displays effort estimate bar when present
The preview modal SHALL display a visual range bar when the card metadata contains an `estimated_effort` field with a parseable value.

#### Scenario: Effort bar renders for range format
- **WHEN** a card has `estimated_effort: "8-12 hours"`
- **THEN** the modal shows a range bar from 8 to 12 on a 0–40 hour scale

#### Scenario: Effort bar is hidden when field is absent
- **WHEN** a card has no `estimated_effort` metadata field
- **THEN** no effort bar or label is shown in the modal

### Requirement: Modal provides a copy file path button
The preview modal toolbar SHALL include a button that copies the card's absolute file path to the clipboard.

#### Scenario: Clicking copy writes to clipboard
- **WHEN** user clicks the "Copy path" button
- **THEN** the file path is written to the system clipboard and the button briefly shows a confirmation label

### Requirement: Modal shows linked story chips
The preview modal SHALL display clickable chips for any story IDs found in the card's `related` metadata field.

#### Scenario: Linked chips render for related IDs
- **WHEN** a card's metadata contains `related: "story-a, story-b"`
- **THEN** two chips labelled `story-a` and `story-b` are shown in the modal

#### Scenario: Clicking a linked chip opens that story's preview
- **WHEN** user clicks a linked story chip
- **THEN** the modal navigates to the preview of the referenced story (replaces current content)
