export default class LintDirtyModulesPlugin {
  constructor(compiler: any, options: any);
  compiler: any;
  options: any;
  startTime: number;
  prevTimestamps: {};
  isFirstRun: boolean;
  apply(compilation: any, callback: any): void;
  getChangedFiles(fileTimestamps: any, glob: any): any[];
}
