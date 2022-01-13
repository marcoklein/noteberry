import { ChangeSpec, StateEffect, Transaction } from "@codemirror/state";
import { setBlockLevelEffect } from "./block-extension.js";

export function applyTextChangeToContent(
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
    const toLine = startDoc.lineAt(toB);
    const toLineNumber = toLine.number;
    // const toLevel = levelOfLine(toLineNumber);

    // we assume single character changes only
    const characterLength = 1;

    if (fromLineNumber > toLineNumber) {
      changes.push({
        from: fromLine.from - characterLength,
        to: fromLine.from - characterLength + fromLevel,
      });
      effects.push(
        setBlockLevelEffect.of({
          fromLevel,
          toLevel: -1,
          lineNumber: fromLineNumber,
          changeText: false,
        })
      );
    }

    const intersection = fromLine.from + fromLevel - fromA;
    if (intersection > 0 && intersection <= fromLevel) {
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
