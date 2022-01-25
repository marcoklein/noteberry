import { EditorState } from "@codemirror/basic-setup";
import { inputSetBlockLevelEffect } from "./effects";

/**
 * Ensures an update of the cursor if there is a block level change effect.
 * This is required because the cursor will not see the `padding` change of the block line decorator.
 */
export const updateCursor = EditorState.transactionFilter.of((transaction) => {
  if (
    transaction.effects.findIndex((effect) =>
      effect.is(inputSetBlockLevelEffect)
    ) !== -1
  ) {
    const head =
      transaction.selection?.main.head ??
      transaction.startState.selection.main.head;
    const anchor =
      transaction.selection?.main.anchor ??
      transaction.startState.selection.main.anchor;
    return [transaction, { selection: { head, anchor } }];
  }
  return transaction;
});
