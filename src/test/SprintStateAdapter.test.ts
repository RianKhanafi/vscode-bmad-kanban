import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { SprintStateAdapter } from '../../src/SprintStateAdapter';

suite('SprintStateAdapter', () => {
    let tmpDir: string;

    setup(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bmad-test-'));
    });

    teardown(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('read() returns empty map for missing file', () => {
        const adapter = new SprintStateAdapter();
        const result = adapter.read(path.join(tmpDir, 'missing.yml'));
        assert.deepStrictEqual(result, {});
    });

    test('read() returns empty map for malformed YAML', () => {
        const file = path.join(tmpDir, 'bad.yml');
        fs.writeFileSync(file, '{ unclosed: [');
        const adapter = new SprintStateAdapter();
        const result = adapter.read(file);
        assert.deepStrictEqual(result, {});
    });

    test('read() parses valid YAML into a status map', () => {
        const file = path.join(tmpDir, 'sprint-status.yml');
        fs.writeFileSync(file, 'story-1: in-progress\nstory-2: done\n');
        const adapter = new SprintStateAdapter();
        const result = adapter.read(file);
        assert.deepStrictEqual(result, { 'story-1': 'in-progress', 'story-2': 'done' });
    });

    test('write() round-trips through read()', () => {
        const file = path.join(tmpDir, 'sprint-status.yml');
        const adapter = new SprintStateAdapter();
        const state = { 'story-a': 'todo', 'story-b': 'review' };
        adapter.write(file, state);
        const result = adapter.read(file);
        assert.deepStrictEqual(result, state);
    });
});
