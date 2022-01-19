import { EditorState } from "@codemirror/basic-setup";
import { findBlockLevelOfLine } from "./line-block-level-map-field";

export const moveCursorToBlockLevelIndentationEndExtension =
  EditorState.transactionFilter.of((transaction) => {
    const main = transaction.selection?.main;
    if (!main) return transaction;
    const { state } = transaction;
    const headLine = state.doc.lineAt(main.head);
    const anchorLine = state.doc.lineAt(main.anchor);
    const headLevel = findBlockLevelOfLine(state, headLine.number);
    const anchorLevel = findBlockLevelOfLine(state, anchorLine.number);
    let newAnchor = main.anchor;
    let newHead = main.head;
    if (main.anchor - anchorLine.from < anchorLevel) {
      newAnchor = anchorLine.from + anchorLevel;
    }
    if (main.head - headLine.from < headLevel) {
      newHead = headLine.from + headLevel;
    }
    return [
      transaction,
      {
        selection: {
          head: newHead,
          anchor: newAnchor,
        },
        sequential: false,
      },
    ];
  });
