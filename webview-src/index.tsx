import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Inject VS Code theme-aware global styles
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 0;
    background: var(--vscode-editor-background);
    color: var(--vscode-foreground);
    font-family: var(--vscode-font-family, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    height: 100vh;
    overflow: hidden;
  }

  .board-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .board {
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 12px 16px 16px;
    flex: 1;
    min-height: 0;
    box-sizing: border-box;
    overflow-x: auto;
    align-items: stretch;
  }

  .column {
    flex: 0 0 260px;
    display: flex;
    flex-direction: column;
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    border: 1px solid var(--vscode-panel-border, transparent);
    border-radius: 6px;
    padding: 8px;
    min-height: 200px;
    max-height: 100%;
    overflow: hidden;
  }

  .column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 10px;
    border-bottom: 1px solid var(--vscode-panel-border, transparent);
    margin-bottom: 8px;
    flex-shrink: 0;
    gap: 4px;
  }

  .column-header-left {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    flex: 1;
  }

  .column-title-text {
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .column-badge {
    font-size: 10px;
    font-weight: 600;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    padding: 1px 5px;
    border-radius: 8px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .column-collapse-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--vscode-descriptionForeground);
    font-size: 9px;
    padding: 2px 3px;
    border-radius: 3px;
    flex-shrink: 0;
    line-height: 1;
  }

  .column-collapse-btn:hover {
    background: var(--vscode-toolbar-hoverBackground);
  }

  .column-sort-select {
    background: transparent;
    border: none;
    color: var(--vscode-descriptionForeground);
    font-size: 10px;
    cursor: pointer;
    padding: 1px 2px;
    flex-shrink: 0;
    max-width: 56px;
  }

  .column-sort-select:hover {
    color: var(--vscode-foreground);
  }

  .column.collapsed {
    flex: 0 0 44px;
    min-width: 44px;
    padding: 8px 4px;
  }

  .column.collapsed .column-header {
    flex-direction: column;
    align-items: center;
    padding: 4px 0 4px;
    border-bottom: none;
    margin-bottom: 0;
  }

  .column.collapsed .column-header-left {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .column.collapsed .column-title-text {
    writing-mode: vertical-lr;
    text-orientation: mixed;
    transform: rotate(180deg);
    font-size: 10px;
    max-height: 120px;
    text-overflow: clip;
  }

  .column-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    overflow-y: auto;
    padding-right: 2px;
  }

  .card {
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, transparent);
    border-radius: 4px;
    padding: 10px 12px;
    cursor: pointer;
    user-select: none;
    transition: border-color 0.1s;
  }

  .card:hover {
    border-color: var(--vscode-focusBorder);
  }

  .card[draggable]:active {
    opacity: 0.6;
  }

  .card-title {
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--vscode-foreground);
  }

  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }

  .meta-tag {
    font-size: 11px;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    padding: 1px 6px;
    border-radius: 10px;
  }

  .card-header-row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }

  .status-badge {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #fff;
    padding: 2px 7px;
    border-radius: 10px;
    white-space: nowrap;
  }

  .card-date {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 4px;
  }

  .card-description {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.4;
    margin-top: 4px;
    opacity: 0.85;
  }

  .column-documents {
    opacity: 0.75;
    border-style: dashed;
  }

  .card-document {
    cursor: pointer;
    opacity: 0.85;
  }

  .card-document:hover {
    opacity: 1;
    border-color: var(--vscode-focusBorder);
  }

  /* ---- Modal ---- */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .modal {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border, #444);
    border-radius: 8px;
    width: 100%;
    max-width: 760px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--vscode-panel-border, #444);
    flex-shrink: 0;
    gap: 12px;
  }

  .modal-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--vscode-panel-border, #444);
    flex-shrink: 0;
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
  }

  .modal-meta-chip {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    padding: 2px 8px;
    border-radius: 10px;
    white-space: nowrap;
  }

  .modal-title {
    font-weight: 600;
    font-size: 13px;
    color: var(--vscode-foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .modal-btn {
    border: 1px solid var(--vscode-button-border, transparent);
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }

  .modal-btn-open {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }

  .modal-btn-open:hover {
    background: var(--vscode-button-hoverBackground);
  }

  .modal-btn-close {
    background: var(--vscode-button-secondaryBackground, #3c3c3c);
    color: var(--vscode-button-secondaryForeground, #ccc);
  }

  .modal-btn-close:hover {
    background: var(--vscode-button-secondaryHoverBackground, #505050);
  }

  .modal-body {
    overflow-y: auto;
    padding: 20px 24px;
    flex: 1;
    color: var(--vscode-foreground);
    line-height: 1.6;
  }

  /* Markdown body styles */
  .markdown-body h1, .markdown-body h2, .markdown-body h3,
  .markdown-body h4, .markdown-body h5, .markdown-body h6 {
    margin: 1em 0 0.4em;
    font-weight: 600;
    line-height: 1.3;
  }
  .markdown-body h1 { font-size: 1.5em; border-bottom: 1px solid var(--vscode-panel-border, #444); padding-bottom: 0.3em; }
  .markdown-body h2 { font-size: 1.25em; border-bottom: 1px solid var(--vscode-panel-border, #444); padding-bottom: 0.2em; }
  .markdown-body p { margin: 0.6em 0; }
  .markdown-body ul, .markdown-body ol { padding-left: 1.5em; margin: 0.5em 0; }
  .markdown-body li { margin: 0.2em 0; }
  .markdown-body code {
    background: var(--vscode-textCodeBlock-background, rgba(128,128,128,0.15));
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }
  .markdown-body pre {
    background: var(--vscode-textCodeBlock-background, rgba(128,128,128,0.15));
    padding: 12px 16px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.8em 0;
  }
  .markdown-body pre code { background: none; padding: 0; }
  .markdown-body blockquote {
    border-left: 3px solid var(--vscode-focusBorder, #007acc);
    margin: 0.8em 0;
    padding: 4px 12px;
    color: var(--vscode-descriptionForeground);
  }
  .markdown-body table { border-collapse: collapse; width: 100%; margin: 0.8em 0; }
  .markdown-body th, .markdown-body td {
    border: 1px solid var(--vscode-panel-border, #444);
    padding: 6px 12px;
    text-align: left;
  }
  .markdown-body th { background: var(--vscode-sideBar-background); font-weight: 600; }
  .markdown-body hr { border: none; border-top: 1px solid var(--vscode-panel-border, #444); margin: 1.2em 0; }
  .markdown-body a { color: var(--vscode-textLink-foreground, #3794ff); }
  .markdown-body strong { font-weight: 600; }

  /* ---- Filter Bar ---- */
  .filter-bar {
    padding: 8px 16px 6px;
    border-bottom: 1px solid var(--vscode-panel-border, transparent);
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-search-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-search {
    flex: 1;
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, transparent);
    color: var(--vscode-input-foreground);
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 12px;
    font-family: inherit;
    outline: none;
  }

  .filter-search:focus {
    border-color: var(--vscode-focusBorder);
  }

  .filter-clear-btn {
    background: none;
    border: 1px solid var(--vscode-input-border, transparent);
    color: var(--vscode-descriptionForeground);
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
  }

  .filter-clear-btn:hover {
    border-color: var(--vscode-focusBorder);
    color: var(--vscode-foreground);
  }

  .filter-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .filter-group-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--vscode-descriptionForeground);
    margin-right: 2px;
    white-space: nowrap;
  }

  .filter-chip {
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: background 0.1s, border-color 0.1s;
  }

  .filter-chip:hover {
    border-color: var(--vscode-focusBorder);
  }

  .filter-chip.active {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: transparent;
  }

  /* ---- Stats Bar (tasks 5.1–5.2) ---- */
  .board-stats-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 6px 16px;
    border-bottom: 1px solid var(--vscode-panel-border, transparent);
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    flex-shrink: 0;
    flex-wrap: wrap;
    min-height: 38px;
  }

  /* ---- View Switcher (task 6.1) ---- */
  .view-switcher {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .view-btn {
    background: none;
    border: 1px solid var(--vscode-input-border, #3c3c3c);
    color: var(--vscode-descriptionForeground);
    padding: 3px 10px;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    border-radius: 0;
  }

  .view-btn:first-child { border-radius: 4px 0 0 4px; }
  .view-btn:last-child  { border-radius: 0 4px 4px 0; }

  .view-btn.active {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: var(--vscode-button-background);
  }

  .view-btn:hover:not(.active) {
    background: var(--vscode-toolbar-hoverBackground);
    color: var(--vscode-foreground);
  }

  /* ---- Status Distribution Bar (tasks 2.3–2.5) ---- */
  .dist-bar {
    display: flex;
    flex: 1;
    min-width: 120px;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    gap: 1px;
  }

  .dist-bar-segment {
    height: 100%;
    border-radius: 2px;
    transition: flex 0.3s ease;
    min-width: 2px;
  }

  /* ---- Stale Badge (task 3.4) ---- */
  .stale-badge {
    font-size: 10px;
    font-weight: 600;
    background: #7a5c12;
    color: #f0c060;
    padding: 1px 6px;
    border-radius: 8px;
    white-space: nowrap;
    margin-left: auto;
  }

  /* ---- Burndown Sparkline (tasks 4.4–4.5) ---- */
  .sparkline-container {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .sparkline-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
  }

  .sparkline-svg {
    display: block;
  }

  .sparkline-count {
    font-size: 11px;
    font-weight: 600;
    color: var(--vscode-testing-iconPassed, #4caf50);
    white-space: nowrap;
  }

  .sparkline-no-data {
    font-size: 10px;
    color: var(--vscode-disabledForeground, #555);
    font-style: italic;
  }

  /* ---- Modal: status select (task 2.4) ---- */
  .modal-status-select {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, #3c3c3c);
    border-radius: 4px;
    padding: 3px 6px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
  }

  .modal-status-select:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
  }

  /* ---- Modal: copy button (task 4.3) ---- */
  .modal-btn-copy {
    background: var(--vscode-button-secondaryBackground, #3c3c3c);
    color: var(--vscode-button-secondaryForeground, #ccc);
  }

  .modal-btn-copy:hover {
    background: var(--vscode-button-secondaryHoverBackground, #505050);
  }

  .modal-btn-copy.copied {
    background: var(--vscode-testing-iconPassed, #4caf50);
    color: #fff;
  }

  /* ---- Effort bar (tasks 3.3–3.4) ---- */
  .effort-bar-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 16px;
    border-bottom: 1px solid var(--vscode-panel-border, #3c3c3c);
    flex-shrink: 0;
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
  }

  .effort-bar-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
    min-width: 80px;
  }

  .effort-bar-track {
    flex: 1;
    height: 6px;
    background: var(--vscode-input-background);
    border-radius: 3px;
    position: relative;
    overflow: visible;
  }

  .effort-bar-fill {
    position: absolute;
    top: 0;
    height: 100%;
    background: var(--vscode-progressBar-background, #0d6efd);
    border-radius: 3px;
    min-width: 4px;
  }

  /* ---- Linked story chips (tasks 5.2–5.4) ---- */
  .modal-linked {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 16px;
    border-bottom: 1px solid var(--vscode-panel-border, #3c3c3c);
    flex-shrink: 0;
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
  }

  .modal-linked-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
  }

  .linked-chip {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    border: 1px solid var(--vscode-input-border, #3c3c3c);
    background: var(--vscode-input-background);
    color: var(--vscode-textLink-foreground, #4fc1ff);
    cursor: pointer;
    font-family: inherit;
    transition: background 0.1s;
  }

  .linked-chip:hover:not(.disabled) {
    background: var(--vscode-inputOption-hoverBackground);
    border-color: var(--vscode-focusBorder);
  }

  .linked-chip.disabled {
    opacity: 0.4;
    cursor: default;
    color: var(--vscode-disabledForeground, #888);
    pointer-events: none;
  }

  .card:focus {
    outline: 2px solid var(--vscode-focusBorder, #007acc);
    outline-offset: 1px;
  }

  .card-focused {
    outline: 2px solid var(--vscode-focusBorder, #007acc);
    outline-offset: 1px;
  }

  /* ---- Undo Toast ---- */
  .undo-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--vscode-notifications-background, #1e1e1e);
    border: 1px solid var(--vscode-notifications-border, #444);
    color: var(--vscode-notifications-foreground, #ccc);
    border-radius: 6px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 600;
    font-size: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    white-space: nowrap;
  }

  .undo-toast-msg {
    color: var(--vscode-foreground);
  }

  .undo-toast-btn {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
  }

  .undo-toast-btn:hover {
    background: var(--vscode-button-hoverBackground);
  }

  .undo-toast-dismiss {
    background: none;
    border: none;
    color: var(--vscode-descriptionForeground);
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    font-family: inherit;
  }

  /* ---- Context Menu ---- */
  .context-menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 550;
  }

  .context-menu {
    position: fixed;
    z-index: 560;
    background: var(--vscode-menu-background, #252526);
    border: 1px solid var(--vscode-menu-border, #454545);
    border-radius: 4px;
    padding: 4px 0;
    min-width: 160px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }

  .context-menu-item {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    color: var(--vscode-menu-foreground, #ccc);
    padding: 6px 16px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
  }

  .context-menu-item:hover:not(:disabled) {
    background: var(--vscode-menu-selectionBackground, #094771);
    color: var(--vscode-menu-selectionForeground, #fff);
  }

  .context-menu-item:disabled,
  .context-menu-item.current {
    opacity: 0.4;
    cursor: default;
  }

  /* ---- Sprint View (task 6.2) ---- */
  .sprint-view {
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 12px 16px 16px;
    flex: 1;
    min-height: 0;
    overflow-x: auto;
    align-items: flex-start;
  }

  .sprint-group {
    flex: 0 0 260px;
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    border: 1px solid var(--vscode-panel-border, transparent);
    border-radius: 6px;
    padding: 8px;
    max-height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sprint-group-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--vscode-panel-border, transparent);
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .sprint-group-title {
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--vscode-descriptionForeground);
  }

  .sprint-group-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    flex: 1;
  }

  /* ---- Progress Bar (tasks 6.2 + 4.3) ---- */
  .progress-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 6px;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--vscode-testing-iconPassed, #4caf50);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .progress-bar {
    background: var(--vscode-input-background);
    border-radius: 3px;
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .progress-bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: var(--vscode-testing-iconPassed, #4caf50);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .progress-bar-label {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    margin-left: auto;
    padding: 0 4px;
  }

  /* ---- Swimlane View (task 6.3) ---- */
  .swimlane-grid {
    display: grid;
    gap: 1px;
    padding: 12px 16px;
    overflow: auto;
    flex: 1;
    align-content: start;
    background: var(--vscode-panel-border, #2d2d2d);
  }

  .swimlane-corner {
    background: var(--vscode-editor-background);
  }

  .swimlane-col-header {
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--vscode-descriptionForeground);
    padding: 8px 10px;
    text-align: center;
  }

  .swimlane-row-header {
    background: var(--vscode-sideBar-background, var(--vscode-editor-background));
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
    min-width: 160px;
  }

  .swimlane-epic-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--vscode-foreground);
    word-break: break-word;
  }

  .swimlane-cell {
    background: var(--vscode-editor-background);
    padding: 6px;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    max-height: 240px;
  }

  .swimlane-cell:empty::after {
    content: '';
    display: block;
    height: 100%;
    min-height: 40px;
  }

  /* ---- Overdue card (task 6.4) ---- */
  .card.overdue {
    border-left: 3px solid var(--vscode-testing-iconFailed, #e74c3c);
  }

  .overdue-badge {
    font-size: 10px;
    font-weight: 600;
    background: #5a1a1a;
    color: #f08080;
    padding: 1px 6px;
    border-radius: 8px;
    white-space: nowrap;
  }

  .file-error {
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--vscode-inputValidation-errorBackground);
    color: var(--vscode-inputValidation-errorForeground);
    border: 1px solid var(--vscode-inputValidation-errorBorder);
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  }

  /* ---- Empty State ---- */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 48px 32px;
    text-align: center;
    gap: 12px;
  }

  .empty-state-icon {
    font-size: 48px;
    line-height: 1;
    opacity: 0.7;
  }

  .empty-state-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--vscode-foreground);
  }

  .empty-state-body {
    font-size: 13px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.6;
    max-width: 480px;
  }

  .empty-state-body ul {
    text-align: left;
    margin: 8px 0 0;
    padding-left: 1.4em;
  }

  .empty-state-body li {
    margin: 4px 0;
  }

  .empty-state-body code {
    background: var(--vscode-textCodeBlock-background, rgba(128,128,128,0.15));
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 0.9em;
  }

  /* ---- Mockups Grid ---- */
  .mockups-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
    flex: 1;
    align-content: flex-start;
    overflow-y: auto;
  }

  .card-mockup {
    flex: 0 0 220px;
    background: var(--vscode-input-background);
    border: 1px dashed var(--vscode-input-border, #555);
    border-radius: 6px;
    padding: 12px 14px;
    cursor: pointer;
    user-select: none;
    transition: border-color 0.1s;
  }

  .card-mockup:hover {
    border-color: var(--vscode-focusBorder);
    border-style: solid;
  }

  .card-mockup:focus {
    outline: 2px solid var(--vscode-focusBorder, #007acc);
    outline-offset: 1px;
  }

  .card-mockup-type {
    font-size: 10px;
    font-weight: 600;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
`;
document.head.appendChild(style);

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<App />);
}
