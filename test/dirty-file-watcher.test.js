import { resolve } from 'path';

import DirtyFileWatcher from '../src/DirtyFileWatcher';

describe('dirty file watcher', () => {
  const fixtures = resolve(__dirname, 'fixtures');

  it('returns empty on initial run', () => {
    const watcher = new DirtyFileWatcher('**/*');
    const dirtyFiles = watcher.getDirtyFiles(
      new Map([['/hello/world.js', { timestamp: Number.MAX_VALUE }]])
    );

    expect(dirtyFiles).toHaveLength(0);
  });

  it('returns changed files', () => {
    const watcher = new DirtyFileWatcher('**/*');
    const insideFolder = resolve(fixtures, 'folder/unix.js');
    const changed = resolve(fixtures, 'changed.js');
    const unchagned = resolve(fixtures, 'unchanged.js');

    watcher.getDirtyFiles(
      new Map([
        [insideFolder, { timestamp: 1 }],
        [changed, { timestamp: 1 }],
        [unchagned, { timestamp: 1 }],
      ])
    );

    const dirtyFiles = watcher.getDirtyFiles(
      new Map([
        [insideFolder, { timestamp: 2 }],
        [changed, { timestamp: 2 }],
        [unchagned, { timestamp: 1 }],
      ])
    );

    expect(dirtyFiles).toHaveLength(2);
    expect(dirtyFiles).toContain(insideFolder);
    expect(dirtyFiles).toContain(changed);
  });

  it('returns new files', () => {
    const watcher = new DirtyFileWatcher('**/*');
    const created = resolve(fixtures, 'created.js');

    watcher.getDirtyFiles();

    const dirtyFiles = watcher.getDirtyFiles(
      new Map([[created, { timestamp: Number.MAX_VALUE }]])
    );

    expect(dirtyFiles).toHaveLength(1);
    expect(dirtyFiles).toContain(created);
  });

  it('returns file if it does not have a timestamp', () => {
    const watcher = new DirtyFileWatcher('**/*');
    const noTimestamp = resolve(fixtures, 'no-timestamp.js');

    watcher.getDirtyFiles();

    const dirtyFiles = watcher.getDirtyFiles(new Map([[noTimestamp]]));

    expect(dirtyFiles).toHaveLength(1);
    expect(dirtyFiles).toContain(noTimestamp);
  });

  it('returns no files when options.files is empty', () => {
    const watcher = new DirtyFileWatcher();

    const changed = resolve(fixtures, 'changed.js');

    watcher.getDirtyFiles(new Map([[changed, 1]]));

    const dirtyFiles = watcher.getDirtyFiles(new Map([[changed, 2]]));

    expect(dirtyFiles).toHaveLength(0);
  });

  it('does not throw when timestamps are unavailable', () => {
    const watcher = new DirtyFileWatcher('**/*');

    watcher.getDirtyFiles();

    const dirtyFiles = watcher.getDirtyFiles();

    expect(dirtyFiles).toHaveLength(0);
  });
});
