import {
  CancellationToken,
  CancellationTokenSource,
  Progress,
  ProgressLocation,
  window,
} from 'vscode';

type Task = (
  progress: Progress<{ message?: string; increment?: number }>,
  token: CancellationToken,
) => Thenable<void>;

const TIMEOUT = 30_000;

/**
 * Show a cancellable "infinite" progress notification.
 *
 * @description
 * Has a timeout of 30s.
 */
export default function showProgressNotification(message: string) {
  const options = {
    cancellable: false,
    location: ProgressLocation.Notification,
    title: message,
  };

  const cancellationTokenSource = new CancellationTokenSource();
  const task: Task = () =>
    new Promise(resolve => {
      const timeoutId = setTimeout(resolve, TIMEOUT);

      cancellationTokenSource.token.onCancellationRequested(() => {
        clearTimeout(timeoutId);
        resolve();
      });
    });

  window.withProgress(options, task);

  return cancellationTokenSource;
}
