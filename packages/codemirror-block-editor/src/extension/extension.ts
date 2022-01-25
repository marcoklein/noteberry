import { Extension } from "@codemirror/state";
import { blockLevelDecorationsField } from "./decorations";
import { mapInputBlockEffectsToSetBlockEffects } from "./effects";
import { blockLevelKeymap } from "./keymap";
import { mapInputSetBlockLevelEffectsToSetBlockLevelEffects } from "./policies";
import { updateCursor } from "./update-cursor";

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    blockLevelKeymap,
    blockLevelDecorationsField,
    mapInputBlockEffectsToSetBlockEffects,
    mapInputSetBlockLevelEffectsToSetBlockLevelEffects,
    updateCursor,
  ];
}
