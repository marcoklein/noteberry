import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { vim } from "@replit/codemirror-vim";
import { blockExtension } from "./block-extension/block-extension";

console.log("starting");

const initialState = EditorState.create({
  doc: [
    "Indent block with Tab",
    "and use Shift-Tab to decrease the block indentation",
    "itemA",
    "itemB",
    "itemC",
    "itemD",
  ].join("\n"),
  extensions: [vim(), blockExtension(), basicSetup],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});
