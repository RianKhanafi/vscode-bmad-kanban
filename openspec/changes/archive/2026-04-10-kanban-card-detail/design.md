## Context

The preview modal (`PreviewModal` in `App.tsx`) currently shows rendered markdown and two buttons: "Open File" and close. The `StoryCard` type already carries `metadata` with all parsed fields. The `moveCard` PostMessage protocol is already wired end-to-end. The card's `status` column is known at click time and passed as part of `handleCardClick`.

## Goals / Non-Goals

**Goals:**
- Status dropdown in modal header that sends a `moveCard` message and closes the modal
- Effort bar visualising a `"N-M hours"` range
- Copy-to-clipboard button for the file path
- Linked story chips from `**Related:**` body fields

**Non-Goals:**
- Editing any other metadata inline
- Persisting effort estimates back to the story file
- Resolving linked story IDs against cards in other workspaces

## Decisions

### Pass `card` + `status` directly to the modal (not via PostMessage)
The card metadata and current status are already in React state when the modal is opened. There is no need to add a new PostMessage round-trip to get column options — the `COLUMN_ORDER` constant is sufficient for dropdown options.

### Status change closes the modal immediately (optimistic)
After posting `moveCard`, the modal closes and the board applies an optimistic update identically to a drag-drop. No loading state needed.

### Effort bar uses a fixed 0–40h scale, parsing first integer from string
Effort strings like `"8-12 hours"` are parsed as `[low=8, high=12]`. The bar is a simple two-segment SVG or CSS div — no charting library. Values beyond 40h clamp to full width.

### Linked stories parsed from `related` metadata field
`parseBoldFields()` already extracts `**Related:** story-id-1, story-id-2`. Split on comma and render each as a chip. Clicking sends `getFileContent` for that story's file path — requires a reverse lookup (`id → filePath`) passed to the modal.

## Risks / Trade-offs

- **`id → filePath` reverse map** — `App` must build this from `boardState`; O(n) on re-render but negligible for typical board sizes
- **Clipboard API** — `navigator.clipboard.writeText` requires a secure context; VS Code webviews are always a secure context, so this is safe
- **Effort string format variation** — only the `"N-M hours"` and `"N hours"` formats are handled; other formats render no bar (graceful degradation)

## Migration Plan

No migration needed — all changes are additive UI within the existing modal component.

## Open Questions

- Should clicking a linked story chip open a new modal stack (modal-in-modal)? Approach: replace current modal content with the linked story (no stack needed for v1).
