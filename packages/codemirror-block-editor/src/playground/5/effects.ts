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
 * Issued to change the block level of a line.
 * But will not necessarily change the level because it is passing a filter that verifies the level settings.
 * `setBlockLevelEffect` will adjust the level.
 */
export const inputSetBlockLevelEffect =
  StateEffect.define<SetBlockLevelEffectSpec>();

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
        effects.push(
          inputSetBlockLevelEffect.of({
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
