import { Extension, Facet } from "@codemirror/state";
import { ViewPlugin } from "@codemirror/view";
import { setBlockLevelEffect, SetBlockLevelEffectSpec } from "./effects";

export const setBlockLevelListenerFacet =
  Facet.define<(effects: SetBlockLevelEffectSpec[]) => void>();

const blockLevelListenerViewPlugin = ViewPlugin.define(() => {
  return {
    update: (update) => {
      update.transactions.forEach((transaction) => {
        const listeners = transaction.state.facet(setBlockLevelListenerFacet);
        const transactionEffects = transaction.effects
          .filter((effect) => effect.is(setBlockLevelEffect))
          .map((effect) => effect.value);
        if (transactionEffects.length) {
          listeners.forEach((listenerFn) => {
            listenerFn(transactionEffects);
          });
        }
      });
    },
  };
});

export function blockLevelListenerExtension(options: {} = {}): Extension {
  return [blockLevelListenerViewPlugin];
}
