import { EditorState } from "@codemirror/basic-setup";
import { ChangeSpec } from "@codemirror/state";
import {
  findBlockLevelOfLine,
  setBlockLevelEffect,
} from "./line-block-level-map-field";

export const applyBlockLevelIndentationChanges =
  EditorState.transactionFilter.of((transaction) => {
    const { newDoc, startState } = transaction;
    let changes: ChangeSpec[] = [];
    let selection: { head: number; anchor: number } | undefined = undefined;
    for (const effect of transaction.effects) {
      if (effect.is(setBlockLevelEffect) && effect.value.changeText) {
        const { lineNumber, fromLevel, toLevel } = effect.value;
        const levelDiff = toLevel - fromLevel;
        const line = newDoc.line(lineNumber);

        if (toLevel < fromLevel) {
          changes.push({
            from: line.from + toLevel,
            to: line.from + fromLevel,
          });
        } else {
          changes.push({
            from: line.from,
            to: line.from,
            insert: "-".repeat(levelDiff),
          });
          const main = startState.selection.main;
          if (main.head === main.anchor && main.head === line.from) {
            console.log("moving selection for level adjustement");
            selection = {
              head: main.head + levelDiff,
              anchor: main.anchor + levelDiff,
            };
          }
        }
      }
    }

    return changes.length
      ? [
          transaction,
          {
            selection,
            changes,
            sequential: true,
          },
        ]
      : transaction;
  });
