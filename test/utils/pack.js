import webpack from 'webpack';

import conf from './conf';

/**
 * new a test webpack compiler
 * @param {String} context
 * @param {import('../../src/options').Options} pluginConf
 * @param {webpack.Configuration} webpackConf
 * @returns {ReturnType<webpack>}
 */
export default (context, pluginConf = {}, webpackConf = {}) =>
  webpack(conf(context, pluginConf, webpackConf));
