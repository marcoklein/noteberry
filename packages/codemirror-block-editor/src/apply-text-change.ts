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
    const intersection = fromLine.from + fromLevel - fromA;
    const newLineCharacterLength = 1;
    if (fromLineNumber > toLineNumber) {
      changes.push({
        from: fromLine.from - characterLength - newLineCharacterLength,
        to:
          fromLine.from - characterLength + fromLevel - newLineCharacterLength,
      });
      effects.push(
        setBlockLevelEffect.of({
          fromLevel,
          toLevel: -1,
          lineNumber: fromLineNumber,
          changeText: false,
        })
      );
    } else if (intersection > 0 && intersection <= fromLevel) {
      if (characterLength > 0) {
        changes.push({
          from: fromA + characterLength,
          to: fromA + characterLength + intersection,
        });
      }
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

  return [transaction, { changes, effects, sequential: true }];
}
