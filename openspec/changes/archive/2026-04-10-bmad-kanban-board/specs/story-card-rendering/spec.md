## ADDED Requirements

### Requirement: Story cards are populated from Markdown files
The system SHALL parse story `.md` files in the workspace and render each story as a card in the column matching its status in `sprint-status.yml`.

#### Scenario: Card title comes from the story file
- **WHEN** a story `.md` file contains a top-level H1 heading or a `title` frontmatter field
- **THEN** the card displays that title as its primary label

#### Scenario: Card status comes from sprint YAML
- **WHEN** `sprint-status.yml` contains an entry for a story's identifier
- **THEN** the card is placed in the column corresponding to that status value

#### Scenario: Story with no YAML entry defaults to Todo
- **WHEN** a story `.md` file has no corresponding entry in `sprint-status.yml`
- **THEN** the card is rendered in the Todo column

#### Scenario: Card displays story metadata
- **WHEN** a story `.md` file contains frontmatter fields (e.g., `assignee`, `priority`, `labels`)
- **THEN** the card displays those fields as secondary metadata below the title

### Requirement: Markdown files are never modified by the extension
The system SHALL treat story `.md` files as read-only; all writes SHALL be limited to `sprint-status.yml`.

#### Scenario: Extension does not write to Markdown files
- **WHEN** the user performs any action in the Kanban board (drag, click, etc.)
- **THEN** no `.md` file is created, modified, or deleted as a result
