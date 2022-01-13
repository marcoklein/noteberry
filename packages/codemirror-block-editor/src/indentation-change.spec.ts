import { expect } from "chai";
import { Text } from "@codemirror/text";
import {
  ChangeSpec,
  TransactionSpec,
  Transaction,
  StateEffect,
} from "@codemirror/state";
import { EditorState } from "@codemirror/basic-setup";
import {
  findLevelOfLine,
  getIntersectionAmount,
  setBlockLevelEffect,
} from "./block-extension.js";

function applyTextChangeToContent(
  transaction: Transaction,
  levelOfLine: (line: number) => number
): Transaction {
  const effects: StateEffect<unknown>[] = [];
  const changes: ChangeSpec[] = [];
  const { startState, newDoc } = transaction;
  const { doc: startDoc } = startState;

  transaction.changes.iterChanges((fromA, toA, fromB, toB, text) => {
    const fromLine = startDoc.lineAt(toA);
    const fromLineNumber = fromLine.number;
    const fromLevel = levelOfLine(fromLineNumber);

    const intersection = fromLine.from + fromLevel - fromA;
    if (intersection > 0 && intersection <= fromLevel) {
      const characterLength = 1;
      changes.push({
        from: fromA + characterLength,
        to: fromA + characterLength + intersection,
      });
      effects.push(
        setBlockLevelEffect.of({
          changeText: false,
          fromLevel: fromLevel,
          toLevel: fromLevel - intersection,
          lineNumber: fromLineNumber,
        })
      );
    }
  });

  return transaction.state.update({ changes, effects });
}

describe("Block Level Changes", () => {
  let state: EditorState;

  describe("Adding Single Character", () => {
    // given
    const content = ["A", "-B"].join("\n");
    const insertText = "C";
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
      expect(result.newDoc.toJSON()).to.deep.equal(["AC", "-B"]);
    });

    it("should add character after block level indentation", () => {
      // given
      const transaction = state.update({
        changes: { from: 3, insert: insertText },
      });
      // when
      const result = applyTextChangeToContent(
        transaction,
        (line) => lineLevelMapping[line]
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-CB"]);
      expect(result.effects).to.have.lengthOf(0);
    });

    it("should add character in front of block level indentation", () => {
      // given
      const transaction = state.update({
        changes: { from: 2, insert: insertText },
      });
      // when
      const result = applyTextChangeToContent(
        transaction,
        (line) => lineLevelMapping[line]
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "CB"]);
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
    const insertText = "F";
    const lineLevelMapping: { [line: number]: number } = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
    };
    beforeEach(() => {
      state = EditorState.create({ doc: content });
    });

    it("should remove all block indentation character is inserted in the beginning", () => {
      // given
      const transaction = state.update({
        changes: { from: 5, insert: insertText },
      });
      // when
      const result = applyTextChangeToContent(
        transaction,
        (line) => lineLevelMapping[line]
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "FC", "---D"]);
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
      const result = applyTextChangeToContent(
        transaction,
        (line) => lineLevelMapping[line]
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "-FC", "---D"]);
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
      const result = applyTextChangeToContent(
        transaction,
        (line) => lineLevelMapping[line]
      );
      // then
      expect(result.newDoc.toJSON()).to.deep.equal(["A", "-B", "--C", "-FD"]);
      expect(result.effects).to.have.lengthOf(1);
      expect(
        result.effects[0].is(setBlockLevelEffect) && result.effects[0].value
      ).to.deep.include(
        { fromLevel: 3, toLevel: 1, lineNumber: 4 },
        "effect does not return the correct level"
      );
    });
  });
});
