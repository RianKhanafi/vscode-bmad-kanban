## 1. Keyboard Navigation State

- [x] 1.1 Add `focusedCardId: string | null` state to `App`
- [x] 1.2 Add `tabIndex={0}` and `onFocus` to each `Card` div to allow focus
- [x] 1.3 Apply `.card-focused` class (visible focus ring) when `card.id === focusedCardId`
- [x] 1.4 Add global `keydown` listener in `App` to handle arrow navigation
- [x] 1.5 Implement `moveFocus(direction)` helper using flattened ordered card list
- [x] 1.6 Handle `Enter` → open modal for focused card
- [x] 1.7 Handle `O` → post `openFile` for focused card

## 2. Undo Toast

- [x] 2.1 Add `undoState: { storyId: string; fromStatus: string; title: string } | null` state to `App`
- [x] 2.2 On `moveCard` dispatch (drag or context menu), capture `{ storyId, fromStatus, title }` into `undoState`
- [x] 2.3 Set a 5-second `setTimeout` to clear `undoState`; cancel previous timer on new move
- [x] 2.4 Render `<UndoToast>` component when `undoState` is non-null
- [x] 2.5 On Undo click, dispatch reverse `moveCard` and clear `undoState`
- [x] 2.6 Add CSS for `.undo-toast` (fixed bottom-center position)

## 3. Right-Click Context Menu

- [x] 3.1 Add `contextMenu: { x: number; y: number; storyId: string } | null` state to `App`
- [x] 3.2 Add `onContextMenu` handler to `Card` that sets `contextMenu` state and calls `event.preventDefault()`
- [x] 3.3 Render `<ContextMenu>` at `{ x, y }` via `position: fixed` when `contextMenu` is non-null
- [x] 3.4 List each column from `COLUMN_ORDER` as a "Move to <label>" menu item
- [x] 3.5 On item click, dispatch `moveCard` and clear `contextMenu` state
- [x] 3.6 Dismiss context menu on outside click (`mousedown` on overlay) or `Escape` key
- [x] 3.7 Flip menu position left/upward when it would overflow the viewport edge
- [x] 3.8 Add CSS for `.context-menu`, `.context-menu-item`, `.context-menu-overlay`

## 4. Build & Verify

- [x] 4.1 Run `npm run build` — confirm no TypeScript errors
- [x] 4.2 Verify arrow keys move focus ring between cards
- [x] 4.3 Verify `Enter` opens modal and `O` opens file for focused card
- [x] 4.4 Verify undo toast appears after drag-and-drop and Undo reverts the move
- [x] 4.5 Verify toast auto-dismisses after 5 seconds
- [x] 4.6 Verify right-click menu appears and moves card correctly
- [x] 4.7 Verify menu dismisses on outside click and Escape
- [x] 4.8 Package VSIX with `vsce package --no-dependencies --allow-missing-repository`
