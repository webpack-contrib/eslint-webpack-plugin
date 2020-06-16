import { isMatch } from 'micromatch';

export default class DirtyFileWatcher {
  constructor({ files = [] }) {
    this.patterns = files;
    this.startTime = Date.now();
    this.prevTimestamps = {};
    this.isFirstRun = true;
  }

  getDirtyFiles({ fileTimestamps = new Map() }) {
    if (this.isFirstRun) {
      this.isFirstRun = false;
      this.prevTimestamps = fileTimestamps;
      return [];
    }
    if (this.patterns.length <= 0 || fileTimestamps.length <= 0) {
      return [];
    }

    const glob = this.patterns.join('|').replace(/\\/g, '/');
    const changedFiles = this.filterChangedFiles(fileTimestamps, glob);

    this.prevTimestamps = fileTimestamps;

    return changedFiles;
  }

  filterChangedFiles(fileTimestamps, glob) {
    const getTimestamps = (fileSystemInfoEntry) => {
      return fileSystemInfoEntry && fileSystemInfoEntry.timestamp
        ? fileSystemInfoEntry.timestamp
        : fileSystemInfoEntry;
    };

    const hasFileChanged = (filename, fileSystemInfoEntry) => {
      const prevTimestamp = getTimestamps(this.prevTimestamps.get(filename));
      const timestamp = getTimestamps(fileSystemInfoEntry);

      return (prevTimestamp || this.startTime) < (timestamp || Infinity);
    };

    const changedFiles = [];

    for (const [filename, timestamp] of fileTimestamps.entries()) {
      if (hasFileChanged(filename, timestamp) && isMatch(filename, glob)) {
        changedFiles.push(filename);
      }
    }

    return changedFiles;
  }
}
