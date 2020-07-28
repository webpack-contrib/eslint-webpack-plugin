import { isMatch } from 'micromatch';

import { parseFoldersToGlobs } from './utils';

export default class DirtyFileWatcher {
  /**
   * @param {string|string[]=} files
   * @param {string|string[]=} extensions
   */
  constructor(files = [], extensions = 'js') {
    this.startTime = Date.now();
    this.prevTimestamps = new Map();
    this.isFirstRun = true;
    this.globs = parseFoldersToGlobs(files, extensions);
  }

  /**
   * @param {Map<string,number>=} fileTimestamps
   * @returns {string[]}
   */
  getDirtyFiles(fileTimestamps = new Map()) {
    if (this.isFirstRun) {
      this.isFirstRun = false;
      this.prevTimestamps = fileTimestamps;
      return [];
    }

    if (this.globs.length <= 0 || fileTimestamps.size <= 0) {
      return [];
    }

    const changedFiles = this.filterChangedFiles(fileTimestamps, this.globs);

    this.prevTimestamps = fileTimestamps;

    return changedFiles;
  }

  /**
   * @param {Map<string,number>} fileTimestamps
   * @param {string|string[]} globs
   * @returns {string[]}
   */
  filterChangedFiles(fileTimestamps, globs) {
    /**
     * @param {{timestamp:number}|number} fileSystemInfoEntry
     * @returns {number}
     */
    const getTimestamps = (fileSystemInfoEntry) => {
      // @ts-ignore
      if (fileSystemInfoEntry && fileSystemInfoEntry.timestamp) {
        // @ts-ignore
        return fileSystemInfoEntry.timestamp;
      }

      // @ts-ignore
      return fileSystemInfoEntry;
    };

    /**
     * @param {string} filename
     * @param {{timestamp:number}|number} fileSystemInfoEntry
     * @returns {boolean}
     */
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
