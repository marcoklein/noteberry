import { EditorState } from "@codemirror/state";

export const BLOCK_LEVEL_TEXT_PATTERN = "- ";

export function findBlockLevelOfLineNumberInState(
  state: EditorState,
  lineNumber: number
) {
  // TODO walk upwards to find block level if current line has no block level text pattern
  const index = state.doc
    .line(lineNumber)
    // TODO check if start of line is only whitespaces
    .text.indexOf(BLOCK_LEVEL_TEXT_PATTERN);
  if (index >= 0) {
    return index + 2;
  }
  return 0;
}

export function findBlockLevelCharacterIndentationOfLine(lineText: string) {
  const index = lineText.indexOf(BLOCK_LEVEL_TEXT_PATTERN);
  if (index >= 0) {
    return index + 2;
  }
  return 0;
}
