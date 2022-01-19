import { EditorState } from "@codemirror/basic-setup";
import { expect } from "chai";
import { applyTextChangeToContent } from "./apply-text-change.js";
import { setBlockLevelEffect } from "./line-block-level-map-field.js";
import { SetBlockLevelEffectSpec } from "../playground/3/block-level-decoration-extension.js";

describe("Block Level Changes", () => {
  let state: EditorState;

  describe("Single Characters", () => {
    // given
    const content = ["A", "-B"].join("\n");
    const insertText = "X";
    const lineLevelMapping: { [line: number]: number } = { 1: 0, 2: 1 };
    beforeEach(() => {
      state = EditorState.create({ doc: content });
    });

    it("should add character in line without level", () => {
      // given
      const transaction = state.update({
        changes: { from: 1, insert: insertText },
      });
      // when
      const result = applyTextChangeToContent(
        transaction,
        (line) => lineLevelMapping[line]
      );
      // then
      expect(state.update(...result).newDoc.toJSON()).to.deep.equal([
        "AX",
        "-B",
      ]);
    });

    it("should add character after block level indentation", () => {
      // given
      const transaction = state.update({
        changes: { from: 3, insert: insertText },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-XB"]);
      expect(result.effects).to.have.lengthOf(0);
    });

    it("should replace block character", () => {
      // given
      const transaction = state.update({
        changes: { from: 3, to: 4, insert: insertText },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-X"]);
      expect(result.effects).to.have.lengthOf(0);
    });

    it("should add character in front of block level indentation", () => {
      // given
      const transaction = state.update({
        changes: { from: 2, insert: insertText },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(state.update(result).newDoc.toJSON()).to.deep.equal(["A", "XB"]);
      expect(result.effects).to.have.lengthOf(
        1,
        "should set block level effect"
      );
      expect(
        result.effects[0].is(setBlockLevelEffect) &&
          result.effects[0].value.toLevel
      ).to.equal(0, "effect does not return the correct level");
    });

    it("should delete the block level character", () => {
      // given
      const transaction = state.update({
        changes: { from: 2, to: 3 },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(state.update(result).newDoc.toJSON()).to.deep.equal(["A", "B"]);
      expect(result.effects).to.have.lengthOf(
        1,
        "should set block level effect"
      );
      expect(
        result.effects[0].is(setBlockLevelEffect) &&
          result.effects[0].value.toLevel
      ).to.equal(0, "effect does not return the correct level");
    });

    it("should replace the block level character", () => {
      // given
      const transaction = state.update({
        changes: { from: 2, to: 3, insert: insertText },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(state.update(result).newDoc.toJSON()).to.deep.equal(["A", "XB"]);
      expect(result.effects).to.have.lengthOf(
        1,
        "should set block level effect"
      );
      expect(
        result.effects[0].is(setBlockLevelEffect) &&
          result.effects[0].value.toLevel
      ).to.equal(0, "effect does not return the correct level");
    });
  });

  describe("Multiple Levels", () => {
    const content = ["A", "-B", "--C", "---D"].join("\n");
    const insertText = "X";
    const lineLevelMapping: { [line: number]: number } = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
    };
    beforeEach(() => {
      state = EditorState.create({ doc: content });
    });

    xit("should delete the first indentation", () => {
      // given
      const transaction = state.update({
        changes: { from: 5, to: 6 },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(state.update(result).newDoc.toJSON()).to.deep.equal([
        "A",
        "-B",
        "-C",
        "---D",
      ]);
      expect(result.effects).to.have.lengthOf(
        1,
        "should set block level effect"
      );
      expect(
        result.effects[0].is(setBlockLevelEffect) &&
          result.effects[0].value.toLevel
      ).to.equal(1, "effect does not return the correct level");
    });

    it("should remove all block indentation character is inserted in the beginning", () => {
      // given
      const transaction = state.update({
        changes: { from: 5, insert: insertText },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "XC", "---D"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) &&
          result.effects[0].value.toLevel
      ).to.equal(0, "effect does not return the correct level");
    });

    it("should insert character between block level indentations and keep starting level", () => {
      // given
      const transaction = state.update({
        changes: { from: 6, insert: insertText },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "-XC", "---D"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 2, toLevel: 1, lineNumber: 3 },
        "effect does not return the correct level"
      );
    });

    it("should insert between block level indentations", () => {
      // given
      const transaction = state.update({
        changes: { from: 10, insert: insertText },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "--C", "-XD"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 3, toLevel: 1, lineNumber: 4 },
        "effect does not return the correct level"
      );
    });

    it("should replace block level indentation", () => {
      // given
      const transaction = state.update({
        changes: { from: 10, to: 11, insert: insertText },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "--C", "-XD"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 3, toLevel: 1, lineNumber: 4 },
        "effect does not return the correct level"
      );
    });
  });

  describe("Line Breaks", () => {
    const content = ["A", "-B", "--C", "---D"].join("\n");
    const insertText = "X";
    const lineLevelMapping: { [line: number]: number } = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
    };
    beforeEach(() => {
      state = EditorState.create({ doc: content });
    });

    it("should handle a line deletion", () => {
      // given
      const transaction = state.update({
        changes: { from: 1, to: 2 },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["AB", "--C", "---D"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 1, toLevel: -1, lineNumber: 2 },
        "effect does not return the correct level"
      );
    });

    it("should handle a line deletion with multiple levels", () => {
      // given
      const transaction = state.update({
        changes: { from: 8, to: 9 },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "--CD"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 3, toLevel: -1, lineNumber: 4 },
        "effect does not return the correct level"
      );
    });
  });

  describe("Range Changes", () => {
    const content = ["A", "-B", "--CD"].join("\n");
    const insertText = "X";
    const lineLevelMapping: { [line: number]: number } = {
      1: 0,
      2: 1,
      3: 2,
    };
    beforeEach(() => {
      state = EditorState.create({ doc: content });
    });

    it("should handle deletion of a complete level with text", () => {
      // given
      const transaction = state.update({
        changes: { from: 5, to: 9 },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", ""]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 2, toLevel: 0, lineNumber: 3 },
        "effect does not return the correct level"
      );
    });

    it("should handle deletion of a complete level with some text", () => {
      // given
      const transaction = state.update({
        changes: { from: 5, to: 8 },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "D"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 2, toLevel: 0, lineNumber: 3 },
        "effect does not return the correct level"
      );
    });

    it("should handle deletion of some level with some text", () => {
      // given
      const transaction = state.update({
        changes: { from: 6, to: 8 },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "-D"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 2, toLevel: 1, lineNumber: 3 },
        "effect does not return the correct level"
      );
    });
  });

  describe("Multiline", () => {
    const content = ["A", "-B", "--C"].join("\n");
    const insertText = "X";
    const lineLevelMapping: { [line: number]: number } = {
      1: 0,
      2: 1,
      3: 2,
    };

    beforeEach(() => {
      state = EditorState.create({ doc: content });
    });

    it("should handle deletion of a multiline", () => {
      // given
      const transaction = state.update({
        changes: { from: 0, to: 7 },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["C"]);
      expect(result.effects).to.have.lengthOf(2);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include({ lineNumber: 2, fromLevel: 1, toLevel: -1 });
      expect(
        result.effects[1].is(setBlockLevelEffect) && result.effects[1].value
      ).to.deep.include({ lineNumber: 3, fromLevel: 2, toLevel: -1 });
    });

    it("should handle replacement of a multiline", () => {
      // given
      const transaction = state.update({
        changes: {
          from: 0,
          to: 7,
          insert: ["X1", "X2", "X3", "X4", "X5"].join("\n"),
        },
      });
      // when
      const result = state.update(
        ...applyTextChangeToContent(
          transaction,
          (line) => lineLevelMapping[line]
        )
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal([
        "X1",
        "X2",
        "X3",
        "X4",
        "X5C",
      ]);
      expect(result.effects).to.have.lengthOf(2);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include({ lineNumber: 2, fromLevel: 1, toLevel: -1 });
      expect(
        result.effects[1].is(setBlockLevelEffect) && result.effects[1].value
      ).to.deep.include({ lineNumber: 3, fromLevel: 2, toLevel: -1 });
    });
  });
});
