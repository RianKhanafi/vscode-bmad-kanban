## Context

All current board interactions are mouse-only. The undo and context menu features reuse the existing `moveCard` PostMessage without any new backend protocol. Keyboard navigation requires tracking a `focusedCardId` in React state.

## Goals / Non-Goals

**Goals:**
- Arrow key card navigation with visible focus ring
- `Enter`/`O` shortcuts from focused card
- 5-second undo toast after drag-and-drop or context menu move
- Right-click context menu with "Move to…" submenu

**Non-Goals:**
- Global keyboard shortcuts that conflict with VS Code's own keybindings
- Undo history deeper than 1 move
- Context menu actions beyond "Move to…" column options

## Decisions

### Keyboard focus is tracked in React state (`focusedCardId`)
A single focused card at a time, navigated with arrow keys. Left/right moves between columns; up/down moves within a column. Tab key is not overridden — it remains for accessibility.

### Undo toast stores `{ storyId, fromStatus }` for 5 seconds
When `moveCard` is dispatched (drag or context menu), the previous status is captured into `undoState`. The toast shows for 5 seconds then auto-clears. Clicking "Undo" dispatches a reverse `moveCard`. Only one undo operation is supported at a time.

### Context menu is a portal-rendered div positioned at mouse coordinates
On right-click, `event.preventDefault()` blocks the browser context menu and a custom `ContextMenu` component is rendered at `{ x: event.clientX, y: event.clientY }`. Clicking outside or pressing `Esc` dismisses it. It uses `position: fixed` to avoid scroll container clipping.

## Risks / Trade-offs

- **Arrow key conflicts with scrolling** — mitigated by calling `event.preventDefault()` only when a card is focused
- **Context menu clipping at viewport edge** — flip menu to left/above when it would overflow
- **Undo after file watcher refresh** — if the board refreshes within the 5-second window, the undo still works because it sends a new `moveCard` with the old status

## Migration Plan

Pure additive UI — no migration. Existing drag-and-drop and click bindings are unchanged.
