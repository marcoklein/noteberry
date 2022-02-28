import { EditorState } from "@codemirror/basic-setup";
import { ChangeSpec } from "@codemirror/state";
import { findBlockLevelOfLineNumberInDocument } from "./find-block-level-of-line";

export const handleChangeWithinBlockLevel = EditorState.transactionFilter.of(
  (transaction) => {
    const { doc } = transaction.state;
    const changes: ChangeSpec[] = [];
    transaction.changes.iterChanges((fromA, toA, fromB, toB, text) => {
      const fromLine = doc.lineAt(fromA);
      // const toLine = doc.lineAt(toA);
      const fromLevel = findBlockLevelOfLineNumberInDocument(
        doc,
        fromLine.number
      );
      if (
        fromA === fromLine.from &&
        fromA === toA && // inserted something
        text.lines === 1 &&
        !text.line(1).text.trim().length
      ) {
        // whitespace got inserted at beginning of line
        // => level increase
        // TODO for child block increase parent block only
        console.log("level increase");
        return transaction;
      }
      if (
        fromB === toB && // deleted something
        text.lines === 1 &&
        toA - fromLine.from < fromLevel
      ) {
        // whitespace deleted in indentation
        // => level decrease
        console.log("level decrease");
        return transaction;
      }

      if (fromA - fromLine.from < fromLevel) {
        console.log(
          fromA - fromLine.from,
          fromA,
          fromLine.from,
          fromLevel,
          fromLine.number
        );
        const deleteLineBreakOfPreviousLine =
          fromLine.number === 1 || toA === fromLine.to + 1 ? 0 : 1;
        changes.push({
          from: fromLine.from - deleteLineBreakOfPreviousLine,
          to: fromLine.from + fromLevel,
          insert: "",
        });
      }
    });
    return [transaction, { changes, sequential: true }];
  }
);
