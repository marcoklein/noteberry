import { parseBlocks } from "../src/parse-blocks.js";
import { expect } from "chai";

describe("parse", () => {
  xit("should parse file content into blocks", () => {
    // given
    const content = [
      "No Level",
      "- First block",
      "  Block child",
      "    - Child Block",
      "-   Last block",
    ].join("\n");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal([
      [
        {
          lines: ["No Level"],
        },
        {
          lines: ["First block", "Block child"],
          children: [
            {
              lines: ["Child Block"],
            },
          ],
        },
        {
          lines: ["  Last block"],
        },
      ],
    ]);
  });
});
