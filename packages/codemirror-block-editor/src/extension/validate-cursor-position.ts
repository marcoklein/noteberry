import { EditorState } from "@codemirror/state";
import { blockMarkerFacet } from "./block-marker-facet";
import { findBlockLevelOfLineNumberInDocument } from "./find-block-level-of-line";

/**
 * Moves cursor out of block level indentation.
 *
 * Runs after the validation of block indentation as the curser might then be inside an indentation.
 */
export const validateCursorPosition = EditorState.transactionFilter.of(
  (transaction) => {
    const doc = transaction.newDoc;
    let selectionChange: { anchor: number; head: number } | undefined =
      undefined;
    const blockMarker = transaction.startState.facet(blockMarkerFacet);

    for (const { head, anchor } of transaction.newSelection.ranges) {
      const headLine = doc.lineAt(head);
      const headBlockLevel = findBlockLevelOfLineNumberInDocument(
        doc,
        headLine.number,
        blockMarker
      );
      const headBlockEndIndex = headLine.from + headBlockLevel;

      const anchorLine = doc.lineAt(anchor);
      const anchorBlockLevel = findBlockLevelOfLineNumberInDocument(
        doc,
        anchorLine.number,
        blockMarker
      );
      const anchorBlockEndIndex = anchorLine.from + anchorBlockLevel;

      let newHead = head;
      let newAnchor = anchor;
      if (head <= headBlockEndIndex) {
        newHead = headBlockEndIndex;
      }
      if (anchor <= anchorBlockEndIndex) {
        newAnchor = anchorBlockEndIndex;
      }
      if (newHead !== head || newAnchor !== anchor) {
        selectionChange = {
          anchor: newAnchor,
          head: newHead,
        };
      }
    }

    return [transaction, { selection: selectionChange, sequential: true }];
  }
);
