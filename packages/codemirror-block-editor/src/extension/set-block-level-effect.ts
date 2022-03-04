import { StateEffect } from "@codemirror/state";

/**
 * Issued if there is a change of a block level.
 */
export type SetBlockLevelEffectSpec = {
  /**
   * Previous level of block.
   */
  fromLevel: number;
  /**
   * New level of block.
   */
  toLevel: number;
  /**
   * Number of the root block line.
   */
  lineNumber: number;
};

/**
 * Set block level on a line number.
 */
export const setBlockLevelEffect =
  StateEffect.define<SetBlockLevelEffectSpec>();
