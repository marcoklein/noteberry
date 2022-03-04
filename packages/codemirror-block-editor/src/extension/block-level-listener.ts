import { EditorState, Facet } from "@codemirror/state";
import {
  setBlockLevelEffect,
  SetBlockLevelEffectSpec,
} from "./set-block-level-effect";

export const setBlockLevelListenerFacet =
  Facet.define<(effect: SetBlockLevelEffectSpec[]) => void>();

/**
 * Iterates through all listeners the {@link setBlockLevelListenerFacet} defined.
 * And calls them with all {@link setBlockLevelEffect} effects from this transaction.
 */
// TODO should this really run in a transaction filter or rather in a view plugin where we would merge all block level changes
// then users could run more heavy computations.
export const notifyBlockLevelListeners = EditorState.transactionFilter.of(
  (transaction) => {
    let listeners = transaction.startState.facet(setBlockLevelListenerFacet);
    if (listeners.length) {
      const effects = transaction.effects
        .filter((effect) => effect.is(setBlockLevelEffect))
        .map((effect) => effect.value as SetBlockLevelEffectSpec);
      listeners.forEach((listenerFn) => {
        listenerFn(effects);
      });
    }
    return transaction;
  }
);
