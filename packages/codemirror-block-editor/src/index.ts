import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { blockLevelExtension } from "./block-level-extension";

const initialState = EditorState.create({
  doc: [
    "Indent block with Tab",
    "and use Shift-Tab to decrease the block indentation",
  ].join("\n"),
  extensions: [
    //vim(),
    // blockState,
    basicSetup,
    blockLevelExtension(),
  ],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});
