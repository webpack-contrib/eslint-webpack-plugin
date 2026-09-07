import webpack from "webpack";

import conf from "./conf.js";

/**
 * new a test webpack compiler
 * @param {string} context context
 * @param {import("../../src/options").Options} pluginConf plugin options
 * @param {webpack.Configuration} webpackConf webpack configuration
 * @returns {ReturnType<webpack>} return result from webpack
 */
export default (context, pluginConf = {}, webpackConf = {}) => {
  const compiler = webpack(conf(context, pluginConf, webpackConf));

  return {
    runAsync() {
      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            reject(err);
          } else {
            resolve(stats);
          }
        });
      });
    },
    watch(options, fn) {
      return compiler.watch(options, fn);
    },
  };
};
