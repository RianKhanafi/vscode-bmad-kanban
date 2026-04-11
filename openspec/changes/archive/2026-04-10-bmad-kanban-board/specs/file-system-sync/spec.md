## ADDED Requirements

### Requirement: Board refreshes automatically when workspace files change
The system SHALL watch `.md` story files and `sprint-status.yml` for changes and update the board in real time without requiring a manual refresh.

#### Scenario: Board updates when sprint YAML is modified externally
- **WHEN** an agent or user edits `sprint-status.yml` outside the Kanban board UI
- **THEN** the board refreshes within 500 ms and reflects the updated workflow state

#### Scenario: Board updates when a new story file is added
- **WHEN** a new story `.md` file is created in the workspace
- **THEN** the board adds the corresponding card in the Todo column within 500 ms

#### Scenario: Board updates when a story file is deleted
- **WHEN** a story `.md` file is removed from the workspace
- **THEN** the corresponding card is removed from the board within 500 ms

#### Scenario: File watchers are disposed when the panel is closed
- **WHEN** the user closes the Kanban board panel
- **THEN** all file system watchers registered by the extension are disposed, releasing system resources
