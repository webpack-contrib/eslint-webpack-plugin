import validateOptions from 'schema-utils';

import schema from './options.json';

export default function getOptions(pluginOptions) {
  const options = {
    files: '.',
    ...pluginOptions,
  };

  validateOptions(schema, options, {
    name: 'ESLint Webpack Plugin',
    baseDataPath: 'options',
  });

  return options;
}
