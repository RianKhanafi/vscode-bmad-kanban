import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parse } from '../../src/StoryParser';

suite('StoryParser', () => {
    let tmpDir: string;

    setup(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bmad-story-test-'));
    });

    teardown(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('parse() extracts title from frontmatter `title` field', () => {
        const file = path.join(tmpDir, 'story-1.md');
        fs.writeFileSync(file, '---\ntitle: My Story\nassignee: alice\n---\nSome body text.');
        const card = parse(file);
        assert.strictEqual(card.title, 'My Story');
        assert.strictEqual(card.metadata['assignee'], 'alice');
    });

    test('parse() falls back to first H1 when no frontmatter title', () => {
        const file = path.join(tmpDir, 'story-2.md');
        fs.writeFileSync(file, '# H1 Title\n\nBody paragraph.');
        const card = parse(file);
        assert.strictEqual(card.title, 'H1 Title');
    });

    test('parse() falls back to filename when no title and no H1', () => {
        const file = path.join(tmpDir, 'story-3.md');
        fs.writeFileSync(file, 'Just some content with no heading.');
        const card = parse(file);
        assert.strictEqual(card.title, 'story-3');
    });

    test('parse() uses frontmatter `id` when present', () => {
        const file = path.join(tmpDir, 'filename.md');
        fs.writeFileSync(file, '---\nid: explicit-id\ntitle: T\n---\n');
        const card = parse(file);
        assert.strictEqual(card.id, 'explicit-id');
    });

    test('parse() derives id from filename when no frontmatter id', () => {
        const file = path.join(tmpDir, 'my-story.md');
        fs.writeFileSync(file, '# Title\n');
        const card = parse(file);
        assert.strictEqual(card.id, 'my-story');
    });
});
