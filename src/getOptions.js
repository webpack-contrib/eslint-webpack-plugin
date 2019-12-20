import validateOptions from 'schema-utils';

import schema from './options.json';
import getCLIEngine from './getCLIEngine';

export default function getOptions(pluginOptions) {
  const options = {
    files: '.',
    ...pluginOptions,
  };

  validateOptions(schema, options, {
    name: 'ESLint Webpack Plugin',
    baseDataPath: 'options',
  });

  const { CLIEngine } = getCLIEngine(options, false);

  options.formatter = getFormatter(CLIEngine, options.formatter);

  if (options.outputReport && options.outputReport.formatter) {
    options.outputReport.formatter = getFormatter(
      CLIEngine,
      options.outputReport.formatter
    );
  }

  return options;
}

function getFormatter(CLIEngine, formatter) {
  if (typeof formatter === 'function') {
    return formatter;
  }

  // Try to get oficial formatter
  if (typeof formatter === 'string') {
    try {
      return CLIEngine.getFormatter(formatter);
    } catch (e) {
      // ignored
    }
  }

  return CLIEngine.getFormatter('stylish');
}
