export default class DirtyFileWatcher {
  /**
   * @param {string|string[]=} files
   * @param {string|string[]=} extensions
   */
  constructor(
    files?: (string | string[]) | undefined,
    extensions?: (string | string[]) | undefined
  );
  startTime: number;
  prevTimestamps: Map<any, any>;
  isFirstRun: boolean;
  globs: string[];
  /**
   * @param {Map<string,number>=} fileTimestamps
   * @returns {string[]}
   */
  getDirtyFiles(fileTimestamps?: Map<string, number> | undefined): string[];
  /**
   * @param {Map<string,number>} fileTimestamps
   * @param {string|string[]} globs
   * @returns {string[]}
   */
  filterChangedFiles(
    fileTimestamps: Map<string, number>,
    globs: string | string[]
  ): string[];
}
