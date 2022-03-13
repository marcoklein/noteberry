import { parseBlocks } from "./parse-blocks.js";
import { expect } from "chai";

describe("parse blocks", () => {
  it("should parse simple blocks", () => {
    // given
    const content = ["- First Block", "  - Second Block"].join("\n");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal([
      {
        level: 1,
        lines: ["First Block"],
      },
      {
        level: 2,
        lines: ["Second Block"],
      },
    ]);
  });

  it("should add lines with no line marker to a level of 1", () => {
    // given
    const content = ["No Level", "- First Block"].join("\n");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal([
      {
        level: 1,
        lines: ["No Level"],
      },
      { level: 1, lines: ["First Block"] },
    ]);
  });

  it("should consider spaces of initial child lines for line with no block marker", () => {
    // given
    const content = ["No Level", " Line with Space"].join("\n");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal([
      {
        level: 1,
        lines: ["No Level", " Line with Space"],
      },
    ]);
  });

  it("should add child lines to the current block", () => {
    // given
    const content = [
      "- First Block",
      "  Child Line",
      "    Child Line With Spaces",
    ].join("\n");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal([
      {
        level: 1,
        lines: ["First Block", "Child Line", "  Child Line With Spaces"],
      },
    ]);
  });

  it("should add child lines with non-standard indentation", () => {
    // given
    const content = ["- First Block", "Child Line", " Child Line B"].join("\n");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal([
      {
        level: 1,
        lines: ["First Block", "Child Line", "Child Line B"],
      },
    ]);
  });
});
