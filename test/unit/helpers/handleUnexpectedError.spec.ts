/// <reference types="@types/jest" />

import { window } from 'vscode';

import handleUnexpectedError from '../../../src/helpers/handleUnexpectedError';

describe('helpers/handleUnexpectedError()', () => {
  test('should show the expected error message with a string', async () => {
    await handleUnexpectedError('An error', 'Somewhere');

    expect(window.showErrorMessage).toHaveBeenCalledWith(
      `[Somewhere] An unexpected error occured: An error`,
    );
  });

  test('should show the expected error message with an Error', async () => {
    await handleUnexpectedError(new Error('An error'), 'Somewhere');

    expect(window.showErrorMessage).toHaveBeenCalledWith(
      `[Somewhere] An unexpected error occured: An error`,
    );
  });
});
