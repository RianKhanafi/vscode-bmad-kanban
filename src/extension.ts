import * as vscode from 'vscode';
import { KanbanPanel } from './KanbanPanel';

export function activate(context: vscode.ExtensionContext): void {
    const command = vscode.commands.registerCommand('bmad-kanban.openBoard', () => {
        KanbanPanel.createOrShow(context);
    });

    context.subscriptions.push(command);
    context.subscriptions.push({
        dispose() {
            KanbanPanel.currentPanel?.dispose();
        }
    });
}

export function deactivate(): void {
    // Nothing additional needed — subscriptions handle cleanup
}
