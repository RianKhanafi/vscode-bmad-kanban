## ADDED Requirements

### Requirement: Arrow keys navigate between cards
The board SHALL allow keyboard focus to move between cards using arrow keys when a card is focused.

#### Scenario: Right arrow moves focus to first card in next column
- **WHEN** a card is focused and user presses the right arrow key
- **THEN** focus moves to the first card in the next column to the right

#### Scenario: Down arrow moves focus to next card in same column
- **WHEN** a card is focused and user presses the down arrow key
- **THEN** focus moves to the next card below in the same column

#### Scenario: Focused card has visible focus ring
- **WHEN** a card has keyboard focus
- **THEN** it renders a visible focus ring border

### Requirement: Enter key opens preview modal for focused card
When a card has keyboard focus, pressing Enter SHALL open the preview modal for that card.

#### Scenario: Enter opens modal
- **WHEN** a card is keyboard-focused and user presses Enter
- **THEN** the preview modal opens for that card

### Requirement: O key opens file in editor for focused card
When a card has keyboard focus, pressing `O` SHALL open the card's file in the VS Code editor.

#### Scenario: O key sends openFile message
- **WHEN** a card is keyboard-focused and user presses `O`
- **THEN** an `openFile` message is posted with the card's file path

### Requirement: Undo toast appears after each card move
After any card move (drag-and-drop or context menu), the board SHALL display a toast notification with an Undo button for 5 seconds.

#### Scenario: Toast appears after drag-and-drop
- **WHEN** a card is successfully moved via drag-and-drop
- **THEN** a toast is shown with the card title and "Undo" button

#### Scenario: Clicking Undo reverses the move
- **WHEN** user clicks the Undo button within 5 seconds
- **THEN** a `moveCard` message is sent with the previous status, reverting the card

#### Scenario: Toast auto-dismisses after 5 seconds
- **WHEN** 5 seconds pass without the user clicking Undo
- **THEN** the toast disappears and the undo option is no longer available

### Requirement: Right-click context menu offers column move options
Right-clicking a card SHALL display a context menu with a "Move to…" option listing all available columns.

#### Scenario: Context menu appears on right-click
- **WHEN** user right-clicks a card
- **THEN** a context menu appears near the cursor with "Move to…" items for each column

#### Scenario: Selecting a column moves the card
- **WHEN** user selects a target column from the context menu
- **THEN** a `moveCard` message is sent and the card moves optimistically

#### Scenario: Menu dismisses on outside click or Escape
- **WHEN** user clicks outside the context menu or presses Escape
- **THEN** the context menu closes without any action
