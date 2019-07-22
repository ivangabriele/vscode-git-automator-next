// tslint:disable-next-line: import-name
import simpleGit from 'simple-git/promise';
import { commands, ExtensionContext, window, workspace } from 'vscode';

import handleUnexpectedError from './helpers/handleUnexpectedError';
import showProgressNotification from './helpers/showProgressNotification';

import { COMMAND } from './constants';

export default class GitAutomator {
  private git: simpleGit.SimpleGit;
  private workspaceUri: string;

  constructor(context: ExtensionContext) {
    try {
      this.workspaceUri = workspace.workspaceFolders[0].uri.path;
      this.git = simpleGit(this.workspaceUri);

      this.bindCommands(context);
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#constructor()');
    }
  }

  bindCommands(context: ExtensionContext) {
    try {
      context.subscriptions.push(
        commands.registerCommand(COMMAND.COMMIT_ALL_FILES, () => this.addAndCommit(true)),
        commands.registerCommand(COMMAND.COMMIT_CURRENT_FILE, () => this.addAndCommit()),
        commands.registerCommand(COMMAND.PUSH_CURRENT_BRANCH, () => this.push()),
      );
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#bindCommands()');
    }
  }

  /**
   * @todo Allow default remote name customization in settings.
   */
  async push() {
    try {
      const remoteName = 'origin';
      const status = await this.git.status();
      const { ahead, behind, conflicted, current: branchName } = status;
      const remoteBranchName = `${remoteName}/${branchName}`;

      if (conflicted.length !== 0) {
        window.showWarningMessage(
          `Your "${branchName}" branch has some conflicts to resolve in: ${conflicted.join(', ')}.`,
        );

        return;
      }

      if (behind !== 0) {
        window.showWarningMessage(
          `Your "${branchName}" branch is behind "${remoteBranchName}" by ${behind} commits.`,
        );

        return;
      }

      if (ahead === 0) {
        window.showInformationMessage(
          `Your "${branchName}" branch is already up-to-date with "${remoteBranchName}".`,
        );

        return;
      }

      const cancellationTokenSource = showProgressNotification(
        `Pushing ${ahead} commits to "${remoteBranchName}"…`,
      );
      await this.git.push('origin', 'HEAD');
      cancellationTokenSource.cancel();
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#pushCurrentBranch()');
    }
  }

  async addAndCommit(isAll = false) {
    try {
      console.debug(isAll);
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#bindCommands()');
    }
  }
}
