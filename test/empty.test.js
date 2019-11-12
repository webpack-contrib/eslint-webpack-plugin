import { join } from 'path';

import webpack from 'webpack';

import ESLintPlugin from '../src/index';

describe('empty', () => {
  it('error when no files matching', (done) => {
    const compiler = webpack({
      context: join(__dirname, 'fixtures', 'empty'),
      mode: 'development',
      plugins: [new ESLintPlugin()],
    });

    compiler.run((err) => {
      expect(err.message).toMatch(/No files matching/i);
      done();
    });
  });
});
