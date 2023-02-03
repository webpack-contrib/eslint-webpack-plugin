import { join } from 'path';

import { removeSync } from 'fs-extra';

import webpack from 'webpack';

import conf from './utils/conf';

describe('error (cached module)', () => {
  const cacheLocation = join(__dirname, 'cache');

  beforeEach(() => {
    removeSync(cacheLocation);
  });

  afterAll(() => {
    removeSync(cacheLocation);
  });

  it('should return error even if module is cached', (done) => {
    const config = conf('error');
    config.cache = {
      type: 'filesystem',
      idleTimeout: 0,
      idleTimeoutAfterLargeChanges: 0,
      idleTimeoutForInitialStore: 0,
      cacheLocation,
    };

    const c1 = webpack(config);

    c1.run((err1, stats1) => {
      expect(err1).toBeNull();
      expect(stats1.hasWarnings()).toBe(false);
      expect(stats1.hasErrors()).toBe(true);

      c1.close(() => {
        const c2 = webpack(config);
        c2.run((err2, stats2) => {
          expect(err2).toBeNull();
          expect(stats2.hasWarnings()).toBe(false);
          expect(stats2.hasErrors()).toBe(true);

          done();
        });
      });
    });
  });
});
