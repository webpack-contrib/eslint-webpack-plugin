import { join } from 'path';

import webpack from 'webpack';

import ESLintPlugin from '../src/index';

describe('empty', () => {
  it('error when no files matching', (done) => {
    const compiler = webpack({
      context: join(__dirname, 'fixtures', 'empty'),
      mode: 'development',
      entry: '../index',
      plugins: [new ESLintPlugin()],
    });

    compiler.run((err, stats) => {
      const { errors } = stats.compilation;
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/No files matching/i);
      done();
    });
  });
});
