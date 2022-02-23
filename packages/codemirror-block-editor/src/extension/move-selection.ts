import { EditorState } from "@codemirror/basic-setup";
import { findBlockLevelOfLine } from "./find-block-level-of-line";

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
    // console.log("anchor:", newAnchor, newHead);
    if (main.anchor - anchorLine.from < anchorLevel) {
      newAnchor = anchorLine.from + anchorLevel;
      selection = {
        head: newHead,
        anchor: newAnchor,
      };
    }
    if (main.head - headLine.from < headLevel) {
      newHead = headLine.from + headLevel;
      // console.log("moving head", main.head - newHead);
      return [
        transaction,
        {
          selection: {
            head: newHead,
            anchor: newAnchor,
          },
        },
      ];
    }
    return transaction;
  });
