import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { vim } from "@replit/codemirror-vim";
import { blockLevelExtension } from "./extension";

const initialState = EditorState.create({
  doc: [
    "Indent block with Tab",
    "and use Shift-Tab to decrease the block indentation",
    "itemA",
    "itemB",
    "itemC",
    "itemD",
  ].join("\n"),
  extensions: [vim(), blockLevelExtension(), basicSetup],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});
