import path from "path";

import webpack from "webpack";

import pack from "./utils/pack";

describe("query", () => {
  it("should correctly resolve file despite query path", (done) => {
    const isWebpack5 = webpack.version.startsWith("5");
    const compiler = pack(
      "query",
      {},
      {
        resolve: {
          alias: {
            "alias-ignore": isWebpack5
              ? false
              : path.resolve(__dirname, "./fixtures/good.js"),
          },
        },
      }
    );

    compiler.run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);

      done();
    });
  });
});
