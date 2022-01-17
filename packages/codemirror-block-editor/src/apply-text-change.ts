import {
  ChangeSpec,
  StateEffect,
  Transaction,
  TransactionSpec,
} from "@codemirror/state";
import { setBlockLevelEffect } from "./line-block-level-map-field";

export function applyTextChangeToContent(
  transaction: Transaction,
  levelOfLine: (line: number) => number
): Array<Transaction | TransactionSpec> {
  const effects: StateEffect<unknown>[] = [];
  const changes: ChangeSpec[] = [];
  const { startState, newDoc } = transaction;
  const { doc: startDoc } = startState;

  const lineDeleted = (lineNumber: number, fromLevel: number) => {
    effects.push(
      setBlockLevelEffect.of({
        fromLevel,
        toLevel: -1,
        lineNumber,
        changeText: false,
      })
    );
  };
  const lineLevelChanged = (
    lineNumber: number,
    fromLevel: number,
    toLevel: number
  ) => {
    effects.push(
      setBlockLevelEffect.of({
        changeText: false,
        fromLevel,
        toLevel,
        lineNumber,
      })
    );
  };
  const handleLineIntersection = (
    lineNumber: number,
    lineFrom: number,
    lineLevel: number,
    lineChangeFrom: number,
    lineChangeTo: number,
    characterLength: number
  ) => {
    const levelIntersection = Math.min(lineLevel, lineLevel - lineChangeFrom);
    if (levelIntersection > 0) {
      if (characterLength > 0) {
        changes.push({
          from: lineFrom + lineChangeFrom + characterLength,
          to: lineFrom + lineChangeFrom + characterLength + levelIntersection,
        });
        lineLevelChanged(lineNumber, lineLevel, lineLevel - levelIntersection);
      } else {
        lineLevelChanged(
          lineNumber,
          lineLevel,
          lineLevel - (lineChangeTo - lineChangeFrom) - characterLength
        );
      }
    }
  };

  transaction.changes.iterChanges((fromA, toA, fromB, toB, text) => {
    if (text.lines === 1 && text.line(1).text === "-") {
      console.log("skipping due to level indent");
      return;
    }
    const fromLine = startDoc.lineAt(toA);
    const fromLineNumber = fromLine.number;
    const fromLevel = levelOfLine(fromLineNumber);
    const toLine = startDoc.lineAt(toB);
    const toLineNumber = toLine.number;
    // const toLevel = levelOfLine(toLineNumber);

    let characterLength = text.length;
    const newLineCharacterLength = 1;
    const lineDiff = fromLineNumber - toLineNumber;
    if (lineDiff > 0) {
      console.log("deleting count of lines: ", lineDiff);
      const startingLine = toLineNumber;
      const endingLine = fromLineNumber;
      for (
        let currentLine = startingLine + 1;
        currentLine < endingLine;
        currentLine++
      ) {
        console.log("deleting line within a range");
        lineDeleted(currentLine, fromLevel);
      }
      endingLine;

      changes.push({
        from: fromLine.from - characterLength - newLineCharacterLength,
        to:
          fromLine.from - characterLength + fromLevel - newLineCharacterLength,
      });
      lineDeleted(fromLineNumber, fromLevel);
    } else {
      handleLineIntersection(
        fromLineNumber,
        fromLine.from,
        fromLevel,
        fromA - fromLine.from,
        toA - fromLine.from,
        characterLength
      );
    }
  });

  return [transaction, { changes, effects, sequential: true }];
}
