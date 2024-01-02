import { join } from 'path';

import pack from './utils/pack';

describe('succeed on flat-configuration', () => {
  it('cannot load FlatESLint class on default ESLint module', (done) => {
    const overrideConfigFile = join(__dirname, 'fixtures', 'flat-config.js');
    const compiler = pack('full-of-problems', {
      configType: 'flat',
      overrideConfigFile,
      threads: 1,
    });

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      const { errors } = stats.compilation;

      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /Couldn't find FlatESLint, you might need to set eslintPath to 'eslint\/use-at-your-own-risk'/i,
      );
      done();
    });
  });

  (process.version.match(/^v(\d+\.\d+)/)[1] >= 20 ? it : it.skip)(
    'finds errors on files',
    (done) => {
      const overrideConfigFile = join(__dirname, 'fixtures', 'flat-config.js');
      const compiler = pack('full-of-problems', {
        configType: 'flat',
        // needed for now
        eslintPath: 'eslint/use-at-your-own-risk',
        overrideConfigFile,
        threads: 1,
      });

      compiler.run((err, stats) => {
        expect(err).toBeNull();
        const { errors } = stats.compilation;

        expect(stats.hasErrors()).toBe(true);
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/full-of-problems\.js/i);
        expect(stats.hasWarnings()).toBe(true);
        done();
      });
    },
  );
});
