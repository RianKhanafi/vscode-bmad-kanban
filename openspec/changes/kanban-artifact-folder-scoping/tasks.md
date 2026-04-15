## 1. Scope File Discovery to Artifact Folders

- [x] 1.1 In `src/StoryParser.ts → collectMdFiles()`, add a helper `isInArtifactFolder(filePath: string): boolean` that returns true when the path contains `implementation-artifacts`, `planning-artifacts`, `mockups`, or `_mockups` as a path segment
- [x] 1.2 Skip any file that fails `isInArtifactFolder` before recursing or collecting it
- [x] 1.3 Return the source folder type (`'ticket' | 'document' | 'mockup'`) alongside each discovered file path so downstream consumers know how to classify each card

## 2. Derive Card Type from Source Folder

- [x] 2.1 Update `StoryParser.parse()` (or the caller in `KanbanPanel`) to accept and attach the source folder type to each parsed card
- [x] 2.2 In `src/BoardDataAggregator.ts`, replace the existing type-detection heuristic (numeric prefix / `status:` field presence) with the explicit folder-based type when available
- [x] 2.3 Ensure `planning-artifacts` cards flow into the Documents column and `implementation-artifacts` cards flow into the standard ticket columns as before

## 3. Add Mockups Board

- [x] 3.1 In `src/BoardDataAggregator.ts`, collect all `mockup`-typed cards into a separate `mockupsCards` array
- [x] 3.2 Add a `hasMockups: boolean` flag to the board data payload sent to the webview (true when `mockupsCards.length > 0`)
- [x] 3.3 In the webview, add a "Mockups" tab to the board navigation that renders `mockupsCards` in a simple grid/list layout
- [x] 3.4 Conditionally hide the Mockups tab when `hasMockups === false`

## 4. Scope File Watchers

- [x] 4.1 In `src/KanbanPanel.ts`, replace the `**/*.md` watcher with four scoped watchers: `**/implementation-artifacts/**/*.md`, `**/planning-artifacts/**/*.md`, `**/mockups/**/*.md`, `**/_mockups/**/*.md`
- [x] 4.2 Ensure the `hasMockups` flag is recomputed whenever a file watcher fires (so the Mockups tab appears/disappears dynamically)

## 5. Empty State for Non-BMAD Workspaces

- [x] 5.1 Detect at load time whether any recognized artifact folder exists in the workspace
- [x] 5.2 If none found, send an `emptyState: true` flag with the board payload
- [x] 5.3 In the webview, render a helpful message when `emptyState === true` explaining the expected BMAD folder structure (`implementation-artifacts/`, `planning-artifacts/`, `mockups/`)

## 6. Verification

- [ ] 6.1 Open a BMAD project in VS Code and confirm only files from the three artifact folder types appear on the board
- [ ] 6.2 Create a `mockups/` folder with a `.md` file and confirm the Mockups tab appears; delete the folder and confirm the tab hides
- [ ] 6.3 Edit a README at workspace root and confirm the board does not refresh
- [ ] 6.4 Open a non-BMAD workspace and confirm the empty-state guidance message appears
