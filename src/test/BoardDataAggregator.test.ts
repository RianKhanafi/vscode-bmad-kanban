import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getBoardState } from '../../src/BoardDataAggregator';
import { FolderConfig } from '../../src/StoryParser';

const DEFAULT_CONFIG: FolderConfig = {
    ticketFolders:   ['implementation-artifacts'],
    documentFolders: ['planning-artifacts'],
    mockupFolders:   ['mockups', '_mockups'],
};

suite('BoardDataAggregator', () => {
    let tmpDir: string;
    let ticketsDir: string;

    setup(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bmad-board-test-'));
        ticketsDir = path.join(tmpDir, 'implementation-artifacts');
        fs.mkdirSync(ticketsDir);
    });

    teardown(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test('getBoardState() places story in todo when no YAML entry', () => {
        fs.writeFileSync(path.join(ticketsDir, 'story-a.md'), '# Story A\n');
        const yamlPath = path.join(tmpDir, 'sprint-status.yml');
        // No YAML file written — adapter returns {}
        const state = getBoardState(tmpDir, yamlPath, DEFAULT_CONFIG);
        const todoCards = state.columns['todo'];
        assert.ok(todoCards.some((c) => c.id === 'story-a'));
    });

    test('getBoardState() assigns correct column from YAML', () => {
        fs.writeFileSync(path.join(ticketsDir, 'story-b.md'), '# Story B\n');
        const yamlPath = path.join(tmpDir, 'sprint-status.yml');
        fs.writeFileSync(yamlPath, 'story-b: in-progress\n');
        const state = getBoardState(tmpDir, yamlPath, DEFAULT_CONFIG);
        assert.ok(state.columns['in-progress'].some((c) => c.id === 'story-b'));
        assert.ok(!state.columns['todo'].some((c) => c.id === 'story-b'));
    });

    test('getBoardState() returns all four default columns', () => {
        const yamlPath = path.join(tmpDir, 'sprint-status.yml');
        const state = getBoardState(tmpDir, yamlPath, DEFAULT_CONFIG);
        assert.ok('todo' in state.columns);
        assert.ok('in-progress' in state.columns);
        assert.ok('review' in state.columns);
        assert.ok('done' in state.columns);
    });
});
