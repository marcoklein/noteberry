import { Extension } from "@codemirror/state";
import { blockRendererViewPlugin } from "../view/block-renderer-view-plugin";
import { addBlockOnNewLine } from "./add-block-on-new-line";
import { notifyBlockLevelListeners } from "./block-level-listener";
import { dotWidgetViewPlugin } from "./dot-widget";
import { handleChangeWithinBlockLevel } from "./handle-change-within-block-level";
import { blockLevelKeymap } from "./keymap";
import { dotTheme } from "./theme";
import { validateCursorPosition } from "./validate-cursor-position";

export function blockLevelExtension(_options: {} = {}): Extension {
  return [
    // TODO there is a bug that changes precedence -> have to change order of extensions with that patch

    // views
    blockRendererViewPlugin,
    dotWidgetViewPlugin,
    dotTheme,

    // listeners
    notifyBlockLevelListeners,

    // selection
    validateCursorPosition,

    // changes
    addBlockOnNewLine,
    handleChangeWithinBlockLevel,

    // keymap
    blockLevelKeymap,

    // config
    // indentationPerLevelFacet.of(2),
  ];
}
