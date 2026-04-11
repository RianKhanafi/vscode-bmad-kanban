## Why

The board requires mouse interaction for all actions — drag-and-drop to move cards, clicking to open the modal. Power users working primarily with a keyboard have no efficient way to navigate or act on cards. Additionally, accidental drags have no recovery path.

## What Changes

- Add **keyboard shortcuts**: arrow keys navigate between cards, `O` opens file, `Enter` opens modal, `Esc` closes modal (already done)
- Add **undo last move** — toast notification with an Undo button appears for 5 seconds after a drag-and-drop; clicking it reverts the move
- Add **right-click context menu** on cards — shows "Move to…" submenu with all column options

## Capabilities

### New Capabilities
- `keyboard-navigation`: Arrow-key focus movement across cards and columns; `Enter` opens preview modal; `O` opens file in editor; keyboard-accessible card selection state tracked in React
- `undo-move`: After each `moveCard` action, a toast is shown with the previous status and an Undo button; clicking Undo sends another `moveCard` reversing the change within a 5-second window
- `card-context-menu`: Right-click on any card opens a context menu with a "Move to…" option listing all columns; selecting a column moves the card using the same `moveCard` message as drag-and-drop

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `webview-src/App.tsx` — keyboard event handling, undo toast state, context menu component
- `webview-src/index.tsx` — CSS for toast, context menu overlay
- No backend changes; all actions reuse existing `moveCard` message protocol
