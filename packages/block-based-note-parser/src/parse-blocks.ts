interface BlockNode {
  level: number;
  lines: string[];
}

/**
 * Parses raw text content. Assuming the line break being `\r?\n`.
 *
 * @param content Raw text content.
 */
export function parseBlocks(content: string) {
  const lines = content.split(/\r?\n/);
  const indentationLengthPerLevel = 2;
  const stack: BlockNode[] = [];
  let parsedFirstLineWithBlockMarker = false;
  lines.forEach((line) => {
    const blockMarkerResult = /^\W*- /.exec(line);
    if (blockMarkerResult) {
      parsedFirstLineWithBlockMarker = true;
      const blockIndentation = blockMarkerResult[0].length;
      const blockLineContent = line.substr(blockIndentation);
      const level = blockIndentationToBlockLevel(
        blockIndentation,
        indentationLengthPerLevel
      );
      stack.push({ level, lines: [blockLineContent] });
    } else {
      if (!stack.length) {
        stack.push({
          level: 1,
          lines: [line],
        });
      } else {
        const currentBlockNode = stack[stack.length - 1];
        // TODO could optimize by considering spaces of the blockMarkerResult
        const lineSpaceIndentation = /^\W*/.exec(line)?.[0].length ?? 0;
        const lineContentWithoutIndentation = getLineContentWithoutIndentation(
          currentBlockNode,
          line,
          lineSpaceIndentation,
          parsedFirstLineWithBlockMarker,
          indentationLengthPerLevel
        );
        currentBlockNode.lines.push(lineContentWithoutIndentation);
      }
    }
  });
  return stack;
}

function blockIndentationToBlockLevel(
  blockIndentation: number,
  indentationLengthPerLevel: number
) {
  return Math.min(blockIndentation / indentationLengthPerLevel);
}

function getLineContentWithoutIndentation(
  currentBlockNode: BlockNode,
  line: string,
  lineSpaceIndentation: number,
  parsedFirstLineWithBlockMarkerFlag: boolean,
  indentationLengthPerLevel: number
) {
  if (parsedFirstLineWithBlockMarkerFlag) {
    return line.substr(
      Math.min(
        lineSpaceIndentation,
        currentBlockNode.level * indentationLengthPerLevel
      )
    );
  }
  return line;
}
