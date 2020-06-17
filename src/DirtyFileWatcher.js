import { statSync } from 'fs';

import { isMatch } from 'micromatch';

export default class DirtyFileWatcher {
  constructor({ files = [], extensions = ['js'] }) {
    this.patterns = files;
    this.extensions = extensions;
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

    const unixPatterns = this.patterns.map((pattern) => {
      return pattern.replace(/\\/gu, '/');
    });
    const globs = parseFoldersToGlobs(unixPatterns, this.extensions);
    const changedFiles = this.filterChangedFiles(fileTimestamps, globs);

    this.prevTimestamps = fileTimestamps;

    return changedFiles;
  }

  filterChangedFiles(fileTimestamps, globs) {
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
      if (hasFileChanged(filename, timestamp) && isMatch(filename, globs)) {
        changedFiles.push(filename);
      }
    }

    return changedFiles;
  }
}

function parseFoldersToGlobs(patterns, extensions) {
  const extensionsGlob = extensions
    .map((extension) => extension.replace(/^\./u, ''))
    .join(',');
  return patterns.map((pattern) => {
    try {
      // The patterns are absolute because they are prepended with the context.
      const stats = statSync(pattern);
      if (stats.isDirectory()) {
        return pattern.replace(/[/\\]?$/u, `/**/*.{${extensionsGlob}}`);
      }
    } catch (_) {
      // Return the pattern as is on error.
    }
    return pattern;
  });
}
