import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension smoke test', () => {
    test('bmad-kanban.openBoard command is registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(
            commands.includes('bmad-kanban.openBoard'),
            'Expected bmad-kanban.openBoard to be a registered command'
        );
    });
});
