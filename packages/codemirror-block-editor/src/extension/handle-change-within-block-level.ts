import { EditorState } from "@codemirror/basic-setup";
import { ChangeSpec } from "@codemirror/state";
import { findBlockLevelOfLine } from "./find-block-level-of-line";

export const handleChangeWithinBlockLevel = EditorState.transactionFilter.of(
  (transaction) => {
    const { doc } = transaction.startState;
    const changes: ChangeSpec[] = [];
    transaction.changes.iterChanges((fromA, toA, fromB, toB, text) => {
      console.log("change: ", fromA, toA, fromB, toB, text);
      const fromLine = doc.lineAt(fromA);
      const toLine = doc.lineAt(toA);
      const fromLevel = findBlockLevelOfLine(
        transaction.startState,
        fromLine.number
      );
      if (
        fromA === fromLine.from &&
        fromA === toA && // inserted something
        text.lines === 1 &&
        !text.line(1).text.trim().length
      ) {
        // whitespace got inserted at beginning of line
        return;
      }
      if (
        fromB === toB && // deleted something
        text.lines === 1 &&
        toA - fromLine.from < fromLevel
      ) {
        // whitespace deleted in indentation
        return;
      }

      if (fromA - fromLine.from < fromLevel) {
        const deleteLineBreakOfPreviousLine = fromLine.number === 1 ? 0 : 1;
        changes.push({
          from: fromLine.from - deleteLineBreakOfPreviousLine,
          to: fromLine.from + fromLevel,
          insert: "",
        });
      }
    });
    return [transaction, { changes, sequential: false }];
  }
);
