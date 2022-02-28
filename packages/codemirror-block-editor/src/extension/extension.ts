import { ChangeSpec, EditorState, Extension } from "@codemirror/state";
import { dotWidgetViewPlugin } from "./dot-widget";
import {
  findBlockLevelCharacterIndentationOfLine,
  findBlockLevelOfLineNumberInDocument,
} from "./find-block-level-of-line";
import { handleChangeWithinBlockLevel } from "./handle-change-within-block-level";
import { blockLevelKeymap } from "./keymap";
import { dotTheme } from "./theme";
import { validateCursorPosition } from "./validate-cursor-position";

export const addBlockOnNewLine = EditorState.transactionFilter.of(
  (transaction) => {
    const doc = transaction.state.doc; // TODO change to newDoc
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

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    // TODO there is a bug that changes precedence -> have to change order of extensions with that patch
    dotWidgetViewPlugin,

    validateCursorPosition,
    addBlockOnNewLine,

    handleChangeWithinBlockLevel,

    dotTheme,
    blockLevelKeymap,
  ];
}
