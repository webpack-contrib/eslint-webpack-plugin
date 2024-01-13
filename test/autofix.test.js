import { join } from 'path';

import { copySync, removeSync, readFileSync } from 'fs-extra';

import pack from './utils/pack';

describe('autofix stop', () => {
  const entry = join(__dirname, 'fixtures/fixable-clone.js');

  beforeAll(() => {
    copySync(join(__dirname, 'fixtures/fixable.js'), entry);
  });

  afterAll(() => {
    removeSync(entry);
  });

  test.each([[{}], [{ threads: false }]])(
    'should not throw error if file ok after auto-fixing',
    async (cfg) => {
      const compiler = pack('fixable-clone', {
        ...cfg,
        fix: true,
        extensions: ['js', 'cjs', 'mjs'],
        overrideConfig: {
          rules: { semi: ['error', 'always'] },
        },
      });

      const stats = await compiler.runAsync();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      expect(readFileSync(entry).toString('utf8')).toMatchInlineSnapshot(`
        "function foo() {
          return true;
        }

        foo();
        "
      `);
    },
  );
});
