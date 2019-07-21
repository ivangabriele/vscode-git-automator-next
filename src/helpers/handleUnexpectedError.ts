import { window } from 'vscode';

/**
 * Handle unexpected errors.
 */
export default async function handleUnexpectedError(err: Error | string, scope: string) {
  const message = typeof err === 'string' ? err : err.message;

  await window.showErrorMessage(`[${scope}] An unexpected error occured: ${message}`);
}
