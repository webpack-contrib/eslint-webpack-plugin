import pack from "./utils/pack";

describe("fail on error", () => {
  it("should fail the build", async () => {
    const compiler = pack("error", { failOnError: true });

    await expect(compiler.runAsync()).rejects.toThrow("color-named");
  });

  it("should report errors without failing when disabled", async () => {
    const compiler = pack("error", { failOnError: false });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it("should correctly identify a success", async () => {
    const compiler = pack("good", { failOnError: true });
    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
