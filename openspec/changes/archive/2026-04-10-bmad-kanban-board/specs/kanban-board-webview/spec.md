## ADDED Requirements

### Requirement: Kanban board panel renders in VS Code
The system SHALL provide a VS Code command that opens a WebView panel displaying a Kanban board with columns representing workflow states (todo, in-progress, review, done).

#### Scenario: Opening the board from the command palette
- **WHEN** the user runs the command `BMAD: Open Kanban Board`
- **THEN** a WebView panel titled "BMAD Kanban Board" opens in the editor area

#### Scenario: Board renders workflow columns
- **WHEN** the Kanban board panel is open
- **THEN** four columns are displayed left-to-right: Todo, In Progress, Review, Done

#### Scenario: Board respects VS Code color theme
- **WHEN** the user has a dark or light VS Code theme active
- **THEN** the board UI uses the VS Code theme's color tokens so it visually integrates with the editor

#### Scenario: Only one board panel open at a time
- **WHEN** the user runs `BMAD: Open Kanban Board` while a panel is already open
- **THEN** the existing panel is revealed/focused rather than creating a duplicate panel
