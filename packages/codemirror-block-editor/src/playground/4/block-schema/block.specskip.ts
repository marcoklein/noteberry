import { expect } from "chai";
import { Block } from "./block";

describe("Block", () => {
  it("should create empty block", () => {
    // given
    // when
    const block = Block.empty();
    // then
    expect(block.lines).to.deep.equal([]);
    expect(block.linesCount).to.equal(0);
  });

  it("should create with block lines", () => {
    // given
    // when
    const block = Block.withLines(["Hello", "World"]);
    // then
    expect(block.lines).to.deep.equal(["Hello", "World"]);
  });

  it("should iterate children", () => {
    // given
    // when
    const block = Block.withLines(["Hello", "World"]);
    // then
    expect(block.lines).to.deep.equal(["Hello", "World"]);
  });
});
