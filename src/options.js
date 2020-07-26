import validateOptions from 'schema-utils';

import schema from './options.json';

export function getOptions(pluginOptions) {
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

export function getESLintOptions(loaderOptions) {
  const eslintOptions = { ...loaderOptions };

  // Keep the fix option because it is common to both the loader and ESLint.
  const { fix, ...eslintOnlyOptions } = schema.properties;

  // No need to guard the for-in because schema.properties has hardcoded keys.
  // eslint-disable-next-line guard-for-in
  for (const option in eslintOnlyOptions) {
    delete eslintOptions[option];
  }

  return eslintOptions;
}
