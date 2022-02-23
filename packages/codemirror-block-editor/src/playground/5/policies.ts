import { Decoration, DecorationSet } from "@codemirror/view";
import { EditorState } from "@codemirror/basic-setup";
import { StateEffect } from "@codemirror/state";
import { Text } from "@codemirror/text";
import {
  blockLevelDecorationsField,
  findBlockLevelOfLine,
} from "./decorations";
import {
  inputSetBlockLevelEffect,
  setBlockLevelEffect,
  SetBlockLevelEffectSpec,
} from "./effects";

/**
 * Maps input effects for block levels to the actual block level changes.
 */
export const mapInputSetBlockLevelEffectsToSetBlockLevelEffects =
  EditorState.transactionFilter.of((transaction) => {
    const state = transaction.state; // TODO use startState?
    const { newDoc } = transaction;
    const decorations = transaction.startState.field(
      blockLevelDecorationsField
    );
    const effects: StateEffect<SetBlockLevelEffectSpec>[] = [];

    const affectedLinesMap: { [lineNumber: number]: boolean } = {};
    for (const effect of transaction.effects) {
      if (effect.is(inputSetBlockLevelEffect)) {
        const { fromLevel, toLevel, lineNumber } = effect.value;
        if (
          // TODO return reason of invalid line change and present it to user
          // introduce a new effect for that
          _isLevelChangeValid(
            decorations,
            state.doc,
            fromLevel,
            toLevel,
            lineNumber
          )
        ) {
          affectedLinesMap[lineNumber] = true;
          effects.push(
            setBlockLevelEffect.of({ fromLevel, toLevel, lineNumber })
          );
        }
      }
    }

    const totalLines = newDoc.lines;
    for (const effect of effects) {
      // TODO apply adjustment logic for all block level effects
      const { lineNumber, fromLevel, toLevel } = effect.value;
      if (fromLevel < toLevel) {
        // increase
        for (
          let childLineNumber = lineNumber + 1;
          childLineNumber <= totalLines;
          childLineNumber++
        ) {
          // next iteration will handle the next affected line
          // TODO verify that line numbers are sorted!
          if (affectedLinesMap[childLineNumber]) break;
          const childLine = newDoc.line(childLineNumber);
          const childLineLevel = findBlockLevelOfLine(decorations, childLine);
          // is no child cause it has been on the same or smaller level
          if (childLineLevel <= fromLevel) break;
          effects.push(
            setBlockLevelEffect.of({
              lineNumber: childLine.number,
              fromLevel: childLineLevel,
              toLevel: childLineLevel + 1,
            })
          );
        }
      } else {
        // decrease
        for (
          let childLineNumber = lineNumber + 1;
          childLineNumber <= totalLines;
          childLineNumber++
        ) {
          if (affectedLinesMap[childLineNumber]) break;
          const childLine = newDoc.line(childLineNumber);
          const childLineLevel = findBlockLevelOfLine(decorations, childLine);
          if (childLineLevel <= fromLevel) break;
          effects.push(
            setBlockLevelEffect.of({
              lineNumber: childLine.number,
              fromLevel: childLineLevel,
              toLevel: childLineLevel - 1,
            })
          );
        }
      }
    }

    if (!effects.length) return transaction;
    return [
      transaction,
      transaction.state.update({ effects, sequential: true }),
    ];
  });

function _isLevelChangeValid(
  decorations: DecorationSet,
  doc: Text,
  fromLevel: number,
  toLevel: number,
  lineNumber: number
) {
  if (fromLevel === toLevel) {
    console.log("no change for equal from and to level");
    return false;
  }
  if (lineNumber === 1) {
    console.log("cannot change level of root line");
    return false;
  }

  const isIncreaseEffect = toLevel > fromLevel;
  if (isIncreaseEffect) {
    const previousLevel = findBlockLevelOfLine(
      decorations,
      doc.line(lineNumber - 1)
    );
    if (toLevel > previousLevel + 1) {
      // only 1 level jumps
      console.log("only level jumps of 1 are allowed");
      return false;
    }
  } else {
    // decrease
  }
  return true;
}
