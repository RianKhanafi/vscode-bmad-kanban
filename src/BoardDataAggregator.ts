import { discoverStories, StoryCard } from './StoryParser';
import { SprintStateAdapter, inferEpicGroups } from './SprintStateAdapter';
import * as path from 'path';

export type BoardState = {
    columns: { [status: string]: StoryCard[] };
    completedDates: string[];
    sprintGroups: Record<string, StoryCard[]>;
    epicGroups: Record<string, StoryCard[]>;
};

const DEFAULT_COLUMN = 'todo';
const COLUMN_ORDER = ['documents', 'todo', 'in-progress', 'review', 'done'];

// Maps raw status strings → canonical column names.
// Entries are matched by exact string or startsWith (in order).
const STATUS_MAP: Array<[string, string]> = [
    ['done', 'done'],
    ['completed', 'done'],
    ['complete', 'done'],
    ['finished', 'done'],
    ['merged', 'done'],
    ['deployed', 'done'],
    ['ready for merge', 'review'],
    ['ready-for-merge', 'review'],
    ['ready for review', 'review'],
    ['ready-for-review', 'review'],
    ['in review', 'review'],
    ['review', 'review'],
    ['in-progress', 'in-progress'],
    ['in progress', 'in-progress'],
    ['wip', 'in-progress'],
    ['active', 'in-progress'],
    ['backlog', 'todo'],
    ['todo', 'todo'],
    ['to-do', 'todo'],
    ['to do', 'todo'],
    ['ready-for-dev', 'in-progress'],
    ['ready for dev', 'in-progress'],
    ['planning', 'todo'],
    ['not started', 'todo'],
];

function normalizeStatus(raw: string): string | null {
    const lower = raw.toLowerCase().trim();
    for (const [pattern, col] of STATUS_MAP) {
        if (lower === pattern || lower.startsWith(pattern)) {
            return col;
        }
    }
    return null;
}

export function getBoardState(workspaceRoot: string, yamlPath: string): BoardState {
    const adapter = new SprintStateAdapter();
    const stateMap = adapter.read(yamlPath);
    const stories = discoverStories(workspaceRoot);

    const columns: { [status: string]: StoryCard[] } = {};
    for (const col of COLUMN_ORDER) {
        columns[col] = [];
    }

    for (const story of stories) {
        const rawYaml = stateMap[story.id];
        const rawFile = typeof story.metadata['status'] === 'string'
            ? (story.metadata['status'] as string)
            : undefined;

        const statusFromYaml = rawYaml ? normalizeStatus(rawYaml) : null;
        const statusFromFile = rawFile ? normalizeStatus(rawFile) : null;

        // Files whose basename starts with a digit are always tickets (never Documents)
        const basenameStory = path.basename(story.filePath, '.md');
        const isNumericStory = /^\d/.test(basenameStory);

        // Files with no recognized status → Documents column (unless numeric-prefixed)
        const isDocument = !isNumericStory && statusFromYaml === null && statusFromFile === null;
        const status = isDocument ? 'documents' : (statusFromYaml ?? statusFromFile ?? DEFAULT_COLUMN);
        if (!columns[status]) {
            columns[status] = [];
        }
        columns[status].push(story);
    }

    // Task 1.2: collect completed dates from done-column cards
    const completedDates: string[] = [];
    const COMPLETED_DATE_KEYS = ['completed', 'completed_date', 'done_date'];
    for (const card of (columns['done'] ?? [])) {
        for (const key of COMPLETED_DATE_KEYS) {
            const val = card.metadata[key];
            if (typeof val === 'string' && val.trim()) {
                completedDates.push(val.trim());
                break;
            }
        }
    }

    // Tasks 1.3–1.5: group all cards by sprint and by epic
    const epicInferred = inferEpicGroups(yamlPath);
    const sprintGroups: Record<string, StoryCard[]> = {};
    const epicGroups: Record<string, StoryCard[]> = {};
    const allCards = Object.values(columns).flat();
    for (const card of allCards) {
        const sprint = typeof card.metadata['sprint'] === 'string' && card.metadata['sprint']
            ? (card.metadata['sprint'] as string)
            : 'Unassigned';
        if (!sprintGroups[sprint]) sprintGroups[sprint] = [];
        sprintGroups[sprint].push(card);

        // Epic group from sprint-status.yaml key order only
        // Try: exact card.id → normalized → basename → normalized basename → numeric prefix (e.g. "2-1-..." → Epic 2)
        const basename = path.basename(card.filePath, '.md');
        const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const numericPrefixMatch = card.id.match(/^(\d+)-/) ?? basename.match(/^(\d+)-/);
        const epicFromPrefix = numericPrefixMatch ? `Epic ${numericPrefixMatch[1]}` : undefined;
        const epic =
            epicInferred[card.id] ??
            epicInferred[normalizeKey(card.id)] ??
            epicInferred[basename] ??
            epicInferred[normalizeKey(basename)] ??
            epicFromPrefix ??
            'Unassigned';
        if (!epicGroups[epic]) epicGroups[epic] = [];
        epicGroups[epic].push(card);
    }

    return { columns, completedDates, sprintGroups, epicGroups };
}
