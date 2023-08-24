/* eslint-env jest */
import { join } from 'path';

import { readFileSync } from 'fs-extra';

import { loadESLint, loadESLintThreaded } from '../src/getESLint';

describe('Threading', () => {
  test('Threaded interface should look like non-threaded interface', async () => {
    const single = loadESLint({});
    const threaded = loadESLintThreaded('foo', 1, {});
    for (const key of Object.keys(single)) {
      expect(typeof single[key]).toEqual(typeof threaded[key]);
    }

    expect(single.Eslint).toBe(threaded.Eslint);
    expect(single.eslint).not.toBe(threaded.eslint);
    expect(single.lintFiles).not.toBe(threaded.lintFiles);
    expect(single.cleanup).not.toBe(threaded.cleanup);

    single.cleanup();
    threaded.cleanup();
  });

  test('Threaded should lint files', async () => {
    const threaded = loadESLintThreaded('bar', 1, { ignore: false });
    try {
      const goodFile = join(__dirname, 'fixtures/good.js');
      const badFile = join(__dirname, 'fixtures/error.js');

      const [good, bad] = await Promise.all([
        threaded.lintFiles([
          { path: goodFile, content: readFileSync(goodFile).toString('utf8') },
        ]),
        threaded.lintFiles([
          { path: badFile, content: readFileSync(badFile).toString('utf8') },
        ]),
      ]);
      expect(good[0].errorCount).toBe(0);
      expect(good[0].warningCount).toBe(0);
      expect(bad[0].errorCount).toBe(3);
      expect(bad[0].warningCount).toBe(0);
    } finally {
      threaded.cleanup();
    }
  });

  describe('worker coverage', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    test('worker can start', async () => {
      const mockThread = { parentPort: { on: jest.fn() }, workerData: {} };
      const mockLintFiles = jest.fn();
      jest.mock('eslint', () => {
        return {
          ESLint: Object.assign(
            function ESLint() {
              this.lintText = mockLintFiles;
            },
            {
              outputFixes: jest.fn(),
            },
          ),
        };
      });
      jest.mock('worker_threads', () => mockThread);
      const { setup, lintFiles } = require('../src/worker');

      await setup({});
      await lintFiles([{ path: 'foo', content: '' }]);
      expect(mockLintFiles).toHaveBeenCalledWith('', { filePath: 'foo' });
      await setup({ eslintOptions: { fix: true } });
      await lintFiles([{ path: 'foo', content: '' }]);
    });
  });
});
