import { Extension } from "@codemirror/state";
import { dotWidgetViewPlugin } from "./dot-widget";
import { handleChangeWithinBlockLevel } from "./handle-change-within-block-level";
import { blockLevelKeymap } from "./keymap";
import { dotTheme } from "./theme";
import { validateBlockIndentation } from "./validate-block-indentation";
import { validateCursorPosition } from "./validate-cursor-position";

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    // TODO there is a bug that changes precedence -> have to change order of extensions with that patch
    dotWidgetViewPlugin,

    validateCursorPosition,
    // validateBlockIndentation,

    handleChangeWithinBlockLevel,

    dotTheme,
    blockLevelKeymap,
  ];
}
