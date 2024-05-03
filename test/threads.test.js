/* eslint-env jest */
import { join } from 'path';

import { loadESLint, loadESLintThreaded } from '../src/getESLint';

describe('Threading', () => {
  test('Threaded interface should look like non-threaded interface', async () => {
    const single = await loadESLint({});
    const threaded = await loadESLintThreaded('foo', 1, {});
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
    const threaded = await loadESLintThreaded('bar', 1, { ignore: false });
    try {
      const [good, bad] = await Promise.all([
        threaded.lintFiles(join(__dirname, 'fixtures/good.js')),
        threaded.lintFiles(join(__dirname, 'fixtures/error.js')),
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
              this.lintFiles = mockLintFiles;
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
      await lintFiles('foo');
      expect(mockLintFiles).toHaveBeenCalledWith('foo');
      await setup({ eslintOptions: { fix: true } });
      await lintFiles('foo');
    });
  });
});
