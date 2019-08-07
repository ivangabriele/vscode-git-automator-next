import { StatusResult } from 'simple-git/promise';
import { window } from 'vscode';

import FILES, { DataFile } from './data/FILES';
import handleUnexpectedError from './helpers/handleUnexpectedError';
import { CanFail } from './types';

type CommitterCommit = {
  message: string;
  paths: string[];
};

/**
 * Git commits generator.
 */
export default class Committer {
  private commits: CommitterCommit[];

  public async process(gitStatus: StatusResult): Promise<CanFail<CommitterCommit[]>> {
    try {
      this.commits = [];

      this.processCreatedFiles([...gitStatus.not_added, ...gitStatus.created]);
      this.processDeletedFiles(gitStatus.deleted);
      this.processModifiedFiles(gitStatus.modified);

      const hasError = await this.promptUser();
      if (hasError) return [true];

      return [false, this.commits];
    } catch (err) {
      handleUnexpectedError(err, 'Committer#process()');

      return [true];
    }
  }

  private processCreatedFiles(filePaths: string[]) {
    try {
      const newCommits = filePaths.map(path => {
        const [scope, file] = this.convertPathToScope(path);
        const action = this.guessAction('onCreate', file);

        return {
          message: `${scope}: ${action}`,
          paths: [path],
        };
      });

      this.commits = [...this.commits, ...newCommits];
    } catch (err) {
      handleUnexpectedError(err, 'Committer#processCreatedFiles()');
    }
  }

  private processDeletedFiles(filePaths: string[]) {
    try {
      const newCommits = filePaths.map(path => {
        const [scope, file] = this.convertPathToScope(path);
        const action = this.guessAction('onDelete', file);

        return {
          message: `${scope}: ${action}`,
          paths: [path],
        };
      });

      this.commits = [...this.commits, ...newCommits];
    } catch (err) {
      handleUnexpectedError(err, 'Committer#processDeletedFiles()');
    }
  }

  private processModifiedFiles(filePaths: string[]) {
    try {
      const newCommits = filePaths.map(path => {
        const [scope, file] = this.convertPathToScope(path);
        const action = this.guessAction('onModify', file);

        return {
          message: `${scope}: ${action}`,
          paths: [path],
        };
      });

      this.commits = [...this.commits, ...newCommits];
    } catch (err) {
      handleUnexpectedError(err, 'Committer#processModifiedFiles()');
    }
  }

  private convertPathToScope(path: string): [string, DataFile?] {
    try {
      // Normalize Windows backslashes
      const normalizedPath = path.replace(/\\/g, '/');
      const filePathChunks = normalizedPath.split(/\//g);
      console.log(filePathChunks);
      const fileNameWithExtension = filePathChunks.pop();
      const filePath = filePathChunks.join('/');

      const scopePath = filePath
        // Remove leading "lib/":
        .replace(/^lib\//, '')
        // Remove leading "packages/"
        .replace(/^packages\//, '')
        // Remove any "src/"
        .replace(/src\//g, '');

      let scope;
      const fileMatch = FILES.find(file => file.pattern.test(fileNameWithExtension));
      if (fileMatch !== undefined) {
        scope = fileMatch.scopeLabel;
      } else {
        scope = fileNameWithExtension
          // Remove leading dot:
          .replace(/^\./, '')
          // Remove file extension:
          .replace(/\.[^\.]+$/, '');
      }

      return [scopePath.length === 0 ? scope : `${scopePath}/${scope}`, fileMatch];
    } catch (err) {
      handleUnexpectedError(err, 'Committer#convertPathToScope()');
    }
  }

  guessAction(actionType: keyof DataFile['actionLabel'], file?: DataFile): string {
    try {
      if (
        file !== undefined &&
        file.actionLabel !== undefined &&
        file.actionLabel[actionType] !== undefined
      ) {
        return file.actionLabel[actionType];
      }

      return {
        onCreate: 'create',
        onDelete: 'delete',
        onModify: '',
      }[actionType];
    } catch (err) {
      handleUnexpectedError(err, 'Committer#guessAction()');
    }
  }

  private async promptUser(): Promise<boolean> {
    try {
      const iMax = this.commits.length;
      let i = -1;
      // tslint:disable-next-line: no-increment-decrement
      while (++i < iMax) {
        const newMessage = await window.showInputBox({
          ignoreFocusOut: true,
          prompt: `Commit n°${i + 1}/${iMax}`,
          value: this.commits[i].message,
        });
        if (newMessage === undefined) return true;

        this.commits[i].message = newMessage;
      }

      return false;
    } catch (err) {
      handleUnexpectedError(err, 'Committer#promptUser()');

      return true;
    }
  }
}
