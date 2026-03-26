import { join } from "node:path";
import pack from "./utils/pack";

describe("succeed on flat-configuration", () => {
  it("should work with flat configuration type", async () => {
    const overrideConfigFile = join(__dirname, "fixtures", "flat-config.js");
    const compiler = pack("full-of-problems", {
      configType: "flat",
      overrideConfigFile,
    });

    const stats = await compiler.runAsync();
    const { errors } = stats.compilation;

    expect(stats.hasErrors()).toBe(true);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/full-of-problems\.js/i);
    expect(stats.hasWarnings()).toBe(true);
  });
});
