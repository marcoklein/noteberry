import { Extension, ChangeSpec, EditorState } from "@codemirror/state";
import { dotWidgetViewPlugin } from "./dot-widget";
import {
  findBlockLevelCharacterIndentationOfLine,
  findBlockLevelOfLineNumberInState,
} from "./find-block-level-of-line";
import { handleChangeWithinBlockLevel } from "./handle-change-within-block-level";
import { blockLevelKeymap } from "./keymap";
import { moveCursorToBlockLevelIndentationEndExtension } from "./move-selection";
import { dotTheme } from "./theme";

export const validateBlockIndentation = EditorState.transactionFilter.of(
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
        const blockLevel = findBlockLevelCharacterIndentationOfLine(line.text);
        if (blockLevel <= 0) {
          // block that needs space indentation
          changes.push({
            from: line.from,
            // TODO insert right amount of spaces (depending on the block level)
            insert: "  ",
          });
        }
      }
    });

    return [transaction, { changes, sequential: true }];
  }
);

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    dotTheme,
    blockLevelKeymap,
    validateBlockIndentation,
    handleChangeWithinBlockLevel,
    moveCursorToBlockLevelIndentationEndExtension,
    dotWidgetViewPlugin,
  ];
}
