## ADDED Requirements

### Requirement: File discovery restricted to artifact folders
The system SHALL only load `.md` files that reside within one of the recognized artifact folder roots: `implementation-artifacts`, `planning-artifacts`, `mockups`, or `_mockups`. Files located outside these folder roots SHALL be ignored regardless of their content.

#### Scenario: File inside implementation-artifacts is loaded
- **WHEN** a `.md` file exists at any path containing `implementation-artifacts` as a path segment
- **THEN** the file SHALL be parsed and included in the board as a ticket

#### Scenario: File inside planning-artifacts is loaded
- **WHEN** a `.md` file exists at any path containing `planning-artifacts` as a path segment
- **THEN** the file SHALL be parsed and included in the board as a planning document

#### Scenario: File outside all artifact folders is ignored
- **WHEN** a `.md` file exists outside `implementation-artifacts`, `planning-artifacts`, `mockups`, and `_mockups`
- **THEN** the file SHALL NOT appear on any board view

#### Scenario: README at workspace root is ignored
- **WHEN** a `README.md` exists at the workspace root
- **THEN** the file SHALL NOT appear on any board view

### Requirement: Card type derived from source folder
The system SHALL determine a card's type based on the artifact folder it resides in, not from frontmatter heuristics or filename patterns.

#### Scenario: implementation-artifacts file treated as ticket
- **WHEN** a `.md` file is loaded from an `implementation-artifacts` folder
- **THEN** the card SHALL be treated as a ticket and rendered on the Kanban, Sprint, and Swimlane boards

#### Scenario: planning-artifacts file treated as document
- **WHEN** a `.md` file is loaded from a `planning-artifacts` folder
- **THEN** the card SHALL be treated as a planning document

#### Scenario: mockups file treated as mockup card
- **WHEN** a `.md` file is loaded from a `mockups` or `_mockups` folder
- **THEN** the card SHALL be treated as a mockup and rendered only on the Mockups board

### Requirement: Mockups board tab conditionally visible
The system SHALL show a "Mockups" board tab only when at least one `mockups` or `_mockups` folder is detected in the workspace. When no such folder exists, the tab SHALL be hidden.

#### Scenario: Mockups tab shown when folder exists
- **WHEN** the workspace contains at least one folder named `mockups` or `_mockups`
- **THEN** the Mockups board tab SHALL be visible in the board navigation

#### Scenario: Mockups tab hidden when no folder exists
- **WHEN** the workspace contains no folder named `mockups` or `_mockups`
- **THEN** the Mockups board tab SHALL NOT be rendered in the board navigation

#### Scenario: Mockups tab appears dynamically when folder is created
- **WHEN** a user creates a `mockups` or `_mockups` folder and adds a `.md` file inside it
- **THEN** the Mockups board tab SHALL appear without requiring a manual refresh

#### Scenario: Mockups tab disappears dynamically when folder is removed
- **WHEN** the last `.md` file is removed from the `mockups` or `_mockups` folder (or the folder itself is deleted)
- **THEN** the Mockups board tab SHALL be hidden without requiring a manual refresh

### Requirement: Both mockups and _mockups folders supported
The system SHALL treat both `mockups` and `_mockups` folder names as valid mockup roots and merge their contents into a single Mockups board.

#### Scenario: Files from both mockup folder variants appear on the same board
- **WHEN** the workspace has both a `mockups/` folder and a `_mockups/` folder each containing `.md` files
- **THEN** all files from both folders SHALL appear together on the Mockups board

### Requirement: File watchers scoped to artifact folders
The system SHALL register file system watchers scoped to the artifact folder paths rather than watching all `.md` files workspace-wide.

#### Scenario: Change to file outside artifact folders does not trigger refresh
- **WHEN** a `.md` file outside all artifact folders is created, modified, or deleted
- **THEN** the board SHALL NOT refresh

#### Scenario: Change inside implementation-artifacts triggers refresh
- **WHEN** a `.md` file inside `implementation-artifacts` is created, modified, or deleted
- **THEN** the board SHALL refresh to reflect the change

### Requirement: Empty state guidance when no artifact folders found
The system SHALL display a helpful empty-state message when no recognized artifact folders are found in the workspace.

#### Scenario: Empty state shown for non-BMAD workspace
- **WHEN** the workspace contains no `implementation-artifacts`, `planning-artifacts`, `mockups`, or `_mockups` folders
- **THEN** the board SHALL display a message explaining the expected folder structure instead of an empty board
