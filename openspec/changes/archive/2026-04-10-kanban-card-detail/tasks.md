## 1. Modal State & Card Context

- [x] 1.1 Add `currentStatus` prop to `PreviewModal` (the column the card came from)
- [x] 1.2 Build `idToCard` reverse lookup map in `App` from `boardState` (id → StoryCard with filePath)
- [x] 1.3 Pass `idToCard` map to `PreviewModal` for linked story resolution

## 2. Inline Status Dropdown

- [x] 2.1 Add status `<select>` element to modal header pre-selected with `currentStatus`
- [x] 2.2 On change, dispatch `moveCard` PostMessage then call `onClose()`
- [x] 2.3 Skip dispatch if selected value equals `currentStatus`
- [x] 2.4 Style the select to match VS Code theme variables

## 3. Effort Estimate Bar

- [x] 3.1 Write `parseEffort(value: string): { low: number; high: number } | null` utility
- [x] 3.2 Handle `"N-M hours"` and `"N hours"` formats; return null for unparseable strings
- [x] 3.3 Render effort bar as a CSS div with two segments (unfilled + fill) when non-null
- [x] 3.4 Clamp values to 40h max; display the raw string as a label beside the bar

## 4. Copy File Path Button

- [x] 4.1 Add "Copy path" button to modal toolbar
- [x] 4.2 On click call `navigator.clipboard.writeText(filePath)`
- [x] 4.3 Toggle button label to "✓ Copied!" for 2 seconds then revert

## 5. Linked Story Chips

- [x] 5.1 Parse `related` metadata field (comma-split, trim each ID)
- [x] 5.2 Render each ID as a chip; grey out chips whose ID is not in `idToCard`
- [x] 5.3 On chip click, request `getFileContent` for the resolved `filePath` and update modal content
- [x] 5.4 Add CSS for `.linked-chip` and `.linked-chip.disabled`

## 6. Build & Verify

- [x] 6.1 Run `npm run build` — confirm no TypeScript errors
- [x] 6.2 Verify status dropdown moves a card and closes modal
- [x] 6.3 Verify effort bar renders for a story with `estimated_effort`
- [x] 6.4 Verify copy button writes to clipboard and shows confirmation
- [x] 6.5 Verify linked chips navigate between story previews
- [x] 6.6 Package VSIX with `vsce package --no-dependencies --allow-missing-repository`
