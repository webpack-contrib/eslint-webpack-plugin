import { join } from 'path';

import pack from './utils/pack';
import { ESLint } from 'eslint';

(ESLint && parseFloat(ESLint.version) >= 9 ? describe.skip : describe)(
  'succeed on flat-configuration',
  () => {
    it('cannot load FlatESLint class on default ESLint module', async () => {
      const overrideConfigFile = join(__dirname, 'fixtures', 'flat-config.js');
      const compiler = pack('full-of-problems', {
        configType: 'flat',
        overrideConfigFile,
        threads: 1,
      });

      const stats = await compiler.runAsync();
      const { errors } = stats.compilation;

      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Couldn't find FlatESLint, you might need to set eslintPath to 'eslint\/use-at-your-own-risk'/i,
      );
    });

    (process.version.match(/^v(\d+\.\d+)/)[1] >= 20 ? it : it.skip)(
      'finds errors on files',
      async () => {
        const overrideConfigFile = join(
          __dirname,
          'fixtures',
          'flat-config.js',
        );
        const compiler = pack('full-of-problems', {
          configType: 'flat',
          // needed for now
          eslintPath: 'eslint/use-at-your-own-risk',
          overrideConfigFile,
          threads: 1,
        });

        const stats = await compiler.runAsync();
        const { errors } = stats.compilation;

        expect(stats.hasErrors()).toBe(true);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/full-of-problems\.js/i);
        expect(stats.hasWarnings()).toBe(true);
      },
    );
  },
);
