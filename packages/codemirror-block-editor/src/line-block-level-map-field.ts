import { EditorState } from "@codemirror/basic-setup";
import { StateEffect, StateField } from "@codemirror/state";

export type SetBlockLevelEffectSpec = {
  lineNumber: number;
  fromLevel: number;
  toLevel: number;
  changeText: boolean;
};
export const setBlockLevelEffect =
  StateEffect.define<SetBlockLevelEffectSpec>();

/**
 * Field that contains an array that maps lines to block levels.
 *
 * Use `findBlockLevelOfLine()` to access the block level.
 */
export const lineBlockLevelMapField = StateField.define<number[]>({
  create() {
    return [];
  },
  update(blocksMapField, transaction) {
    const effects = transaction.effects.filter((effect) =>
      effect.is(setBlockLevelEffect)
    ) as StateEffect<SetBlockLevelEffectSpec>[];
    if (!effects.length) return blocksMapField;

    const deletions: number[] = [];

    blocksMapField = Object.assign([], blocksMapField);
    for (const effect of effects) {
      const { lineNumber, toLevel } = effect.value;
      if (toLevel < 0) {
        deletions.push(lineNumber);
      }
      blocksMapField[lineNumber] = toLevel;
    }

    if (deletions.length) {
      console.log("before del", blocksMapField);
      deletions.forEach((lineNumber, deletionCount) => {
        blocksMapField.splice(lineNumber - deletionCount, 1);
      });
      console.log("after del", blocksMapField);
    }
    return blocksMapField;
  },
});

export const findBlockLevelOfLine = (
  state: EditorState,
  lineNumber: number
) => {
  const mappings = state.field(lineBlockLevelMapField, false) || [];
  return mappings[lineNumber] ?? 0;
};
