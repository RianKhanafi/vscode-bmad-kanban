## ADDED Requirements

### Requirement: Effort estimate rendered as visual bar
The system SHALL parse the `estimated_effort` metadata field and render a horizontal bar visualising the effort range against a 0–40 hour scale.

#### Scenario: Range format parsed correctly
- **WHEN** `estimated_effort` is `"8-12 hours"`
- **THEN** the bar fills from the 8h mark to the 12h mark on a 40h scale

#### Scenario: Single value format parsed correctly
- **WHEN** `estimated_effort` is `"10 hours"`
- **THEN** the bar shows a point marker at the 10h position

#### Scenario: Values beyond 40h clamp to full bar
- **WHEN** `estimated_effort` is `"50 hours"`
- **THEN** the bar fills to 100% width without overflow

### Requirement: Copy file path button in modal toolbar
The modal toolbar SHALL include a copy-path button that writes the full file path to the clipboard and provides visual confirmation.

#### Scenario: Button copies path on click
- **WHEN** user clicks the copy-path button
- **THEN** `navigator.clipboard.writeText` is called with the card's `filePath`

#### Scenario: Button shows "Copied!" for 2 seconds
- **WHEN** clipboard write succeeds
- **THEN** the button label changes to "✓ Copied!" and reverts to "Copy path" after 2 seconds

### Requirement: Linked story chips navigate between previews
When a card's `related` metadata field contains story IDs, the modal SHALL render each as a chip. Clicking a chip replaces the current modal content with that story's preview.

#### Scenario: Chips render for each related ID
- **WHEN** `related` metadata contains comma-separated IDs
- **THEN** one chip per ID is shown in the modal

#### Scenario: Chip click loads referenced story
- **WHEN** user clicks a linked story chip and the story exists in the current board
- **THEN** `getFileContent` is requested for the referenced story's file path and modal content updates

#### Scenario: Unknown story ID chip is disabled
- **WHEN** a related ID does not match any card in the current board state
- **THEN** the chip is rendered but greyed out and non-interactive
