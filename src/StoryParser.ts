import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

export interface StoryCard {
    id: string;
    title: string;
    filePath: string;
    description?: string;
    metadata: Record<string, unknown>;
}

function parseBoldFields(content: string): Record<string, string> {
    const fields: Record<string, string> = {};
    // Recreate regex each call — module-level /g regex retains lastIndex across calls
    const re = /^\*\*([^*]+?):\*\*\s*(.+)$/gm;
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
        const key = match[1].trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
        // Normalize "story_status" → "status" so both field names are treated the same
        const normalizedKey = key === 'story_status' ? 'status' : key;
        // Strip any surrounding bold/emoji/whitespace from value
        const value = match[2].replace(/[*✅✓]/g, '').trim();
        // First occurrence wins — ignore duplicates
        if (!(normalizedKey in fields)) {
            fields[normalizedKey] = value;
        }
    }
    return fields;
}

function parsePlainFields(content: string): Record<string, string> {
    // Parse plain "Key: value" lines that appear before any ## heading
    // e.g. "Status: done" or "Epic: Epic 1"
    const fields: Record<string, string> = {};
    for (const line of content.split('\n')) {
        if (/^##\s/.test(line)) break; // stop at first ## section heading (# title is allowed before)
        const m = line.match(/^([A-Za-z][A-Za-z0-9_ ]{0,30}):\s+(.+)$/);
        if (m) {
            const key = m[1].trim().toLowerCase().replace(/\s+/g, '_');
            const normalizedKey = key === 'story_status' ? 'status' : key;
            if (!(normalizedKey in fields)) {
                fields[normalizedKey] = m[2].trim();
            }
        }
    }
    return fields;
}

export function parse(filePath: string): StoryCard {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);

    // Parse **Key:** Value fields from the markdown body
    const bodyFields = parseBoldFields(content);
    // Parse plain "Key: value" lines as lowest-priority fallback
    const plainFields = parsePlainFields(content);

    // Derive title: prefer frontmatter `title`, then first H1 in body
    let title: string = typeof data['title'] === 'string' ? data['title'] : '';
    if (!title) {
        const h1Match = content.match(/^#\s+(.+)$/m);
        title = h1Match ? h1Match[1].trim() : path.basename(filePath, '.md');
    }

    // Derive ID priority: frontmatter `id` > body **Story ID:** > filename
    let id: string;
    if (typeof data['id'] === 'string') {
        id = data['id'];
    } else if (bodyFields['story_id']) {
        id = bodyFields['story_id'];
    } else {
        id = path.basename(filePath, '.md');
    }

    // Extract ## Story / ## User Story section for card description (line-by-line to avoid regex multiline $ pitfall)
    let description: string | undefined;
    {
        const bodyLines = content.split('\n');
        let inSection = false;
        const out: string[] = [];
        for (const line of bodyLines) {
            if (/^##\s+(user\s+story|story)\s*$/i.test(line.trim())) { inSection = true; continue; }
            if (inSection) {
                if (/^##\s/.test(line)) break;
                const t = line.trim();
                if (t) out.push(t);
            }
        }
        if (out.length > 0) {
            let desc = out.slice(0, 3).join(' ');
            // Strip markdown syntax for plain-text display
            desc = desc
                .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold**
                .replace(/\*([^*]+)\*/g, '$1')         // *italic*
                .replace(/__([^_]+)__/g, '$1')         // __bold__
                .replace(/_([^_]+)_/g, '$1')           // _italic_
                .replace(/`([^`]+)`/g, '$1')           // `code`
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link](url)
                .replace(/^#{1,6}\s+/, '')             // # headings
                .replace(/[>*_~`]/g, '')               // leftover symbols
                .replace(/\s+/g, ' ')
                .trim();
            if (desc.length > 120) desc = desc.slice(0, 120).trimEnd() + '…';
            description = desc;
        }
    }

    // Merge priority: plainFields (lowest) < frontmatter < boldFields (highest)
    const { id: _id, title: _title, ...rest } = data;
    const metadata: Record<string, unknown> = { ...plainFields, ...rest, ...bodyFields };
    // Remove story_id from display metadata (already used as id)
    delete metadata['story_id'];

    return { id, title, filePath, description, metadata };
}

/**
 * Update the status field inside a .md file in-place.
 * Handles three formats:
 *   **Status:** value       (bold key, plain value)
 *   **Status: value**       (fully bold)
 *   Status: value           (plain)
 * If none found, inserts "Status: {newStatus}" after the frontmatter block.
 */
export function updateStatusInFile(filePath: string, newStatus: string): void {
    let raw = fs.readFileSync(filePath, 'utf8');

    // Pattern 1: **Status:** value  or  **Story Status:** value
    const boldKeyRe = /^(\*\*(?:Story\s+)?Status:\*\*\s*).+$/im;
    if (boldKeyRe.test(raw)) {
        raw = raw.replace(boldKeyRe, `$1${newStatus}`);
        fs.writeFileSync(filePath, raw, 'utf8');
        return;
    }

    // Pattern 2: **Status: value**  (fully bold, value inside markers)
    const boldFullRe = /^\*\*(?:Story\s+)?Status:\s*[^*\n]+\*\*$/im;
    if (boldFullRe.test(raw)) {
        raw = raw.replace(boldFullRe, `**Status: ${newStatus}**`);
        fs.writeFileSync(filePath, raw, 'utf8');
        return;
    }

    // Pattern 3: plain  Status: value  line
    const plainRe = /^((?:Story\s+)?Status):\s+.+$/im;
    if (plainRe.test(raw)) {
        raw = raw.replace(plainRe, `$1: ${newStatus}`);
        fs.writeFileSync(filePath, raw, 'utf8');
        return;
    }

    // No status field found — insert after frontmatter (--- block) or at the very top
    const fmMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    if (fmMatch) {
        const insertAt = fmMatch.index! + fmMatch[0].length;
        raw = raw.slice(0, insertAt) + `Status: ${newStatus}\n\n` + raw.slice(insertAt);
    } else {
        raw = `Status: ${newStatus}\n\n` + raw;
    }
    fs.writeFileSync(filePath, raw, 'utf8');
}

export function discoverStories(workspaceRoot: string): StoryCard[] {
    const stories: StoryCard[] = [];
    collectMdFiles(workspaceRoot, workspaceRoot, stories);
    return stories;
}

function collectMdFiles(root: string, dir: string, out: StoryCard[]): void {
    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return;
    }

    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
            continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectMdFiles(root, fullPath, out);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            try {
                out.push(parse(fullPath));
            } catch {
                // Skip unparseable files silently
            }
        }
    }
}
