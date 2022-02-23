import { Extension } from "@codemirror/state";
import { dotWidgetViewPlugin } from "./dot-widget";
import { handleChangeWithinBlockLevel } from "./handle-change-within-block-level";
import { blockLevelKeymap } from "./keymap";
import { moveCursorToBlockLevelIndentationEndExtension } from "./move-selection";
import { dotTheme } from "./theme";

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    dotTheme,
    blockLevelKeymap,
    handleChangeWithinBlockLevel,
    moveCursorToBlockLevelIndentationEndExtension,
    dotWidgetViewPlugin,
  ];
}
