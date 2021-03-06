import { EditorState, basicSetup, EditorView } from "@codemirror/basic-setup";
import { Extension } from "@codemirror/state";
import { vim } from "@replit/codemirror-vim";
import { blockEditor } from "../src";

export function createTestEditorWithDoc(content: string) {
  let initialState = EditorState.create({
    doc: content,
    extensions: [vim(), blockEditor(), basicSetup],
  });
  return new EditorView({
    state: initialState,
  });
}

export function createTestEditorWithExtensionsAndDoc(
  extensions: Extension[],
  content: string
) {
  let initialState = EditorState.create({
    doc: content,
    extensions,
  });
  return new EditorView({
    state: initialState,
  });
}
