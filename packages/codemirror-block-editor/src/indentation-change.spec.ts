import { expect } from "chai";
import { Text } from "@codemirror/text";
import {
  ChangeSpec,
  TransactionSpec,
  Transaction,
  StateEffect,
} from "@codemirror/state";
import { EditorState } from "@codemirror/basic-setup";
import { findLevelOfLine, setBlockLevelEffect } from "./block-extension.js";

interface RangeSpec {
  from: number;
  to: number;
}

abstract class Range {
  static of(from: number, to: number = from): RangeSpec {
    return { from, to };
  }
}

interface TextChangeSpec {
  from: RangeSpec;
  to: RangeSpec;
  text: string;
}

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
    if (fromA === fromLine.from) {
      changes.push({
        from: fromLine.from + 1,
        to: fromLine.from + 1 + 1,
      });
      effects.push(
        setBlockLevelEffect.of({
          changeText: false,
          fromLevel: 1,
          toLevel: 0,
          lineNumber: 1,
        })
      );
    }
  });

  return transaction.state.update({ changes, effects });
}

describe("Block Level Changes", () => {
  beforeEach(() => {});

  describe("Adding", () => {
    // given
    const content = ["A", "-B"].join("\n");
    const insertText = "C";
    const lineLevelMapping: { [line: number]: number } = { 0: 0, 1: 1 };
    let state: EditorState;
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

    it("should add character in front of block", () => {
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
});
