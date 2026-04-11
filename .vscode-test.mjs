import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
    files: 'src/test/**/*.test.ts',
    workspaceFolder: '.',
    mocha: {
        timeout: 20000
    }
});
