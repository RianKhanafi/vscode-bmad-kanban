import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { marked } from 'marked';
import { BoardState, StoryCard } from './types';

declare function acquireVsCodeApi(): {
    postMessage(msg: unknown): void;
};

const vscode = acquireVsCodeApi();

const COLUMN_ORDER = ['todo', 'in-progress', 'review', 'done'];
const COLUMN_LABELS: Record<string, string> = {
    'todo': 'Todo',
    'in-progress': 'In Progress',
    'review': 'Review',
    'done': 'Done',
    'documents': 'Documents'
};

// ---- Filter & Sort types -----------------------------------------------

type SortKey = 'none' | 'title' | 'date' | 'effort';

interface Filters {
    search: string;
    activeEpics: Set<string>;
    activeAssignees: Set<string>;
    activeTags: Set<string>;
}

interface FilterOptions {
    epics: string[];
    assignees: string[];
    tags: string[];
}

const EMPTY_FILTERS: Filters = {
    search: '',
    activeEpics: new Set(),
    activeAssignees: new Set(),
    activeTags: new Set(),
};

function deriveFilterOptions(state: BoardState): FilterOptions {
    // Epics come from epicGroups keys, sorted numerically (Epic 1, Epic 2...)
    const epics = Object.keys(state.epicGroups ?? {}).filter(e => e !== 'Unassigned').sort((a, b) => {
        const na = parseInt(a.replace(/^Epic\s+/i, ''), 10);
        const nb = parseInt(b.replace(/^Epic\s+/i, ''), 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
    });
    const assignees = new Set<string>();
    const tags = new Set<string>();
    for (const cards of Object.values(state.columns)) {
        for (const card of cards) {
            const a = card.metadata['assignee']; if (typeof a === 'string' && a) assignees.add(a);
            const t = card.metadata['tags'] ?? card.metadata['tag'] ?? card.metadata['label'];
            if (typeof t === 'string' && t) tags.add(t);
        }
    }
    return { epics, assignees: [...assignees].sort(), tags: [...tags].sort() };
}

function parseEffortLow(val: unknown): number {
    if (typeof val !== 'string') return Infinity;
    const m = val.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : Infinity;
}

function applyFilters(
    state: BoardState,
    filters: Filters,
    columnSort: Record<string, SortKey>
): BoardState {
    const q = filters.search.toLowerCase().trim();
    const filtered: BoardState = { columns: {} };

    for (const [col, cards] of Object.entries(state.columns)) {
        let result = cards.filter(card => {
            // search
            if (q) {
                const searchable = [card.title, card.id, ...Object.values(card.metadata).map(String)].join(' ').toLowerCase();
                if (!searchable.includes(q)) return false;
            }
            // epic filter — match against epicGroups reverse map
            if (filters.activeEpics.size > 0) {
                const cardEpic = Object.entries(state.epicGroups ?? {}).find(([, cards]) => cards.some(c => c.id === card.id))?.[0] ?? 'Unassigned';
                if (!filters.activeEpics.has(cardEpic)) return false;
            }
            // assignee filter
            if (filters.activeAssignees.size > 0) {
                const v = typeof card.metadata['assignee'] === 'string' ? card.metadata['assignee'] : '';
                if (!filters.activeAssignees.has(v)) return false;
            }
            // tag filter
            if (filters.activeTags.size > 0) {
                const v = String(card.metadata['tags'] ?? card.metadata['tag'] ?? card.metadata['label'] ?? '');
                if (!filters.activeTags.has(v)) return false;
            }
            return true;
        });

        // sort
        const sort = columnSort[col] ?? 'none';
        if (sort === 'title') {
            result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === 'date') {
            result = [...result].sort((a, b) => {
                const da = DATE_KEYS.map(k => a.metadata[k]).find(v => v) as string | undefined;
                const db = DATE_KEYS.map(k => b.metadata[k]).find(v => v) as string | undefined;
                if (!da && !db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                return new Date(db).getTime() - new Date(da).getTime();
            });
        } else if (sort === 'effort') {
            result = [...result].sort((a, b) => {
                const EFFORT_KEYS = ['estimated_effort', 'estimate', 'effort'];
                const ea = EFFORT_KEYS.map(k => a.metadata[k]).find(v => v);
                const eb = EFFORT_KEYS.map(k => b.metadata[k]).find(v => v);
                return parseEffortLow(ea) - parseEffortLow(eb);
            });
        }

        filtered.columns[col] = result;
    }
    return filtered;
}

// ---- Filter Bar ---------------------------------------------------------

interface FilterBarProps {
    filters: Filters;
    options: FilterOptions;
    onChange: (f: Filters) => void;
}

function FilterBar({ filters, options, onChange }: FilterBarProps) {
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [searchInput, setSearchInput] = useState(filters.search);

    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setSearchInput(val);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            onChange({ ...filters, search: val });
        }, 150);
    }

    function toggleSet(set: Set<string>, val: string): Set<string> {
        const next = new Set(set);
        next.has(val) ? next.delete(val) : next.add(val);
        return next;
    }

    function clearAll() {
        setSearchInput('');
        onChange({ ...EMPTY_FILTERS });
    }

    const hasFilters = filters.search || filters.activeEpics.size || filters.activeAssignees.size || filters.activeTags.size;

    return (
        <div className="filter-bar">
            <div className="filter-search-row">
                <input
                    className="filter-search"
                    type="text"
                    placeholder="Search cards…"
                    value={searchInput}
                    onChange={handleSearch}
                />
                {hasFilters && (
                    <button className="filter-clear-btn" onClick={clearAll}>Clear all</button>
                )}
            </div>
            {options.epics.length > 0 && (
                <div className="filter-group">
                    <span className="filter-group-label">Epic</span>
                    {options.epics.map(v => (
                        <button
                            key={v}
                            className={`filter-chip${filters.activeEpics.has(v) ? ' active' : ''}`}
                            onClick={() => onChange({ ...filters, activeEpics: toggleSet(filters.activeEpics, v) })}
                        >{v}</button>
                    ))}
                </div>
            )}
            {options.assignees.length > 0 && (
                <div className="filter-group">
                    <span className="filter-group-label">Assignee</span>
                    {options.assignees.map(v => (
                        <button
                            key={v}
                            className={`filter-chip${filters.activeAssignees.has(v) ? ' active' : ''}`}
                            onClick={() => onChange({ ...filters, activeAssignees: toggleSet(filters.activeAssignees, v) })}
                        >{v}</button>
                    ))}
                </div>
            )}
            {options.tags.length > 0 && (
                <div className="filter-group">
                    <span className="filter-group-label">Tag</span>
                    {options.tags.map(v => (
                        <button
                            key={v}
                            className={`filter-chip${filters.activeTags.has(v) ? ' active' : ''}`}
                            onClick={() => onChange({ ...filters, activeTags: toggleSet(filters.activeTags, v) })}
                        >{v}</button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ---- Preview Modal ------------------------------------------------------

// Task 3.1–3.2: Parse "N-M hours" or "N hours" effort strings
function parseEffort(val: unknown): { low: number; high: number } | null {
    if (typeof val !== 'string') return null;
    const rangeM = val.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (rangeM) return { low: parseInt(rangeM[1], 10), high: parseInt(rangeM[2], 10) };
    const singleM = val.match(/(\d+)/);
    if (singleM) { const n = parseInt(singleM[1], 10); return { low: n, high: n }; }
    return null;
}

interface PreviewModalProps {
    card: StoryCard;
    currentStatus: string;
    filePath: string;
    content: string;
    onClose: () => void;
    onOpenFile: (filePath: string) => void;
    onMoveCard: (storyId: string, newStatus: string) => void;
    idToCard: Map<string, { card: StoryCard; status: string }>;
    onChipClick: (card: StoryCard, status: string) => void;
}

const ESTIMATE_KEYS = ['estimated_effort', 'estimate', 'effort', 'story_points', 'points'];
const MAX_EFFORT_H = 40;

function PreviewModal({ card, currentStatus, filePath, content, onClose, onOpenFile, onMoveCard, idToCard, onChipClick }: PreviewModalProps) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [copied, setCopied] = useState(false);

    const html = marked.parse(content) as string;
    const fileName = filePath.split('/').pop() ?? filePath;
    const statusColor = STATUS_COLORS[currentStatus] ?? '#6c757d';

    const estimateVal = ESTIMATE_KEYS.map(k => card.metadata[k]).find(v => v !== undefined && v !== null);
    const dateEntry = DATE_KEYS.map(k => [k, card.metadata[k]] as [string, unknown]).find(([, v]) => v !== undefined && v !== null);

    // Task 5.1: Parse related IDs from metadata
    const relatedRaw = card.metadata['related'] ?? card.metadata['relates_to'];
    const relatedIds: string[] = typeof relatedRaw === 'string' && relatedRaw.trim()
        ? relatedRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    // Task 3.3–3.4: Effort bar values
    const effortParsed = estimateVal !== undefined ? parseEffort(estimateVal) : null;

    // Sync status select when chip-navigation switches the card (task 1.1)
    useEffect(() => { setSelectedStatus(currentStatus); }, [card.id, currentStatus]);

    // Close on Escape key
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    // Task 2.1–2.3: Status dropdown handler
    function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);
        if (newStatus !== currentStatus) {
            onMoveCard(card.id, newStatus);
            onClose();
        }
    }

    // Task 4.2–4.3: Copy path with 2s confirmation
    async function handleCopyPath() {
        await navigator.clipboard.writeText(filePath);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{fileName}</span>
                    <div className="modal-actions">
                        {/* Task 2.1: Inline status dropdown */}
                        <select
                            className="modal-status-select"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            title="Move card to…"
                        >
                            {COLUMN_ORDER.map(col => (
                                <option key={col} value={col}>{COLUMN_LABELS[col] ?? col}</option>
                            ))}
                        </select>
                        {/* Task 4.1: Copy path button */}
                        <button
                            className={`modal-btn modal-btn-copy${copied ? ' copied' : ''}`}
                            onClick={handleCopyPath}
                            title="Copy file path"
                        >
                            {copied ? '✓ Copied!' : 'Copy path'}
                        </button>
                        <button
                            className="modal-btn modal-btn-open"
                            onClick={() => onOpenFile(filePath)}
                            title="Open file in editor"
                        >
                            ↗ Open File
                        </button>
                        <button
                            className="modal-btn modal-btn-close"
                            onClick={onClose}
                            title="Close preview"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="modal-meta">
                    <span className="status-badge" style={{ background: statusColor }}>{currentStatus}</span>
                    {estimateVal !== undefined && (
                        <span className="modal-meta-chip">⏱ {String(estimateVal)}</span>
                    )}
                    {dateEntry && (
                        <span className="modal-meta-chip">📅 {dateEntry[0]}: {String(dateEntry[1])}</span>
                    )}
                </div>
                {/* Task 3.3–3.4: Effort bar */}
                {effortParsed && (
                    <div className="effort-bar-row">
                        <span className="effort-bar-label">{String(estimateVal)}</span>
                        <div className="effort-bar-track">
                            <div
                                className="effort-bar-fill"
                                style={{
                                    left: `${(Math.min(effortParsed.low, MAX_EFFORT_H) / MAX_EFFORT_H) * 100}%`,
                                    width: effortParsed.low === effortParsed.high
                                        ? '4px'
                                        : `${((Math.min(effortParsed.high, MAX_EFFORT_H) - Math.min(effortParsed.low, MAX_EFFORT_H)) / MAX_EFFORT_H) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
                {/* Task 5.2–5.3: Linked story chips */}
                {relatedIds.length > 0 && (
                    <div className="modal-linked">
                        <span className="modal-linked-label">Related:</span>
                        {relatedIds.map(id => {
                            const resolved = idToCard.get(id);
                            return (
                                <button
                                    key={id}
                                    className={`linked-chip${resolved ? '' : ' disabled'}`}
                                    disabled={!resolved}
                                    onClick={() => resolved && onChipClick(resolved.card, resolved.status)}
                                    title={resolved ? `Open ${id}` : `Story ${id} not found`}
                                >{id}</button>
                            );
                        })}
                    </div>
                )}
                <div
                    className="modal-body markdown-body"
                    dangerouslySetInnerHTML={{ __html: html }}
                    onClick={(e) => {
                        const target = (e.target as HTMLElement).closest('a');
                        if (!target) return;
                        e.preventDefault();
                        const href = target.getAttribute('href');
                        if (!href) return;
                        if (/^https?:\/\//i.test(href)) {
                            vscode.postMessage({ type: 'openExternal', url: href });
                        } else if (/^file:\/\//i.test(href)) {
                            // file:/// URL — strip the scheme to get the absolute path
                            const filePart = href.replace(/^file:\/\//i, '').split('#')[0];
                            vscode.postMessage({ type: 'openFile', filePath: filePart });
                        } else {
                            // Strip #anchor fragment
                            const hrefPath = href.split('#')[0];
                            if (!hrefPath) return;
                            // Resolve relative path against the current file's directory
                            const dir = filePath.substring(0, filePath.lastIndexOf('/'));
                            const raw = hrefPath.startsWith('/') ? hrefPath : `${dir}/${hrefPath}`;
                            // Normalize .. and . segments
                            const parts: string[] = [];
                            for (const seg of raw.split('/')) {
                                if (seg === '..') parts.pop();
                                else if (seg !== '.') parts.push(seg);
                            }
                            vscode.postMessage({ type: 'openFile', filePath: parts.join('/') });
                        }
                    }}
                />
            </div>
        </div>
    );
}

// ---- Stats: Status Distribution Bar -----------------------------------

interface StatusDistributionBarProps {
    columns: { [status: string]: StoryCard[] };
}

function StatusDistributionBar({ columns }: StatusDistributionBarProps) {
    const segments = COLUMN_ORDER
        .filter(col => col !== 'documents')
        .map(col => ({ status: col, count: (columns[col] ?? []).length }))
        .filter(s => s.count > 0);

    const total = segments.reduce((sum, s) => sum + s.count, 0);
    if (total === 0) return null;

    return (
        <div className="dist-bar" title="Status distribution">
            {segments.map(({ status, count }) => {
                const pct = (count / total) * 100;
                const color = STATUS_COLORS[status] ?? '#6c757d';
                return (
                    <div
                        key={status}
                        className="dist-bar-segment"
                        style={{ flex: `${pct} 0 2px`, background: color }}
                        title={`${COLUMN_LABELS[status] ?? status}: ${count}`}
                    />
                );
            })}
        </div>
    );
}

// ---- Stats: Burndown Sparkline -----------------------------------------

const SPARKLINE_W = 120;
const SPARKLINE_H = 28;
const SPARKLINE_DAYS = 14;

interface BurndownSparklineProps {
    completedDates: string[];
}

function BurndownSparkline({ completedDates }: BurndownSparklineProps) {
    if (completedDates.length === 0) {
        return (
            <div className="sparkline-container">
                <span className="sparkline-no-data">No completions yet</span>
            </div>
        );
    }

    // Build 14-day range ending today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: string[] = [];
    for (let i = SPARKLINE_DAYS - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }

    // Count completions per day
    const countByDay: Record<string, number> = {};
    for (const raw of completedDates) {
        const iso = raw.slice(0, 10);
        if (countByDay[iso] !== undefined || days.includes(iso)) {
            countByDay[iso] = (countByDay[iso] ?? 0) + 1;
        }
    }

    // Accumulate (step chart)
    const points: number[] = [];
    let running = 0;
    for (const day of days) {
        running += countByDay[day] ?? 0;
        points.push(running);
    }

    const maxVal = Math.max(...points, 1);
    const svgPoints = points.map((v, i) => {
        const x = (i / (SPARKLINE_DAYS - 1)) * SPARKLINE_W;
        const y = SPARKLINE_H - (v / maxVal) * SPARKLINE_H;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
        <div className="sparkline-container" title={`${running} done in last ${SPARKLINE_DAYS} days`}>
            <span className="sparkline-label">14d velocity</span>
            <svg
                width={SPARKLINE_W}
                height={SPARKLINE_H}
                viewBox={`0 0 ${SPARKLINE_W} ${SPARKLINE_H}`}
                className="sparkline-svg"
            >
                <polyline
                    points={svgPoints}
                    fill="none"
                    stroke="var(--vscode-testing-iconPassed, #4caf50)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
            <span className="sparkline-count">{running}</span>
        </div>
    );
}

// ---- Sprint View --------------------------------------------------------

interface SprintViewProps {
    epicGroups: Record<string, StoryCard[]>;
    columns: { [status: string]: StoryCard[] };
    onCardClick: (card: StoryCard, status: string) => void;
    onDragStart: (e: React.DragEvent, storyId: string) => void;
    focusedCardId: string | null;
    onFocusCard: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, storyId: string, status: string) => void;
}

function getCardStatus(card: StoryCard, columns: { [status: string]: StoryCard[] }): string {
    for (const [status, cards] of Object.entries(columns)) {
        if (cards.some(c => c.id === card.id)) return status;
    }
    return 'todo';
}

function ProgressBar({ done, total }: { done: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return (
        <div className="progress-bar" title={`${done}/${total} done`}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            <span className="progress-bar-label">{done}/{total}</span>
        </div>
    );
}

function SprintView({ epicGroups, columns, onCardClick, onDragStart, focusedCardId, onFocusCard, onContextMenu }: SprintViewProps) {
    const groups = Object.entries(epicGroups).sort(([a], [b]) => {
        if (a === 'Unassigned') return 1;
        if (b === 'Unassigned') return -1;
        const numA = parseInt(a.replace(/^Epic\s+/i, ''), 10);
        const numB = parseInt(b.replace(/^Epic\s+/i, ''), 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
    });

    return (
        <div className="sprint-view">
            {groups.map(([epic, cards]) => {
                const doneCount = cards.filter(c => getCardStatus(c, columns) === 'done').length;
                return (
                    <div key={epic} className="sprint-group">
                        <div className="sprint-group-header">
                            <span className="sprint-group-title">{epic}</span>
                            <ProgressBar done={doneCount} total={cards.length} />
                        </div>
                        <div className="sprint-group-cards">
                            {cards.map(card => {
                                const status = getCardStatus(card, columns);
                                return (
                                    <Card
                                        key={card.id}
                                        card={card}
                                        status={status}
                                        focused={card.id === focusedCardId}
                                        onDragStart={onDragStart}
                                        onCardClick={onCardClick}
                                        onFocus={onFocusCard}
                                        onContextMenu={onContextMenu}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ---- Swimlane View ------------------------------------------------------

interface SwimlaneViewProps {
    epicGroups: Record<string, StoryCard[]>;
    columns: { [status: string]: StoryCard[] };
    onCardClick: (card: StoryCard, status: string) => void;
    onDragStart: (e: React.DragEvent, storyId: string) => void;
    onDrop: (e: React.DragEvent, targetStatus: string) => void;
    focusedCardId: string | null;
    onFocusCard: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, storyId: string, status: string) => void;
}

function SwimlaneView({ epicGroups, columns, onCardClick, onDragStart, onDrop, focusedCardId, onFocusCard, onContextMenu }: SwimlaneViewProps) {
    const epics = Object.keys(epicGroups).sort((a, b) => {
        if (a === 'Unassigned') return 1;
        if (b === 'Unassigned') return -1;
        const numA = parseInt(a.replace(/^Epic\s+/i, ''), 10);
        const numB = parseInt(b.replace(/^Epic\s+/i, ''), 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
    });
    const statusCols = COLUMN_ORDER.filter(col => col !== 'documents');

    return (
        <div className="swimlane-grid" style={{ gridTemplateColumns: `160px repeat(${statusCols.length}, 1fr)` }}>
            {/* Header row */}
            <div className="swimlane-corner" />
            {statusCols.map(col => (
                <div key={col} className="swimlane-col-header">
                    {COLUMN_LABELS[col] ?? col}
                </div>
            ))}
            {/* Epic rows */}
            {epics.map(epic => {
                const epicCards = epicGroups[epic] ?? [];
                const doneCount = epicCards.filter(c => getCardStatus(c, columns) === 'done').length;
                return (
                    <React.Fragment key={epic}>
                        <div className="swimlane-row-header">
                            <span className="swimlane-epic-title">{epic}</span>
                            <ProgressBar done={doneCount} total={epicCards.length} />
                        </div>
                        {statusCols.map(col => {
                            const cellCards = epicCards.filter(c => getCardStatus(c, columns) === col);
                            return (
                                <div
                                    key={col}
                                    className="swimlane-cell"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => onDrop(e, col)}
                                >
                                    {cellCards.map(card => (
                                        <Card
                                            key={card.id}
                                            card={card}
                                            status={col}
                                            focused={card.id === focusedCardId}
                                            onDragStart={onDragStart}
                                            onCardClick={onCardClick}
                                            onFocus={onFocusCard}
                                            onContextMenu={onContextMenu}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ---- Undo Toast ---------------------------------------------------------

interface UndoToastProps {
    title: string;
    toStatus: string;
    onUndo: () => void;
    onDismiss: () => void;
}

function UndoToast({ title, toStatus, onUndo, onDismiss }: UndoToastProps) {
    return (
        <div className="undo-toast">
            <span className="undo-toast-msg">"{title}" → {COLUMN_LABELS[toStatus] ?? toStatus}</span>
            <button className="undo-toast-btn" onClick={onUndo}>Undo</button>
            <button className="undo-toast-dismiss" onClick={onDismiss}>✕</button>
        </div>
    );
}

// ---- Context Menu -------------------------------------------------------

interface ContextMenuProps {
    x: number;
    y: number;
    storyId: string;
    currentStatus: string;
    onMove: (storyId: string, newStatus: string) => void;
    onClose: () => void;
}

function ContextMenu({ x, y, storyId, currentStatus, onMove, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ left: x, top: y });

    // Flip position when near viewport edges (task 3.7)
    useEffect(() => {
        const el = menuRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        let left = x;
        let top = y;
        if (left + rect.width > window.innerWidth) left = Math.max(0, window.innerWidth - rect.width - 4);
        if (top + rect.height > window.innerHeight) top = Math.max(0, window.innerHeight - rect.height - 4);
        setPos({ left, top });
    }, [x, y]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <>
            <div className="context-menu-overlay" onMouseDown={onClose} />
            <div
                ref={menuRef}
                className="context-menu"
                style={{ left: pos.left, top: pos.top }}
            >
                {COLUMN_ORDER.map(col => (
                    <button
                        key={col}
                        className={`context-menu-item${col === currentStatus ? ' current' : ''}`}
                        disabled={col === currentStatus}
                        onClick={() => { onMove(storyId, col); onClose(); }}
                    >
                        Move to {COLUMN_LABELS[col] ?? col}
                    </button>
                ))}
            </div>
        </>
    );
}

// ---- Card ---------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
    'todo':        '#6c757d',
    'in-progress': '#0d6efd',
    'review':      '#fd7e14',
    'done':        '#198754',
    'optional':    '#6f42c1',
    'documents':   '#5c6370',
};

const DATE_KEYS = ['completed', 'due_date', 'due', 'date', 'created_at', 'created', 'updated_at', 'updated'];
const STALE_UPDATE_KEYS = ['updated_at', 'updated'];
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

interface CardProps {
    card: StoryCard;
    status: string;
    focused: boolean;
    onDragStart: (e: React.DragEvent, storyId: string) => void;
    onCardClick: (card: StoryCard, status: string) => void;
    onFocus: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, storyId: string, status: string) => void;
}

function Card({ card, status, focused, onDragStart, onCardClick, onFocus, onContextMenu }: CardProps) {
    const color = STATUS_COLORS[status] ?? '#6c757d';

    // Find the first date-like metadata field
    const dateEntry = DATE_KEYS
        .map(k => [k, card.metadata[k]] as [string, unknown])
        .find(([, v]) => v !== undefined && v !== null);

    // Tasks 3.1–3.3: stale badge — check updated_at / updated
    const updatedRaw = STALE_UPDATE_KEYS.map(k => card.metadata[k]).find(v => typeof v === 'string' && v);
    let isStale = false;
    if (typeof updatedRaw === 'string') {
        const d = new Date(updatedRaw);
        if (!isNaN(d.getTime())) {
            isStale = Date.now() - d.getTime() > STALE_THRESHOLD_MS;
        }
    }

    // Tasks 5.1–5.2: overdue badge — check due_date / due
    const dueRaw = ['due_date', 'due'].map(k => card.metadata[k]).find(v => typeof v === 'string' && v);
    let isOverdue = false;
    if (typeof dueRaw === 'string') {
        const d = new Date(dueRaw);
        if (!isNaN(d.getTime())) {
            isOverdue = d.getTime() < Date.now();
        }
    }



    return (
        <div
            className={`card${focused ? ' card-focused' : ''}${isOverdue ? ' overdue' : ''}`}
            tabIndex={0}
            draggable
            onDragStart={(e) => onDragStart(e, card.id)}
            onClick={() => onCardClick(card, status)}
            onFocus={() => onFocus(card.id)}
            onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, card.id, status); }}
        >
            <div className="card-header-row">
                <span
                    className="status-badge"
                    style={{ background: color }}
                >
                    {status}
                </span>
                {isStale && <span className="stale-badge">⏱ Stale</span>}
                {isOverdue && <span className="overdue-badge">⚠ Overdue</span>}
            </div>
            <div className="card-title">{card.title}</div>
            {dateEntry && (
                <div className="card-date">
                    📅 {dateEntry[0]}: {String(dateEntry[1])}
                </div>
            )}
            {card.description && (
                <div className="card-description">{card.description}</div>
            )}
        </div>
    );
}

// ---- Column -------------------------------------------------------------

interface ColumnProps {
    status: string;
    label: string;
    cards: StoryCard[];
    totalCount: number;
    collapsed: boolean;
    sortKey: SortKey;
    focusedCardId: string | null;
    onDragStart: (e: React.DragEvent, storyId: string) => void;
    onDrop: (e: React.DragEvent, targetStatus: string) => void;
    onCardClick: (card: StoryCard, status: string) => void;
    onToggleCollapse: (status: string) => void;
    onSortChange: (status: string, sort: SortKey) => void;
    onFocusCard: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, storyId: string, status: string) => void;
}

function Column({ status, label, cards, totalCount, collapsed, sortKey, focusedCardId, onDragStart, onDrop, onCardClick, onToggleCollapse, onSortChange, onFocusCard, onContextMenu }: ColumnProps) {
    return (
        <div
            className={`column${collapsed ? ' collapsed' : ''}`}
            onDragOver={(e) => { if (!collapsed) e.preventDefault(); }}
            onDrop={(e) => { if (!collapsed) onDrop(e, status); }}
        >
            <div className="column-header">
                <div className="column-header-left">
                    <button
                        className="column-collapse-btn"
                        onClick={() => onToggleCollapse(status)}
                        title={collapsed ? 'Expand column' : 'Collapse column'}
                    >{collapsed ? '▶' : '▼'}</button>
                    <span className="column-title-text">{label}</span>
                    <span className="column-badge">{collapsed ? totalCount : cards.length}</span>
                </div>
                {!collapsed && (
                    <select
                        className="column-sort-select"
                        value={sortKey}
                        onChange={(e) => onSortChange(status, e.target.value as SortKey)}
                        title="Sort column"
                    >
                        <option value="none">—</option>
                        <option value="title">Title</option>
                        <option value="date">Date</option>
                        <option value="effort">Effort</option>
                    </select>
                )}
            </div>
            {!collapsed && (
                <div className="column-cards">
                    {cards.map((card) => (
                        <Card
                            key={card.id}
                            card={card}
                            status={status}
                            focused={card.id === focusedCardId}
                            onDragStart={onDragStart}
                            onCardClick={onCardClick}
                            onFocus={onFocusCard}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ---- Board --------------------------------------------------------------

export default function App() {
    const [boardState, setBoardState] = useState<BoardState | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [optimisticState, setOptimisticState] = useState<BoardState | null>(null);
    const [preview, setPreview] = useState<{ card: StoryCard; status: string; filePath: string; content: string } | null>(null);
    const [pendingCard, setPendingCard] = useState<{ card: StoryCard; status: string } | null>(null);
    // Tasks 1.1–1.3: filter, sort, collapse state
    const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS });
    const [columnSort, setColumnSort] = useState<Record<string, SortKey>>({});
    const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
    // Workflow: keyboard focus, undo toast, context menu
    const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
    const [undoState, setUndoState] = useState<{ storyId: string; fromStatus: string; toStatus: string; title: string } | null>(null);
    const undoTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; storyId: string; currentStatus: string } | null>(null);
    // Task 2.1: view mode toggle
    type ViewMode = 'kanban' | 'sprint' | 'swimlane';
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');

    const activeBoardState = optimisticState ?? boardState;

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            const msg = event.data as {
                type: string;
                data?: BoardState;
                storyId?: string;
                filePath?: string;
                content?: string;
            };
            if (msg.type === 'boardLoaded' && msg.data) {
                setBoardState(msg.data);
                setOptimisticState(null);
            } else if (msg.type === 'moveError' && msg.storyId) {
                setOptimisticState(null);
            } else if (msg.type === 'fileContent' && msg.filePath && msg.content !== undefined) {
                setPendingCard(prev => {
                    if (prev) {
                        setPreview({ card: prev.card, status: prev.status, filePath: msg.filePath!, content: msg.content! });
                    }
                    return null;
                });
            } else if (msg.type === 'fileNotFound' && msg.filePath) {
                setFileError(`File not found: ${msg.filePath}`);
                setTimeout(() => setFileError(null), 4000);
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleCardClick = useCallback((card: StoryCard, status: string) => {
        setPendingCard({ card, status });
        vscode.postMessage({ type: 'getFileContent', filePath: card.filePath });
    }, []);

    const handleOpenFile = useCallback((filePath: string) => {
        vscode.postMessage({ type: 'openFile', filePath });
    }, []);

    const closePreview = useCallback(() => setPreview(null), []);

    // Tasks 1.4-1.5: filter options and filtered board
    const filterOptions = useMemo(() => activeBoardState ? deriveFilterOptions(activeBoardState) : { epics: [], assignees: [], tags: [] }, [activeBoardState]);
    const filteredBoardState = useMemo(() => activeBoardState ? applyFilters(activeBoardState, filters, columnSort) : null, [activeBoardState, filters, columnSort]);

    // Task 1.2: Build id → {card, status} reverse lookup for linked story chips
    const idToCard = useMemo(() => {
        const map = new Map<string, { card: StoryCard; status: string }>();
        if (!activeBoardState) return map;
        for (const [status, cards] of Object.entries(activeBoardState.columns)) {
            for (const card of cards) {
                map.set(card.id, { card, status });
            }
        }
        return map;
    }, [activeBoardState]);

    // Shared move dispatch: optimistic update + undo capture + postMessage
    const dispatchMove = useCallback((storyId: string, newStatus: string) => {
        if (!boardState) return;
        let sourceStatus: string | null = null;
        for (const [col, cards] of Object.entries(boardState.columns)) {
            if (cards.some(c => c.id === storyId)) { sourceStatus = col; break; }
        }
        if (!sourceStatus || sourceStatus === newStatus) return;
        const next: BoardState = { columns: {} };
        for (const [col, cards] of Object.entries(boardState.columns)) {
            next.columns[col] = cards.filter(c => c.id !== storyId);
        }
        const movedCard = boardState.columns[sourceStatus]?.find(c => c.id === storyId);
        if (movedCard) {
            if (!next.columns[newStatus]) next.columns[newStatus] = [];
            next.columns[newStatus] = [...next.columns[newStatus], movedCard];
        }
        setOptimisticState(next);
        clearTimeout(undoTimerRef.current);
        setUndoState({ storyId, fromStatus: sourceStatus, toStatus: newStatus, title: movedCard?.title ?? storyId });
        undoTimerRef.current = setTimeout(() => setUndoState(null), 5000);
        vscode.postMessage({ type: 'moveCard', storyId, newStatus, filePath: movedCard?.filePath });
    }, [boardState]);

    // Modal status dropdown delegates to dispatchMove
    const handleMoveCard = useCallback((storyId: string, newStatus: string) => {
        dispatchMove(storyId, newStatus);
    }, [dispatchMove]);

    // Undo the last move
    const handleUndo = useCallback(() => {
        if (!undoState) return;
        clearTimeout(undoTimerRef.current);
        const { storyId, fromStatus } = undoState;
        setUndoState(null);
        const currentState = optimisticState ?? boardState;
        if (!currentState) return;
        let currentCol: string | null = null;
        for (const [col, cards] of Object.entries(currentState.columns)) {
            if (cards.some(c => c.id === storyId)) { currentCol = col; break; }
        }
        if (!currentCol) return;
        const next: BoardState = { columns: {} };
        for (const [col, cards] of Object.entries(currentState.columns)) {
            next.columns[col] = cards.filter(c => c.id !== storyId);
        }
        const movedCard = currentState.columns[currentCol]?.find(c => c.id === storyId);
        if (movedCard) {
            if (!next.columns[fromStatus]) next.columns[fromStatus] = [];
            next.columns[fromStatus] = [...(next.columns[fromStatus] ?? []), movedCard];
        }
        setOptimisticState(next);
        vscode.postMessage({ type: 'moveCard', storyId, newStatus: fromStatus, filePath: movedCard?.filePath });
    }, [undoState, optimisticState, boardState]);

    // Context menu right-click handler on Card
    const handleContextMenu = useCallback((e: React.MouseEvent, storyId: string, status: string) => {
        setContextMenu({ x: e.clientX, y: e.clientY, storyId, currentStatus: status });
    }, []);

    // Arrow key focus navigation across cards
    const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (!filteredBoardState) return;
        const columns = COLUMN_ORDER.filter(col => (filteredBoardState.columns[col]?.length ?? 0) > 0);
        if (columns.length === 0) return;
        if (!focusedCardId) {
            const first = filteredBoardState.columns[columns[0]]?.[0];
            if (first) setFocusedCardId(first.id);
            return;
        }
        let colIdx = -1;
        let cardIdx = -1;
        for (let ci = 0; ci < columns.length; ci++) {
            const idx = (filteredBoardState.columns[columns[ci]] ?? []).findIndex(c => c.id === focusedCardId);
            if (idx !== -1) { colIdx = ci; cardIdx = idx; break; }
        }
        if (colIdx === -1) return;
        const currentCards = filteredBoardState.columns[columns[colIdx]] ?? [];
        if (direction === 'up' && cardIdx > 0) {
            setFocusedCardId(currentCards[cardIdx - 1].id);
        } else if (direction === 'down' && cardIdx < currentCards.length - 1) {
            setFocusedCardId(currentCards[cardIdx + 1].id);
        } else if (direction === 'left' && colIdx > 0) {
            const targets = filteredBoardState.columns[columns[colIdx - 1]] ?? [];
            const t = targets[Math.min(cardIdx, targets.length - 1)];
            if (t) setFocusedCardId(t.id);
        } else if (direction === 'right' && colIdx < columns.length - 1) {
            const targets = filteredBoardState.columns[columns[colIdx + 1]] ?? [];
            const t = targets[Math.min(cardIdx, targets.length - 1)];
            if (t) setFocusedCardId(t.id);
        }
    }, [filteredBoardState, focusedCardId]);

    // Global keyboard listener: arrows navigate cards, Enter opens modal, O opens file
    useEffect(() => {
        const arrowMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
            ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        };
        function onKey(e: KeyboardEvent) {
            if (preview) return;
            if (contextMenu) return;
            if (arrowMap[e.key]) {
                if (focusedCardId) e.preventDefault();
                moveFocus(arrowMap[e.key]);
            } else if (e.key === 'Enter' && focusedCardId) {
                const entry = idToCard.get(focusedCardId);
                if (entry) handleCardClick(entry.card, entry.status);
            } else if ((e.key === 'o' || e.key === 'O') && focusedCardId) {
                const entry = idToCard.get(focusedCardId);
                if (entry) handleOpenFile(entry.card.filePath);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [preview, contextMenu, focusedCardId, moveFocus, idToCard, handleCardClick, handleOpenFile]);

    const handleToggleCollapse = useCallback((status: string) => {
        setCollapsedColumns(prev => {
            const next = new Set(prev);
            next.has(status) ? next.delete(status) : next.add(status);
            return next;
        });
    }, []);

    const handleSortChange = useCallback((status: string, sort: SortKey) => {
        setColumnSort(prev => ({ ...prev, [status]: sort }));
    }, []);

    function handleDragStart(e: React.DragEvent, storyId: string) {
        e.dataTransfer.setData('storyId', storyId);
        setDraggingId(storyId);
    }

    function handleDrop(e: React.DragEvent, targetStatus: string) {
        const storyId = e.dataTransfer.getData('storyId');
        setDraggingId(null);
        if (!storyId || !boardState) return;
        dispatchMove(storyId, targetStatus);
    }

    if (!activeBoardState || !filteredBoardState) {
        return <div style={{ padding: 16, color: 'var(--vscode-foreground)' }}>Loading board…</div>;
    }

    const docCards = filteredBoardState.columns['documents'] ?? [];

    return (
        <div className="board-wrapper">
            <FilterBar filters={filters} options={filterOptions} onChange={setFilters} />
            <div className="board-stats-bar">
                <div className="view-switcher">
                    {(['kanban', 'sprint', 'swimlane'] as const).map(mode => (
                        <button
                            key={mode}
                            className={`view-btn${viewMode === mode ? ' active' : ''}`}
                            onClick={() => setViewMode(mode)}
                        >{mode.charAt(0).toUpperCase() + mode.slice(1)}</button>
                    ))}
                </div>
                <StatusDistributionBar columns={activeBoardState.columns} />
                <BurndownSparkline completedDates={activeBoardState.completedDates ?? []} />
            </div>
            <div className="board">
                {fileError && <div className="file-error">{fileError}</div>}
                {preview && (
                    <PreviewModal
                        card={preview.card}
                        currentStatus={preview.status}
                        filePath={preview.filePath}
                        content={preview.content}
                        onClose={closePreview}
                        onOpenFile={handleOpenFile}
                        onMoveCard={handleMoveCard}
                        idToCard={idToCard}
                        onChipClick={handleCardClick}
                    />
                )}
                {viewMode === 'kanban' && (
                    <>
                        {docCards.length > 0 && (
                            <div className="column column-documents">
                                <div className="column-header">
                                    <div className="column-header-left">
                                        <span className="column-title-text">📄 Documents</span>
                                        <span className="column-badge">{docCards.length}</span>
                                    </div>
                                </div>
                                <div className="column-cards">
                                    {docCards.map((card) => (
                                        <div
                                            key={card.id}
                                            className="card card-document"
                                            onClick={() => handleCardClick(card, 'documents')}
                                        >
                                            <div className="card-title">{card.title}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {COLUMN_ORDER.filter(col => col !== 'documents').map((col) => (
                            <Column
                                key={col}
                                status={col}
                                label={COLUMN_LABELS[col] ?? col}
                                cards={filteredBoardState.columns[col] ?? []}
                                totalCount={(activeBoardState.columns[col] ?? []).length}
                                collapsed={collapsedColumns.has(col)}
                                sortKey={columnSort[col] ?? 'none'}
                                focusedCardId={focusedCardId}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                                onCardClick={handleCardClick}
                                onToggleCollapse={handleToggleCollapse}
                                onSortChange={handleSortChange}
                                onFocusCard={setFocusedCardId}
                                onContextMenu={handleContextMenu}
                            />
                        ))}
                    </>
                )}
                {viewMode === 'sprint' && (
                    <SprintView
                        epicGroups={activeBoardState.epicGroups ?? {}}
                        columns={activeBoardState.columns}
                        onCardClick={handleCardClick}
                        onDragStart={handleDragStart}
                        focusedCardId={focusedCardId}
                        onFocusCard={setFocusedCardId}
                        onContextMenu={handleContextMenu}
                    />
                )}
                {viewMode === 'swimlane' && (
                    <SwimlaneView
                        epicGroups={activeBoardState.epicGroups ?? {}}
                        columns={activeBoardState.columns}
                        onCardClick={handleCardClick}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        focusedCardId={focusedCardId}
                        onFocusCard={setFocusedCardId}
                        onContextMenu={handleContextMenu}
                    />
                )}
            </div>
            {undoState && (
                <UndoToast
                    title={undoState.title}
                    toStatus={undoState.toStatus}
                    onUndo={handleUndo}
                    onDismiss={() => { clearTimeout(undoTimerRef.current); setUndoState(null); }}
                />
            )}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    storyId={contextMenu.storyId}
                    currentStatus={contextMenu.currentStatus}
                    onMove={dispatchMove}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
