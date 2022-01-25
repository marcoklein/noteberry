import { EditorState } from "@codemirror/basic-setup";
import { findBlockLevelOfLine } from "./line-block-level-map-field";

export const moveCursorToBlockLevelIndentationEndExtension =
  EditorState.transactionFilter.of((transaction) => {
    const main = transaction.selection?.main;
    if (!main) return transaction;
    let selection: { head: number; anchor: number } | undefined = undefined;
    const { state } = transaction;
    const headLine = state.doc.lineAt(main.head);
    const anchorLine = state.doc.lineAt(main.anchor);
    const headLevel = findBlockLevelOfLine(state, headLine.number);
    const anchorLevel = findBlockLevelOfLine(state, anchorLine.number);
    let newAnchor = main.anchor;
    let newHead = main.head;
    if (main.anchor - anchorLine.from < anchorLevel) {
      newAnchor = anchorLine.from + anchorLevel;
      selection = {
        head: newHead,
        anchor: newAnchor,
      };
    }
    if (main.head - headLine.from < headLevel) {
      newHead = headLine.from + headLevel;
      console.log("moving head", main.head - newHead);
      selection = {
        head: newHead,
        anchor: newAnchor,
      };
    }
    return [
      transaction,
      {
        selection,
        sequential: false,
      },
    ];
  });
