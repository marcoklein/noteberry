import { ChangeSpec, EditorState } from "@codemirror/state";
import { blockMarkerFacet } from "./block-marker-facet";
import {
  findBlockLevelCharacterIndentationOfLine,
  findBlockLevelOfLineNumberInDocument,
} from "./find-block-level-of-line";

export const addBlockOnNewLine = EditorState.transactionFilter.of(
  (transaction) => {
    const doc = transaction.newDoc;
    const changes: ChangeSpec[] = [];
    const blockMarker = transaction.startState.facet(blockMarkerFacet);
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
          line.text,
          blockMarker
        );
        if (blockLevelOfLine <= 0) {
          const shouldBlockLevel = findBlockLevelOfLineNumberInDocument(
            doc,
            lineNumber,
            blockMarker
          );
          const numOfIndentationSpaces =
            line.text.length - line.text.trimLeft().length;
          const missingSpaces =
            shouldBlockLevel - numOfIndentationSpaces - blockMarker.length;
          if (missingSpaces > -blockMarker.length) {
            changes.push({
              from: line.from,
              insert: " ".repeat(missingSpaces) + blockMarker,
            });
          }
        }
      }
    });

    return [transaction, { changes, sequential: true }];
  }
);
