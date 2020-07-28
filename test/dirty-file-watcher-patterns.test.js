import { resolve } from 'path';

import DirtyFileWatcher from '../src/DirtyFileWatcher';

describe('dirty file watcher file patterns', () => {
  const fixtures = resolve(__dirname, 'fixtures');

  it('watches pattern "folder"', () => {
    const watcher = new DirtyFileWatcher(resolve(fixtures, 'folder'));
    const inFolder = resolve(fixtures, 'folder/inside.js');
    const inNestedFolder = resolve(fixtures, 'folder/nested/inside.js');
    const wrongExtension = resolve(fixtures, 'folder/wrong.ts');
    const outside = resolve(fixtures, 'outside.js');

    watcher.getDirtyFiles(
      new Map([
        [inFolder, { timestamp: 1 }],
        [inNestedFolder, { timestamp: 1 }],
        [wrongExtension, { timestamp: 1 }],
        [outside, { timestamp: 1 }],
      ])
    );

    const dirtyFiles = watcher.getDirtyFiles(
      new Map([
        [inFolder, { timestamp: 2 }],
        [inNestedFolder, { timestamp: 2 }],
        [wrongExtension, { timestamp: 2 }],
        [outside, { timestamp: 2 }],
      ])
    );

    expect(dirtyFiles).toHaveLength(2);
    expect(dirtyFiles).toContain(inFolder);
    expect(dirtyFiles).toContain(inNestedFolder);
  });

  it('watches folder pattern "folder/"', () => {
    const watcher = new DirtyFileWatcher(resolve(fixtures, 'folder/'));
    const inFolder = resolve(fixtures, 'folder/inside.js');
    const inNestedFolder = resolve(fixtures, 'folder/nested/inside.js');
    const wrongExtension = resolve(fixtures, 'folder/wrong.ts');
    const outside = resolve(fixtures, 'outside.js');

    watcher.getDirtyFiles(
      new Map([
        [inFolder, { timestamp: 1 }],
        [inNestedFolder, { timestamp: 1 }],
        [wrongExtension, { timestamp: 1 }],
        [outside, { timestamp: 1 }],
      ])
    );

    const dirtyFiles = watcher.getDirtyFiles(
      new Map([
        [inFolder, { timestamp: 2 }],
        [inNestedFolder, { timestamp: 2 }],
        [wrongExtension, { timestamp: 2 }],
        [outside, { timestamp: 2 }],
      ])
    );

    expect(dirtyFiles).toHaveLength(2);
    expect(dirtyFiles).toContain(inFolder);
    expect(dirtyFiles).toContain(inNestedFolder);
  });

  it('watches glob pattern "**/*"', () => {
    const watcher = new DirtyFileWatcher(resolve(fixtures, '**/*'));
    const inside = resolve(fixtures, 'inside.js');
    const inNestedFolder = resolve(fixtures, 'folder/nested/inside.js');
    const wrongExtension = resolve(fixtures, 'wrong.ts');

    watcher.getDirtyFiles(
      new Map([
        [inside, { timestamp: 1 }],
        [inNestedFolder, { timestamp: 1 }],
        [wrongExtension, { timestamp: 1 }],
      ])
    );

    const dirtyFiles = watcher.getDirtyFiles(
      new Map([
        [inside, { timestamp: 2 }],
        [inNestedFolder, { timestamp: 2 }],
        [wrongExtension, { timestamp: 2 }],
      ])
    );

    expect(dirtyFiles).toHaveLength(3);
    expect(dirtyFiles).toContain(inside);
    expect(dirtyFiles).toContain(inNestedFolder);
    // options.extensions should not be enforced on file and glob patterns.
    expect(dirtyFiles).toContain(wrongExtension);
  });

  it('watches file pattern "good.js"', () => {
    const file = resolve(fixtures, 'good.js');
    const watcher = new DirtyFileWatcher(file, '.ts');

    watcher.getDirtyFiles(new Map([[file, { timestamp: 1 }]]));

    const dirtyFiles = watcher.getDirtyFiles(
      new Map([[file, { timestamp: 2 }]])
    );

    // options.extensions should not be enforced on file and glob patterns.
    expect(dirtyFiles).toHaveLength(1);
    expect(dirtyFiles).toContain(file);
  });

  it('uses extensions with folder patterns', () => {
    const watcher = new DirtyFileWatcher(resolve(fixtures, 'folder/'), [
      'ts',
      '.tsx',
    ]);
    const inFolder = resolve(fixtures, 'folder/inside.tsx');
    const inNestedFolder = resolve(fixtures, 'folder/nested/inside.ts');
    const wrongExtension = resolve(fixtures, 'folder/wrong.js');
    const outside = resolve(fixtures, 'outside.ts');

    watcher.getDirtyFiles(
      new Map([
        [inFolder, { timestamp: 1 }],
        [inNestedFolder, { timestamp: 1 }],
        [wrongExtension, { timestamp: 1 }],
        [outside, { timestamp: 1 }],
      ])
    );

    const dirtyFiles = watcher.getDirtyFiles(
      new Map([
        [inFolder, { timestamp: 2 }],
        [inNestedFolder, { timestamp: 2 }],
        [wrongExtension, { timestamp: 2 }],
        [outside, { timestamp: 2 }],
      ])
    );

    expect(dirtyFiles).toHaveLength(2);
    expect(dirtyFiles).toContain(inFolder);
    expect(dirtyFiles).toContain(inNestedFolder);
  });
});
