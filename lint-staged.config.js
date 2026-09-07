export default {
  "*.js": ["eslint --fix", "prettier --write", "cspell"],
  "*.{json,md,yml,css,ts}": ["prettier --write"],
};
