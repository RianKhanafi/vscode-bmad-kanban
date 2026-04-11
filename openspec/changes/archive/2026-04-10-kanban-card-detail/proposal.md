## Why

The card preview modal shows file content but doesn't provide quick actions on the card itself. Users must drag cards to change status, can't easily estimate effort, and can't copy or link between related stories without switching to the editor.

## What Changes

- Add **inline status dropdown** in the modal header so cards can be moved without drag-and-drop
- Add **effort estimate visual bar** in the modal when an `estimated_effort` field is present
- Add **"Copy file path"** button in the modal toolbar
- Parse story body for `[[story-id]]` or `**Related:**` references and render them as clickable chips that open the referenced card's preview

## Capabilities

### New Capabilities
- `inline-status-change`: Dropdown in the preview modal allowing the user to change a card's status column; triggers the same `moveCard` flow as drag-and-drop
- `effort-estimate-bar`: Visual effort range bar rendered in the modal when `estimated_effort` metadata is present (e.g. `8-12 hours` → rendered as a filled range on a 0–40h scale)
- `modal-actions`: Copy file path button in modal toolbar; linked story chips parsed from card body referencing other story IDs

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `webview-src/App.tsx` — modal component gains status dropdown, effort bar, copy button, linked chips
- `webview-src/index.tsx` — CSS for effort bar, linked chips
- `src/KanbanPanel.ts` — `fileContent` response can optionally include `boardState` reference so modal knows valid column options
- No changes to YAML parsing or file writing beyond reusing existing `moveCard` message
