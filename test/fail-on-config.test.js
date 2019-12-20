import { join } from 'path';

import pack from './utils/pack';

describe('fail on config', () => {
  it('fails when .eslintrc is not a proper format', (done) => {
    const configFile = join(__dirname, '.badeslintrc');
    const compiler = pack('error', { configFile });

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        /ESLint configuration in --config is invalid/i
      );
      done();
    });
  });
});
