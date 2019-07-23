// tslint:disable-next-line: import-name
import simpleGit from 'simple-git/promise';
import {
  commands,
  ExtensionContext,
  // Memento,
  TextDocument,
  window,
  workspace,
} from 'vscode';

import Committer from './Committer';
import { COMMAND } from './constants';
import handleUnexpectedError from './helpers/handleUnexpectedError';
import showProgressNotification from './helpers/showProgressNotification';
import { CanFail } from './types';

const GIT_STATUS_ZERO = {
  not_added: [],
  created: [],
  modified: [],
  deleted: [],
};

export default class GitAutomator {
  private activeWorkspaceUri: string;
  // private globalState: Memento;
  private committer: Committer = new Committer();
  // private workspaceState: Memento;

  /**
   * @todo Handle disposed files ?
   */
  private get activeFileUri(): CanFail<string> {
    try {
      const activeTextEditor = window.activeTextEditor;
      if (activeTextEditor === undefined) return [true];
      if (activeTextEditor.document.isUntitled) return [true];

      return [false, activeTextEditor.document.uri.path];
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#activeFileUri');
    }
  }

  private get git(): CanFail<simpleGit.SimpleGit> {
    try {
      return [false, simpleGit(this.activeWorkspaceUri)];
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#git');

      return [true];
    }
  }

  constructor(context: ExtensionContext) {
    try {
      // this.globaleState = context.globalState;
      // this.workspaceState = context.workspaceState;

      this.init();

      this.bindEvents();
      this.bindCommands(context);
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator()');
    }
  }

  /**
   * @todo Check case `workspaceUriMatch.length > 1`.
   */
  init(): void {
    try {
      const workspaceUris = workspace.workspaceFolders.map(folder => folder.uri.path);
      const [hasError, activeFileUri] = this.activeFileUri;

      if (!hasError) {
        const workspaceUriMatch = workspaceUris.filter(uri => activeFileUri.startsWith(uri));

        // If we found a workspace matching the active file:
        if (workspaceUriMatch.length !== 0) {
          this.activeWorkspaceUri = workspaceUriMatch[0];

          return;
        }
      }

      this.activeWorkspaceUri = workspaceUris[0];
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#init()');
    }
  }

  bindEvents(): void {
    try {
      workspace.onDidOpenTextDocument(this.maybeUpdateActiveWorkspaceUriOnFileOpened.bind(this));
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#bindEvents()');
    }
  }

  bindCommands(context: ExtensionContext): void {
    try {
      // Debounce the commands in order to avoid a DISPOSED error:
      // https://github.com/microsoft/vscode-cosmosdb/issues/681
      context.subscriptions.push(
        commands.registerCommand(COMMAND.COMMIT_ALL_FILES, () => this.addAndCommit(true), 1000),
        commands.registerCommand(COMMAND.COMMIT_CURRENT_FILE, () => this.addAndCommit(), 1000),
        commands.registerCommand(COMMAND.PUSH_CURRENT_BRANCH, () => this.push(), 1000),
      );
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#bindCommands()');
    }
  }

  /**
   * @todo Check case `workspaceUriMatch.length > 1`.
   */
  private maybeUpdateActiveWorkspaceUriOnFileOpened(openedFile: TextDocument): void {
    try {
      if (openedFile.uri.scheme !== 'file') return;

      const workspaceUris = workspace.workspaceFolders.map(folder => folder.uri.path);
      const workspaceUriMatch = workspaceUris.filter(uri => openedFile.uri.path.startsWith(uri));
      if (workspaceUriMatch.length === 0) return;

      // If we found a workspace matching the opened file:
      this.activeWorkspaceUri = workspaceUriMatch[0];
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#maybeUpdateActiveWorkspaceUriOnFileOpened()');
    }
  }

  /**
   * @todo Allow default remote name customization in settings.
   */
  async push() {
    try {
      const [hasError, git] = this.git;
      if (hasError) return;

      const remoteName = 'origin';
      const preStatus = await git.status();
      const { current: branchName } = preStatus;
      await git.fetch(remoteName, branchName, { '--prune': null });
      const status = await git.status();
      const { ahead, behind, conflicted } = status;
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
      await git.push('origin', branchName);
      cancellationTokenSource.cancel();
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#push()');
    }
  }

  /**
   * @todo Allow default remote name customization in settings.
   */
  async addAndCommit(isAll = false) {
    try {
      const [hasError1, git] = await this.git;
      if (hasError1) return;

      const remoteName = 'origin';
      const preStatus = await git.status();
      const { current: branchName } = preStatus;
      await git.fetch(remoteName, branchName, { '--prune': null });
      const status = await git.status();
      const { behind, conflicted } = status;
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

      if (isAll) {
        const [hasError3, commits] = await this.committer.process(status);
        if (hasError3) return;

        for (const commit of commits) {
          await git.add(commit.paths);
          await git.commit(commit.message);
        }

        return;
      }

      if (status.staged.length !== 0) {
        window.showWarningMessage(
          `You already have staged changes for this file or another one. ` +
            `Please commit or cancel them in order to be able to commit this file.`,
        );

        return;
      }

      const [hasError2, activeFilePath] = this.checkAndGetActiveFile();
      if (hasError2) return;

      const statusPairs = Object.entries(status);
      const activeFileStatusPairs = statusPairs.filter(
        ([, paths]) => Array.isArray(paths) && paths.includes(activeFilePath),
      );
      if (activeFileStatusPairs.length === 0) {
        window.showWarningMessage(
          `This file doesn't have any tracked change. Did you forget to save it ?`,
        );

        return;
      }

      const [activeFileGitState] = activeFileStatusPairs[0];
      let singledStatus: simpleGit.StatusResult;
      switch (activeFileGitState) {
        case 'created':
          singledStatus = { ...status, ...GIT_STATUS_ZERO, created: [activeFilePath] };
          break;

        case 'deleted':
          singledStatus = { ...status, ...GIT_STATUS_ZERO, deleted: [activeFilePath] };
          break;

        case 'modified':
          singledStatus = { ...status, ...GIT_STATUS_ZERO, modified: [activeFilePath] };
          break;

        case 'not_added':
          singledStatus = { ...status, ...GIT_STATUS_ZERO, not_added: [activeFilePath] };
          break;

        default:
          throw new Error(`Unable to resolve the active file Git state.`);
      }

      const [hasError3, commits] = await this.committer.process(singledStatus);
      if (hasError3) return;

      await git.add(commits[0].paths);
      await git.commit(commits[0].message);
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#addAndCommit()');
    }
  }

  checkAndGetActiveFile(): CanFail<string> {
    try {
      const activeTextEditor = window.activeTextEditor;

      if (activeTextEditor === undefined) {
        window.showWarningMessage(
          `Unable the commit the currently opened file since there is none. ` +
            `Did you want to add and commit everything instead ?`,
        );

        return [true];
      }

      if (activeTextEditor.document.isUntitled) {
        window.showWarningMessage(`Unable to commit an untitled file. Did you forget to save it ?`);

        return [true];
      }

      const activeFilePath = activeTextEditor.document.uri.path.substr(
        this.activeWorkspaceUri.length + 1,
      );

      return [false, activeFilePath];
    } catch (err) {
      handleUnexpectedError(err, 'GitAutomator#checkAndGetActiveFile()');
    }
  }
}
