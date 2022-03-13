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
  // let currentLines: string[] = [];
  // let currentLevel = 0;
  // let currentChildren: ParseTreeNode[] = [
  //   { lines: currentLines, children: [] },
  // ];
  // let currentNode: ParseTreeNode = {
  //   children: currentChildren,
  //   lines: currentLines,
  // };
  // let levelStack: ParseTreeNode[] = [currentNode];
  // let parseTree: NodeChildren = { children: [currentNode] };

  const stack: BlockNode[] = [];
  let parsedFirstLineWithBlockMarker = false;
  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const blockMarkerResult = /^\W*- /.exec(line);
    if (blockMarkerResult) {
      parsedFirstLineWithBlockMarker = true;
      // block marker
      const blockIndentation = blockMarkerResult[0].length;
      const blockLineContent = line.substr(blockIndentation);
      const level = blockIndentationToBlockLevel(blockIndentation);
      // push new line to stack
      const blockNode: BlockNode = { level, lines: [blockLineContent] };
      stack.push(blockNode);
    } else {
      // no block marker
      // TODO what if this is the first block to add?
      if (parsedFirstLineWithBlockMarker) {
      }

      // const lineSpaceIndentation = /^\W*/.exec(line);
      let lineContentWithoutIndentation = line;
      // lineContentWithoutIndentation =

      if (!stack.length) {
        stack.push({
          level: 1,
          lines: [line],
        });
      } else {
        const currentBlockNode = stack[stack.length - 1];
        currentBlockNode.lines.push(lineContentWithoutIndentation);
      }
    }
  });
  return stack;
}

function blockIndentationToBlockLevel(
  blockIndentation: number,
  indentationLengthPerLevel = 2
) {
  return Math.min(blockIndentation / indentationLengthPerLevel);
}
