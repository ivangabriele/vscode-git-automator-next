import * as assert from 'assert';
import { before, suite, test } from 'mocha';

import * as vscode from 'vscode';

suite('Git Automator Test Suite', () => {
  before(() => {
    vscode.window.showInformationMessage('Start all tests.');
  });

  test('Dummy test', () => {
    assert.equal(1, 1);
  });
});
