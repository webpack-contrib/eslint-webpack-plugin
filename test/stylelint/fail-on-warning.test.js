import pack from "./utils/pack";

describe("fail on warning", () => {
  it("should fail the build", async () => {
    const compiler = pack("warning", { failOnWarning: true });

    await expect(compiler.runAsync()).rejects.toThrow("color-hex-length");
  });

  it("should correctly identify a success", async () => {
    const compiler = pack("good", { failOnWarning: true });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
