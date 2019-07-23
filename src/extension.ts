import isCommand from 'is-command';
import { ExtensionContext, extensions, window, workspace } from 'vscode';

import GitAutomator from './GitAutomator';

export async function activate(context: ExtensionContext) {
  try {
    // Is this a workspace ?
    if (workspace.workspaceFolders === undefined) return;

    // Is Git available ?
    if (!(await isCommand('git'))) {
      window.showErrorMessage(
        `Git doesn't seem to be installed. Please install it and reload VS Code.`,
      );

      return;
    }

    // Is Git Automator legacy extension active ?
    const legacyExtension = extensions.getExtension(`ivangabriele.vscode-git-add-and-commit`);
    if (legacyExtension !== undefined && legacyExtension.isActive) {
      window.showErrorMessage(
        `Git Automator legacy extension is active. ` +
          `Please disable or uninstall it and reload VS Code.`,
      );

      return;
    }

    new GitAutomator(context);
  } catch (err) {
    window.showErrorMessage(`[extension] An unexpected error occured: ${err.message}`);
  }
}

export function deactivate() {}
