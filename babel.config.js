const MIN_BABEL_VERSION = 7;

export default (api) => {
  api.assertVersion(MIN_BABEL_VERSION);

  // Only the CommonJS build rewrites modules; the ESM build keeps them
  const toCommonJs = api.env() === "cjs";

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "22.12.0",
          },
          modules: toCommonJs ? "commonjs" : false,
          // Keep `import()` dynamic, a `stylelintPath` is only known at runtime
          exclude: ["transform-dynamic-import"],
        },
      ],
    ],
    // `import.meta` has no CommonJS equivalent, so the CommonJS build needs it rewritten
    plugins: toCommonJs ? ["babel-plugin-transform-import-meta"] : [],
  };
};
