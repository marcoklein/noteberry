import { EditorState } from "@codemirror/state";

export const BLOCK_LEVEL_TEXT_PATTERN = "- ";

export function findBlockLevelOfLine(state: EditorState, lineNumber: number) {
  const index = state.doc
    .line(lineNumber)
    // TODO check if start of line is only whitespaces
    .text.indexOf(BLOCK_LEVEL_TEXT_PATTERN);
  if (index >= 0) {
    return index + 2;
  }
  return 0;
}
