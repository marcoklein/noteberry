import { Text } from "@codemirror/text";

export const BLOCK_LEVEL_TEXT_PATTERN = "- ";

/**
 * Recusively walks up lines to find the first line that has a block level text pattern.
 *
 * @param state
 * @param lineNumber
 * @returns
 */
export function findBlockLevelOfLineNumberInState(
  doc: Text,
  lineNumber: number
) {
  for (
    let currentLineNumber = lineNumber;
    currentLineNumber >= 1;
    currentLineNumber--
  ) {
    const blockLevel = findBlockLevelCharacterIndentationOfLine(
      doc.line(currentLineNumber).text
    );
    if (blockLevel > 0) {
      return blockLevel;
    }
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
