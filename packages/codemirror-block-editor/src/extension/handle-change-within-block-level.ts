import { EditorState } from "@codemirror/state";
import { ChangeSpec, StateEffect } from "@codemirror/state";
import { findBlockLevelOfLineNumberInDocument } from "./find-block-level-of-line";
import { indentationPerLevelFacet } from "./indentation-per-level-facet";
import { blockLevelChangeEffect } from "./set-block-level-effect";

/**
 * Deviates block level changes from text changes and adds respective {@link setBlockLevelEffect} effects to the transaction.
 */
export const handleChangeWithinBlockLevel = EditorState.transactionFilter.of(
  (transaction) => {
    const { doc } = transaction.startState;
    const changes: ChangeSpec[] = [];
    const effects: StateEffect<unknown>[] = [];
    const indentationPerLevel = transaction.startState.facet(
      indentationPerLevelFacet
    );

    transaction.changes.iterChanges((fromA, toA, fromB, toB, text) => {
      const fromLine = doc.lineAt(fromA);
      // const toLine = doc.lineAt(toA);
      const fromLevel = findBlockLevelOfLineNumberInDocument(
        doc,
        fromLine.number
      );
      if (
        fromA === fromLine.from && // inserted in beginning
        fromA === toA && // inserted something
        text.lines === 1 && // change only in one line
        !text.line(1).text.trim().length // added only spaces
      ) {
        console.log("level increased");
        effects.push(
          blockLevelChangeEffect.of({
            fromLevel: Math.floor(fromLevel / indentationPerLevel),
            toLevel: Math.floor(
              (fromLevel + text.line(1).length) / indentationPerLevel
            ),
            // TODO find block root line and set that one
            lineNumber: fromLine.number,
          })
        );
        return transaction;
      }

      const toLevel = toA - fromLine.from;
      if (
        fromB === toB && // deleted something
        text.lines === 1 &&
        toLevel < fromLevel
      ) {
        // whitespace deleted in indentation
        // => level decrease
        console.log(`level decreased from ${fromLevel} to ${toLevel}`);
        effects.push(
          blockLevelChangeEffect.of({
            // TODO calculate indentation and block level in separate function / component
            fromLevel: Math.floor(fromLevel / indentationPerLevel),
            toLevel: Math.floor(toLevel / indentationPerLevel),
            // TODO find block root line and set that one
            lineNumber: fromLine.number,
          })
        );
        return transaction;
      }

      if (fromA > fromLine.from && fromA - fromLine.from < fromLevel) {
        // delete all levels and merge with previous line
        console.log("deleting line");
        const deleteLineBreakOfPreviousLine = fromLine.number === 1 ? 0 : 1;
        changes.push({
          from: fromLine.from - deleteLineBreakOfPreviousLine,
          to: fromLine.from + fromLevel,
          insert: "",
        });
      }
    });

    return [
      transaction,
      {
        changes,
        effects,
        sequential: false,
      },
    ];
  }
);
