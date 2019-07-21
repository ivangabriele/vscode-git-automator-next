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
        'Git Automator legacy extension is active. Please disable or uninstall it and reload VS Code.',
      );

      return;
    }

    // Is there more than one workspace ?
    if (workspace.workspaceFolders.length > 1) {
      const firstWorkspace = workspace.workspaceFolders[0];
      window.showWarningMessage(
        `You seem to have more than one open workspace for this VS Code instance. ` +
          `Git Automator doesn't support that case yet. ` +
          `Only the first one (${firstWorkspace.name}) will be usable for now.`,
      );
    }

    new GitAutomator(context);
  } catch (err) {
    window.showErrorMessage(`[extension] An unexpected error occured: ${err.message}`);
  }
}

export function deactivate() {}
