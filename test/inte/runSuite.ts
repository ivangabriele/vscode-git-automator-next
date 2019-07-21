// tslint:disable-next-line: variable-name
const Mocha = require('mocha');
import * as glob from 'glob';
import * as path from 'path';

export async function run() {
  const mocha = new Mocha({
    color: true,
    ui: 'tdd',
  });

  const testsRoot = path.resolve(__dirname, 'suite');

  return new Promise((resolve, reject) => {
    glob('**/**.spec.js', { cwd: testsRoot }, (err, filePaths: string[]) => {
      if (err) return reject(err);

      filePaths.forEach(filePath => mocha.addFile(path.resolve(testsRoot, filePath)));

      try {
        mocha.run(failuresCount => {
          if (failuresCount > 0) {
            return reject(new Error(`Integration Tests: ${failuresCount} tests failed.`));
          }

          resolve();
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}
