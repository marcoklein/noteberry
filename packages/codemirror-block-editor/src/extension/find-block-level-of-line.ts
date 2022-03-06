import { Text } from "@codemirror/text";

export const BLOCK_LEVEL_TEXT_PATTERN = "- ";

/**
 * Recusively walks up lines to find the first line that has a block level text pattern.
 *
 * @param state
 * @param lineNumber
 * @returns
 */
export function findBlockLevelOfLineNumberInDocument(
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

export function findBlockLevelAndLineNumberOfLineNumberInDocument(
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
      return {
        rootBlockLine: currentLineNumber,
        blockLevel,
      };
    }
  }
  return {
    rootBlockLine: 0,
    blockLevel: 0,
  };
}

export function findBlockLevelCharacterIndentationOfLine(lineText: string) {
  // TODO test pattern with start of line
  const index = lineText.indexOf(BLOCK_LEVEL_TEXT_PATTERN);
  if (index >= 0) {
    return index + 2;
  }
  return 0;
}
