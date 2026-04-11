## 1. Extension Scaffolding

- [x] 1.1 Initialize VS Code extension project with `yo code` (TypeScript, no webpack)
- [x] 1.2 Add dependencies: `gray-matter`, `js-yaml`, `react`, `react-dom`, `@vscode/webview-ui-toolkit`
- [x] 1.3 Add dev dependencies: `esbuild` for WebView bundle, `@types/js-yaml`, `@types/react`, `@types/react-dom`
- [x] 1.4 Configure `esbuild` build script to bundle the React WebView app into `dist/webview.js`
- [x] 1.5 Register the `bmad-kanban.openBoard` command in `package.json` contributes section

## 2. Sprint State Adapter

- [x] 2.1 Create `src/SprintStateAdapter.ts` with `read(filePath)` method that parses `sprint-status.yml` using `js-yaml` and returns a `Record<storyId, status>` map
- [x] 2.2 Implement `write(filePath, stateMap)` method on `SprintStateAdapter` that serializes the updated map back to `sprint-status.yml` using `js-yaml.dump` with `lineWidth: -1`
- [x] 2.3 Add error handling for missing or malformed YAML (return empty map on read failure; surface write errors to the user via `vscode.window.showErrorMessage`)

## 3. Story File Parser

- [x] 3.1 Create `src/StoryParser.ts` with a `parse(filePath)` function that uses `gray-matter` to extract frontmatter and the first H1 heading from a story `.md` file
- [x] 3.2 Return a `StoryCard` type: `{ id: string, title: string, filePath: string, metadata: Record<string, unknown> }`
- [x] 3.3 Implement `discoverStories(workspaceRoot)` that globs for `**/*.md` files (excluding `node_modules`) and returns an array of `StoryCard` objects

## 4. Board Data Aggregator

- [x] 4.1 Create `src/BoardDataAggregator.ts` that calls `discoverStories` and `SprintStateAdapter.read` and merges them into a `BoardState` type: `{ columns: { [status: string]: StoryCard[] } }`
- [x] 4.2 Stories with no YAML entry are assigned to the `todo` column by default
- [x] 4.3 Export a `getBoardState(workspaceRoot, yamlPath): BoardState` function used by the extension host

## 5. WebView Panel (Extension Host)

- [x] 5.1 Create `src/KanbanPanel.ts` implementing a singleton `KanbanPanel` class with a static `createOrShow(context)` method
- [x] 5.2 In `createOrShow`, call `vscode.window.createWebviewPanel` with `enableScripts: true` and a strict CSP nonce
- [x] 5.3 On panel creation, call `getBoardState` and send initial data to the WebView via `panel.webview.postMessage({ type: 'boardLoaded', data: boardState })`
- [x] 5.4 Handle `moveCard` messages from the WebView: update `sprint-status.yml` via `SprintStateAdapter.write`, then post a `boardLoaded` message with refreshed state
- [x] 5.5 Handle `openFile` messages from the WebView: call `vscode.workspace.openTextDocument` + `vscode.window.showTextDocument` for the given file path; show an error message if the file no longer exists
- [x] 5.6 Dispose the panel and all watchers on `panel.onDidDispose`

## 6. File System Watchers

- [x] 6.1 In `KanbanPanel`, create a `vscode.FileSystemWatcher` for `**/*.md` (create, change, delete events)
- [x] 6.2 Create a second watcher for `sprint-status.yml` (change event)
- [x] 6.3 Debounce watcher callbacks with a 300 ms delay before re-calling `getBoardState` and posting a `boardLoaded` message to the WebView
- [x] 6.4 Register both watchers in the panel's disposable array so they are disposed with the panel

## 7. React WebView UI

- [x] 7.1 Create `webview-src/App.tsx` with a `Board` component that receives `BoardState` via `window.acquireVsCodeApi` message listener
- [x] 7.2 Implement `Column` component that renders a column header and a list of `Card` items
- [x] 7.3 Implement `Card` component that displays title and metadata; attach `onClick` to post `{ type: 'openFile', filePath }` to the extension host
- [x] 7.4 Implement HTML5 drag-and-drop on `Card` (`draggable`, `onDragStart`) and drop zone on `Column` (`onDragOver`, `onDrop`)
- [x] 7.5 On successful drop, post `{ type: 'moveCard', storyId, newStatus }` to the extension host and optimistically update local component state
- [x] 7.6 Revert optimistic state update if a `moveError` message is received from the extension host
- [x] 7.7 Apply VS Code theme CSS variables (`--vscode-*`) to board, column, and card styles for theme compatibility

## 8. Extension Entry Point

- [x] 8.1 In `src/extension.ts`, register the `bmad-kanban.openBoard` command to call `KanbanPanel.createOrShow(context)`
- [x] 8.2 Add `KanbanPanel` to `context.subscriptions` so it is disposed on extension deactivation

## 9. Testing

- [x] 9.1 Write unit tests for `SprintStateAdapter.read` and `write` with valid, empty, and malformed YAML fixtures
- [x] 9.2 Write unit tests for `StoryParser.parse` with frontmatter-only, H1-only, and combined fixtures
- [x] 9.3 Write unit tests for `BoardDataAggregator.getBoardState` verifying default todo column assignment
- [x] 9.4 Write a smoke test that activates the extension and asserts the `bmad-kanban.openBoard` command is registered

## 10. Packaging & Documentation

- [x] 10.1 Add `.vscodeignore` to exclude `webview-src/`, `node_modules/`, and test fixtures from the VSIX bundle
- [x] 10.2 Update `README.md` with setup instructions, required BMAD file structure, and usage guide
- [x] 10.3 Run `vsce package` and verify the `.vsix` installs and activates without errors in a clean VS Code instance
