import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';

export type SprintState = Record<string, string>;

/**
 * Recursively find the first nested object that contains at least one epic-N key.
 * This handles YAML files where epic/story entries are nested under a sub-key
 * like `development_status:`.
 */
function findEpicContainer(obj: Record<string, unknown>): Record<string, unknown> | null {
    if (Object.keys(obj).some(k => /^epic-\d+$/i.test(k))) {
        return obj;
    }
    for (const val of Object.values(obj)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            const found = findEpicContainer(val as Record<string, unknown>);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Walk the yaml keys in file order. Any key matching /^epic-\d+$/ (e.g. "epic-1")
 * marks the start of a new epic group. All subsequent story keys are mapped to
 * that epic name until the next epic marker. Used as fallback when a story has
 * no `epic:` frontmatter field.
 */
/** Normalize a key for fuzzy matching: lowercase, collapse non-alphanumeric to hyphens */
function normalizeKey(k: string): string {
    return k.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function inferEpicGroups(filePath: string): Record<string, string> {
    const result: Record<string, string> = {};
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = yaml.load(content);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) { return result; }
        const container = findEpicContainer(parsed as Record<string, unknown>);
        if (!container) return result;
        let currentEpic = 'Unassigned';
        for (const key of Object.keys(container)) {
            if (/^epic-\d+$/i.test(key)) {
                const num = key.replace(/^epic-/i, '');
                currentEpic = `Epic ${num}`;
            } else {
                // Store both exact and normalized key for fuzzy lookup
                result[key] = currentEpic;
                result[normalizeKey(key)] = currentEpic;
            }
        }
    } catch {
        // ignore unreadable file
    }
    return result;
}

function flattenSprintState(
    obj: Record<string, unknown>,
    result: SprintState = {}
): SprintState {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = value;
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            flattenSprintState(value as Record<string, unknown>, result);
        }
    }
    return result;
}

export class SprintStateAdapter {
    read(filePath: string): SprintState {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const parsed = yaml.load(content);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return flattenSprintState(parsed as Record<string, unknown>);
            }
            return {};
        } catch {
            return {};
        }
    }

    write(filePath: string, updatedEntries: SprintState): void {
        try {
            // Read original file as text and patch only the changed key lines,
            // preserving nested structure, comments, and top-level metadata.
            let content: string;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch {
                content = '';
            }

            for (const [id, status] of Object.entries(updatedEntries)) {
                const escaped = id.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                // Match "  <id>: <anything>" line (any indentation)
                const lineRe = new RegExp(`^([ \\t]*${escaped}:)[ \\t]*\\S+`, 'm');
                const patched = content.replace(lineRe, `$1 ${status}`);
                if (patched !== content) {
                    // Key existed — patch was applied
                    content = patched;
                } else {
                    // Key not found — append at root level so next read picks it up
                    content = content.trimEnd() + `\n${id}: ${status}\n`;
                }
            }

            fs.writeFileSync(filePath, content, 'utf8');
        } catch (err) {
            vscode.window.showErrorMessage(
                `BMAD Kanban: Failed to update sprint-status — ${(err as Error).message}`
            );
        }
    }
}
