## ADDED Requirements

### Requirement: Clicking a card opens the story Markdown file in the editor
The system SHALL open the source `.md` file for a story card when the user clicks on that card in the Kanban board.

#### Scenario: Clicking a card opens its Markdown file
- **WHEN** the user clicks a story card in the Kanban board
- **THEN** the corresponding story `.md` file opens in the VS Code editor

#### Scenario: File opens in the active editor group
- **WHEN** a card is clicked
- **THEN** the `.md` file opens in the currently active editor group (not a new window)

#### Scenario: Clicking a card for a missing file shows an error
- **WHEN** the user clicks a card whose source `.md` file no longer exists on disk
- **THEN** the board displays an inline error message indicating the file cannot be found, and no editor tab is opened
