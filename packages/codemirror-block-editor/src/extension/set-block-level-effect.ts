import { StateEffect } from "@codemirror/state";

/**
 * Issued if there is a change of a block level.
 */
export type BlockLevelChangeEffectSpec = {
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
 * Block level effect that contains information about a level change.
 */
export const blockLevelChangeEffect =
  StateEffect.define<BlockLevelChangeEffectSpec>();
