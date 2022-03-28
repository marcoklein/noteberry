import { parseBlocks } from "./";
import { expect } from "chai";
import { BlockSyntaxTreeBuilder } from "./syntax-tree-builder.js";

describe("parse blocks", () => {
  it("should parse a single line", () => {
    // given
    const content = ["- First Block"].join("\n");
    const expectedSyntaxTree = new BlockSyntaxTreeBuilder().newBlock(
      1,
      "- ",
      "First Block"
    );
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal(expectedSyntaxTree.syntaxTree());
  });

  it("should parse simple blocks", () => {
    // given
    const content = ["- First Block", "  - Second Block"].join("\n");
    const expectedSyntaxTree = new BlockSyntaxTreeBuilder()
      .newBlock(1, "- ", "First Block")
      .newBlock(2, "  - ", "Second Block");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal(expectedSyntaxTree.syntaxTree());
  });

  it("should add lines with no line marker to a level of 1", () => {
    // given
    const content = ["No Level", "- First Block"].join("\n");
    const expectedSyntaxTree = new BlockSyntaxTreeBuilder()
      .newBlock(1, "", "No Level")
      .newBlock(1, "- ", "First Block");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal(expectedSyntaxTree.syntaxTree());
  });

  it("should consider spaces of initial child lines for line with no block marker", () => {
    // given
    const content = ["No Level", " Line with Space"].join("\n");
    const expectedSyntaxTree = new BlockSyntaxTreeBuilder()
      .newBlock(1, "", "No Level")
      .newBlockLine("", " Line with Space");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal(expectedSyntaxTree.syntaxTree());
  });

  it("should add child lines to the current block", () => {
    // given
    const content = [
      "- First Block",
      "  Child Line",
      "    Child Line With Spaces",
    ].join("\n");
    const expectedSyntaxTree = new BlockSyntaxTreeBuilder()
      .newBlock(1, "- ", "First Block")
      .newBlockLine("  ", "Child Line")
      .newBlockLine("  ", "  Child Line With Spaces");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal(expectedSyntaxTree.syntaxTree());
  });

  it("should add child lines with non-standard indentation", () => {
    // given
    const content = ["- First Block", "Child Line", " Child Line B"].join("\n");
    const expectedSyntaxTree = new BlockSyntaxTreeBuilder()
      .newBlock(1, "- ", "First Block")
      .newBlockLine("", "Child Line")
      .newBlockLine(" ", "Child Line B");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal(expectedSyntaxTree.syntaxTree());
  });

  it("should parse content with arbitrary indentation", () => {
    // given
    const content = ["    - First Block", "Child Line"].join("\n");
    const expectedSyntaxTree = new BlockSyntaxTreeBuilder()
      .newBlock(3, "    - ", "First Block")
      .newBlockLine("", "Child Line");
    // when
    const result = parseBlocks(content);
    // then
    expect(result).to.deep.equal(expectedSyntaxTree.syntaxTree());
  });
});
