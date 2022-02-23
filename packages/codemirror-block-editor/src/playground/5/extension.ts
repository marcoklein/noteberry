import { Extension } from "@codemirror/state";
import { blockLevelDecorationsField } from "./decorations";
import { dotWidgetViewPlugin } from "./dot-widget";
import { mapInputBlockEffectsToSetBlockEffects } from "./effects";
import { blockLevelKeymap } from "./keymap";
import { blockLevelListenerExtension } from "./listener";
import { mapInputSetBlockLevelEffectsToSetBlockLevelEffects } from "./policies";
import { dotTheme } from "./theme";
import { updateCursor } from "./update-cursor";

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    dotTheme,
    blockLevelListenerExtension(),
    blockLevelKeymap,
    blockLevelDecorationsField,
    mapInputBlockEffectsToSetBlockEffects,
    mapInputSetBlockLevelEffectsToSetBlockLevelEffects,
    updateCursor,
    dotWidgetViewPlugin,
  ];
}
