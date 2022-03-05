import { EditorState, Facet } from "@codemirror/state";
import {
  blockLevelChangeEffect,
  BlockLevelChangeEffectSpec,
} from "./set-block-level-effect";

export const blockLevelListenerFacet =
  Facet.define<(effect: BlockLevelChangeEffectSpec[]) => void>();

/**
 * Iterates through all listeners the {@link blockLevelListenerFacet} defined.
 * And calls them with all {@link setBlockLevelEffect} effects from this transaction.
 */
// TODO should this really run in a transaction filter or rather in a view plugin where we would merge all block level changes
// then users could run more heavy computations.
export const notifyBlockLevelListeners = EditorState.transactionFilter.of(
  (transaction) => {
    let listeners = transaction.startState.facet(blockLevelListenerFacet);
    if (listeners.length) {
      const effects = transaction.effects
        .filter((effect) => effect.is(blockLevelChangeEffect))
        .map((effect) => effect.value as BlockLevelChangeEffectSpec);
      listeners.forEach((listenerFn) => {
        listenerFn(effects);
      });
    }
    return transaction;
  }
);
