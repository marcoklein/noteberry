import { parseBlocks } from "../src/parse-blocks.js";
import { expect } from "chai";

describe("parse", () => {
  it("should parse file content into blocks", () => {
    // given
    const content = [
      "No Level",
      "- First block",
      "  Block child",
      "  - Child Block",
      "-   Last block",
    ].join("\n");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal([
      {
        level: 1,
        lines: ["No Level"],
      },
      {
        level: 1,
        lines: ["First block", "Block child"],
      },
      {
        level: 2,
        lines: ["Child Block"],
      },
      { level: 1, lines: ["  Last block"] },
    ]);
  });
});
