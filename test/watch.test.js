import { join } from 'path';
import { writeFileSync } from 'fs';

import { removeSync } from 'fs-extra';

import pack from './utils/pack';

const target = join(__dirname, 'fixtures', 'watch-entry.js');
const targetExpectedPattern = expect.stringMatching(
  target.replace(/\\/g, '\\\\')
);

describe('watch', () => {
  afterEach(() => {
    removeSync(target);
  });

  it('should watch', (done) => {
    const compiler = pack('good');

    const watch = compiler.watch({}, (err, stats) => {
      watch.close();
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });

  it('should watch with unique messages', (done) => {
    writeFileSync(target, 'var foo = stuff\n');

    let next = firstPass;
    const compiler = pack('watch');
    const watch = compiler.watch({}, (err, stats) => next(err, stats));

    function firstPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors.length).toBe(1);
      const [{ message }] = errors;
      expect(message).toEqual(targetExpectedPattern);
      expect(message).toEqual(expect.stringMatching('\\(3 errors,'));

      next = secondPass;

      writeFileSync(target, 'const foo = false;\n');
    }

    function secondPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors.length).toBe(1);
      const [{ message }] = errors;
      expect(message).toEqual(targetExpectedPattern);
      expect(message).toEqual(expect.stringMatching('no-unused-vars'));
      expect(message).toEqual(expect.stringMatching('\\(1 error,'));

      next = thirdPass;

      writeFileSync(target, 'const foo = 0\n');
    }

    function thirdPass(err, stats) {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(true);
      const { errors } = stats.compilation;
      expect(errors.length).toBe(1);
      const [{ message }] = errors;
      expect(message).toEqual(targetExpectedPattern);
      expect(message).toEqual(expect.stringMatching('no-unused-vars'));
      expect(message).toEqual(expect.stringMatching('\\(1 error,'));

      next = finish;

      writeFileSync(
        target,
        '/* eslint-disable no-unused-vars */\nconst foo = false;\n'
      );
    }

    function finish(err, stats) {
      watch.close();
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    }
  });
});
