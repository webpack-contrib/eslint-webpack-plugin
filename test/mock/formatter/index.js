module.exports = function format(results) {
  return JSON.stringify({
    formatter: "mock",
    results,
  });
};
