import { Extension } from "@codemirror/state";
import { blockLevelDecorationsField } from "./decorations";
import { mapInputBlockEffectsToSetBlockEffects } from "./effects";
import { blockLevelKeymap } from "./keymap";
import { blockLevelListenerExtension } from "./listener";
import { mapInputSetBlockLevelEffectsToSetBlockLevelEffects } from "./policies";
import { updateCursor } from "./update-cursor";

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    blockLevelListenerExtension(),
    blockLevelKeymap,
    blockLevelDecorationsField,
    mapInputBlockEffectsToSetBlockEffects,
    mapInputSetBlockLevelEffectsToSetBlockLevelEffects,
    updateCursor,
  ];
}
