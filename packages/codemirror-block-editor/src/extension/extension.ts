import { ChangeSpec, EditorState, Extension } from "@codemirror/state";
import { addBlockOnNewLine } from "./add-block-on-new-line";
import { dotWidgetViewPlugin } from "./dot-widget";
import {
  findBlockLevelCharacterIndentationOfLine,
  findBlockLevelOfLineNumberInDocument,
} from "./find-block-level-of-line";
import { handleChangeWithinBlockLevel } from "./handle-change-within-block-level";
import { blockLevelKeymap } from "./keymap";
import { dotTheme } from "./theme";
import { validateCursorPosition } from "./validate-cursor-position";

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    // TODO there is a bug that changes precedence -> have to change order of extensions with that patch
    // dotWidgetViewPlugin,

    validateCursorPosition,
    addBlockOnNewLine,

    handleChangeWithinBlockLevel,

    dotTheme,
    blockLevelKeymap,
  ];
}