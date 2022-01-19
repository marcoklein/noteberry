import { EditorState } from "@codemirror/basic-setup";
import { ChangeSpec } from "@codemirror/state";
import { setBlockLevelEffect } from "./line-block-level-map-field";

export const applyBlockLevelIndentationChanges =
  EditorState.transactionFilter.of((transaction) => {
    const { state, newDoc } = transaction;
    let changes: ChangeSpec[] = [];
    for (const effect of transaction.effects) {
      if (effect.is(setBlockLevelEffect) && effect.value.changeText) {
        const { lineNumber, fromLevel, toLevel } = effect.value;
        const levelDiff = toLevel - fromLevel;
        const line = newDoc.line(lineNumber);
        console.log("block effect", effect.value);

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
        }
        console.log(transaction);
      }
    }

    return changes.length
      ? [
          transaction,
          {
            changes,
            sequential: true,
          },
        ]
      : transaction;
  });
