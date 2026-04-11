import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { getBoardState, BoardState } from './BoardDataAggregator';
import { SprintStateAdapter } from './SprintStateAdapter';
import { updateStatusInFile } from './StoryParser';

function resolveSprintYaml(workspaceRoot: string): string {
    // Search recursively up to 4 levels deep for sprint-status.yaml / .yml
    const names = ['sprint-status.yaml', 'sprint-status.yml'];
    function search(dir: string, depth: number): string | null {
        if (depth < 0) { return null; }
        for (const name of names) {
            const candidate = path.join(dir, name);
            if (fs.existsSync(candidate)) { return candidate; }
        }
        try {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name.startsWith('.')) { continue; }
                const found = search(path.join(dir, entry.name), depth - 1);
                if (found) { return found; }
            }
        } catch { /* ignore unreadable dirs */ }
        return null;
    }
    return search(workspaceRoot, 4) ?? path.join(workspaceRoot, 'sprint-status.yaml');
}

export class KanbanPanel {
    public static currentPanel: KanbanPanel | undefined;

    private readonly _panel: vscode.WebviewPanel;
    private readonly _workspaceRoot: string;
    private readonly _yamlPath: string;
    private readonly _adapter: SprintStateAdapter;
    private readonly _disposables: vscode.Disposable[] = [];
    private _debounceTimer: ReturnType<typeof setTimeout> | undefined;

    private constructor(panel: vscode.WebviewPanel, workspaceRoot: string, yamlPath: string) {
        this._panel = panel;
        this._workspaceRoot = workspaceRoot;
        this._yamlPath = yamlPath;
        this._adapter = new SprintStateAdapter();

        this._panel.webview.html = this._buildHtml(panel.webview);
        this._sendBoardState();
        this._registerMessageHandlers();
        this._registerFileWatchers();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static createOrShow(context: vscode.ExtensionContext): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('BMAD Kanban: No workspace folder is open.');
            return;
        }
        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const yamlPath = resolveSprintYaml(workspaceRoot);

        if (KanbanPanel.currentPanel) {
            KanbanPanel.currentPanel._panel.reveal();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'bmadKanban',
            'BMAD Kanban Board',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'dist')],
                retainContextWhenHidden: true
            }
        );

        KanbanPanel.currentPanel = new KanbanPanel(panel, workspaceRoot, yamlPath);
    }

    private _sendBoardState(): void {
        const state: BoardState = getBoardState(this._workspaceRoot, this._yamlPath);
        this._panel.webview.postMessage({ type: 'boardLoaded', data: state });
    }

    private _registerMessageHandlers(): void {
        this._panel.webview.onDidReceiveMessage(
            (message: { type: string; storyId?: string; newStatus?: string; filePath?: string }) => {
                switch (message.type) {
                    case 'moveCard':
                        this._handleMoveCard(message.storyId!, message.newStatus!, message.filePath);
                        break;
                    case 'openFile':
                        this._handleOpenFile(message.filePath!);
                        break;
                    case 'openExternal':
                        vscode.env.openExternal(vscode.Uri.parse((message as { type: string; url?: string }).url!));
                        break;
                    case 'getFileContent':
                        this._handleGetFileContent(message.filePath!);
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    private _handleMoveCard(storyId: string, newStatus: string, filePath?: string): void {
        try {
            // Write status into the .md file so the source of truth stays in the file
            if (filePath && fs.existsSync(filePath)) {
                updateStatusInFile(filePath, newStatus);
                // The .md file watcher will trigger a board refresh automatically
            } else {
                // Fallback: persist to sprint-status.yaml for stories without a file path
                this._adapter.write(this._yamlPath, { [storyId]: newStatus });
                this._sendBoardState();
            }
        } catch (err) {
            this._panel.webview.postMessage({
                type: 'moveError',
                storyId,
                message: (err as Error).message
            });
        }
    }

    private async _handleOpenFile(filePath: string): Promise<void> {
        if (!fs.existsSync(filePath)) {
            this._panel.webview.postMessage({
                type: 'fileNotFound',
                filePath
            });
            return;
        }
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc);
    }

    private _handleGetFileContent(filePath: string): void {
        try {
            if (!fs.existsSync(filePath)) {
                this._panel.webview.postMessage({ type: 'fileNotFound', filePath });
                return;
            }
            const content = fs.readFileSync(filePath, 'utf8');
            this._panel.webview.postMessage({ type: 'fileContent', filePath, content });
        } catch (err) {
            this._panel.webview.postMessage({ type: 'fileNotFound', filePath });
        }
    }

    // 6.1-6.4: File system watchers
    private _registerFileWatchers(): void {
        const mdWatcher = vscode.workspace.createFileSystemWatcher('**/*.md');
        mdWatcher.onDidCreate(() => this._scheduleRefresh(), null, this._disposables);
        mdWatcher.onDidChange(() => this._scheduleRefresh(), null, this._disposables);
        mdWatcher.onDidDelete(() => this._scheduleRefresh(), null, this._disposables);
        this._disposables.push(mdWatcher);

        const yamlWatcher = vscode.workspace.createFileSystemWatcher('**/sprint-status.{yml,yaml}');
        yamlWatcher.onDidChange(() => this._scheduleRefresh(), null, this._disposables);
        this._disposables.push(yamlWatcher);
    }

    private _scheduleRefresh(): void {
        if (this._debounceTimer !== undefined) {
            clearTimeout(this._debounceTimer);
        }
        this._debounceTimer = setTimeout(() => {
            this._debounceTimer = undefined;
            this._sendBoardState();
        }, 300);
    }

    private _buildHtml(webview: vscode.Webview): string {
        const nonce = crypto.randomBytes(16).toString('hex');
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                vscode.Uri.file(path.dirname(path.dirname(__filename))),
                'dist',
                'webview.js'
            )
        );
        return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BMAD Kanban Board</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    public dispose(): void {
        if (this._debounceTimer !== undefined) {
            clearTimeout(this._debounceTimer);
        }
        KanbanPanel.currentPanel = undefined;
        this._panel.dispose();
        for (const d of this._disposables) {
            d.dispose();
        }
    }
}
