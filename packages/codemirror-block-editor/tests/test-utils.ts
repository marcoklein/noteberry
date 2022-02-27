import { EditorState, basicSetup, EditorView } from "@codemirror/basic-setup";
import { vim } from "@replit/codemirror-vim";
import { blockLevelExtension } from "../src/extension";

export function createTestEditorWithDoc(content: string) {
  let initialState = EditorState.create({
    doc: content,
    extensions: [vim(), blockLevelExtension(), basicSetup],
  });
  return new EditorView({
    state: initialState,
  });
}
