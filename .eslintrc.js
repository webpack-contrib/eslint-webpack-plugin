module.exports = {
  root: true,
  extends: [
    '@webpack-contrib/eslint-config-webpack/rules/possible-errors',
    '@webpack-contrib/eslint-config-webpack/rules/best-practices',
    '@webpack-contrib/eslint-config-webpack/rules/variables',
    '@webpack-contrib/eslint-config-webpack/rules/node',
    '@webpack-contrib/eslint-config-webpack/rules/stylistic-issues',
    '@webpack-contrib/eslint-config-webpack/rules/es2015',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    env: {
      es6: true,
      jest: true,
    },
    sourceType: 'module',
  },
  rules: {
    strict: 'error',
    'global-require': 'off',
  },
};
