import { createRequire } from "node:module";
import pack from "./utils/pack";

const require = createRequire(import.meta.url);

describe("formatter eslint", () => {
  it("should use custom formatter as function", async () => {
    const formatter = require("./mock/formatter");

    const compiler = pack("error", { formatter });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
    const message = JSON.parse(
      stats.compilation.errors[0].message.replace("[eslint] ", ""),
    );
    expect(message.formatter).toBe("mock");
    expect(message.results).toBeTruthy();
  });

  it("should use custom formatter as string", async () => {
    const formatter = "./test/mock/formatter";
    const compiler = pack("error", { formatter });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
    const message = JSON.parse(
      stats.compilation.errors[0].message.replace("[eslint] ", ""),
    );
    expect(message.formatter).toBe("mock");
    expect(message.results).toBeTruthy();
  });
});
