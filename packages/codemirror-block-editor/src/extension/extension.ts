import { Extension } from "@codemirror/state";
import { blockLevelDecorationExtension } from "./decorations";
import { mapInputBlockEffectsToSetBlockEffects } from "./effects";
import { blockLevelKeymap } from "./keymap";

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    blockLevelDecorationExtension(),
    blockLevelKeymap,
    mapInputBlockEffectsToSetBlockEffects,
  ];
}
