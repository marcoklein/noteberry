import { ChangeSpec, EditorState } from "@codemirror/state";
import {
  findBlockLevelCharacterIndentationOfLine,
  findBlockLevelOfLineNumberInDocument,
} from "./find-block-level-of-line";

export const addBlockOnNewLine = EditorState.transactionFilter.of(
  (transaction) => {
    const doc = transaction.newDoc;
    const changes: ChangeSpec[] = [];
    transaction.changes.iterChanges((fromA, toA, fromB, toB, text) => {
      const fromLine = doc.lineAt(fromA);
      const toLine = doc.lineAt(toB);

      for (
        let lineNumber = fromLine.number;
        lineNumber <= toLine.number;
        lineNumber++
      ) {
        const line = doc.line(lineNumber);
        const blockLevelOfLine = findBlockLevelCharacterIndentationOfLine(
          line.text
        );
        if (blockLevelOfLine <= 0) {
          const shouldBlockLevel = findBlockLevelOfLineNumberInDocument(
            doc,
            lineNumber
          );
          const numOfIndentationSpaces =
            line.text.length - line.text.trimLeft().length;
          // TODO replace magic number 2 with Block Marker length
          const missingSpaces = shouldBlockLevel - numOfIndentationSpaces - 2;
          if (missingSpaces > -2) {
            changes.push({
              from: line.from,
              insert: " ".repeat(missingSpaces) + "- ",
            });
          }
        }
      }
    });

    return [transaction, { changes, sequential: true }];
  }
);
