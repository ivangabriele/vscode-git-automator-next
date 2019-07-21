import * as path from 'path';

import { runTests } from 'vscode-test';

(async function() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../..');
    const extensionTestsPath = path.resolve(__dirname, 'runSuite.js');
    // const jsWorkspace = path.resolve(__dirname, 'fixtures/js-workspace');

    // Download VS Code, unzip it and run integration tests:
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error(`Integrations Tests: ${err.message}`);

    process.exit(1);
  }
})();
