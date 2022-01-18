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
    const intersectingLevelsFrom = Math.min(
      lineLevel,
      lineLevel - lineChangeFrom
    );
    if (intersectingLevelsFrom > 0) {
      const deletedChars = Math.max(
        0,
        // TODO you can max delete the intersectingLevelsFrom
        lineChangeTo - lineChangeFrom - characterLength
      );
      const insertedChars = Math.max(
        0,
        characterLength - (lineChangeTo - lineChangeFrom)
      );
      const replacedChars = Math.min(
        lineChangeTo - lineChangeFrom,
        characterLength
      );
      console.log(deletedChars, insertedChars, replacedChars);
      const remainingLevelCharactersToDelete =
        intersectingLevelsFrom - replacedChars - deletedChars;
      if (remainingLevelCharactersToDelete > 0) {
        changes.push({
          from:
            lineFrom +
            lineChangeFrom +
            insertedChars +
            replacedChars +
            deletedChars,
          to:
            lineFrom +
            lineChangeFrom +
            insertedChars +
            replacedChars +
            remainingLevelCharactersToDelete,
        });
      }
      lineLevelChanged(
        lineNumber,
        lineLevel,
        lineLevel - intersectingLevelsFrom
      );
    }
  };

  transaction.changes.iterChanges((fromA, toA, fromB, toB, text) => {
    console.log("changes", fromA, toA, fromB, toB);
    const newLineCharacterLength = 1;
    const startingLine = startDoc.lineAt(fromA);
    const endingLine = startDoc.lineAt(toA);
    // starting line
    handleLineIntersection(
      startingLine.number,
      startingLine.from,
      levelOfLine(startingLine.number),
      fromA - startingLine.from,
      Math.min(toA - startingLine.from, startingLine.to),
      text.line(1).length
    );

    if (startingLine.number !== endingLine.number) {
      for (
        let currentLine = startingLine.number + 1;
        currentLine <= endingLine.number;
        currentLine++
      ) {
        lineDeleted(currentLine, levelOfLine(currentLine));
      }

      // ending line
      const endLineIntersection = toA - endingLine.from;
      const remainingLevelIntersection =
        levelOfLine(endingLine.number) - endLineIntersection;

      if (remainingLevelIntersection > 0) {
        changes.push({
          from: endingLine.from + endLineIntersection - newLineCharacterLength,
          to:
            endingLine.from +
            endLineIntersection +
            remainingLevelIntersection -
            newLineCharacterLength,
        });
      }
    }
  });

  return [transaction, { changes, effects, sequential: true }];
}
