import { EditorState } from "@codemirror/basic-setup";
import { StateEffect } from "@codemirror/state";
import {
  blockLevelDecorationsField,
  findBlockLevelOfLine,
} from "./decorations";

/**
 * Increase block level of line number.
 */
export const inputIncreaseBlockLevelEffect = StateEffect.define<number>();

/**
 * Decrease block level of line number.
 */
export const inputDecreaseBlockLevelEffect = StateEffect.define<number>();

/**
 * Issued if there is a change of a block level.
 */
export type SetBlockLevelEffectSpec = {
  fromLevel: number;
  toLevel: number;
  lineNumber: number;
};

/**
 * Set block level on a line number.
 */
export const setBlockLevelEffect =
  StateEffect.define<SetBlockLevelEffectSpec>();

/**
 * Converts increase and decrease input effects into `SetLevelEffect`s.
 */
export const mapInputBlockEffectsToSetBlockEffects =
  EditorState.transactionFilter.of((transaction) => {
    const { state } = transaction;
    const decorations = state.field(blockLevelDecorationsField);
    const effects: StateEffect<unknown>[] = [];
    for (const effect of transaction.effects) {
      const isIncreaseEffect = effect.is(inputIncreaseBlockLevelEffect);
      if (isIncreaseEffect || effect.is(inputDecreaseBlockLevelEffect)) {
        const lineNumber = effect.value;
        const fromLevel = findBlockLevelOfLine(
          decorations,
          state.doc.line(lineNumber)
        );
        const toLevel = Math.max(
          0,
          isIncreaseEffect ? fromLevel + 1 : fromLevel - 1
        );
        if (fromLevel === toLevel) {
          console.log("no change for equal from and to level");
          continue;
        }
        if (lineNumber === 1) {
          console.log("cannot change level of root line");
          continue;
        }
        if (isIncreaseEffect) {
          const previousLevel = findBlockLevelOfLine(
            decorations,
            state.doc.line(lineNumber - 1)
          );
          if (toLevel > previousLevel + 1) {
            // only 1 level jumps
            console.log("only level jumps of 1 are allowed");
            continue;
          }
        } else {
          // decrease
        }
        effects.push(
          setBlockLevelEffect.of({
            fromLevel,
            toLevel,
            lineNumber,
          })
        );
      }
    }
    if (!effects.length) return transaction;
    return [
      transaction,
      transaction.state.update({ effects, sequential: true }),
    ];
  });
