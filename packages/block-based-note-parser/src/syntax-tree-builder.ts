import { Block, BlockList } from "./block-node";
const LINE_BREAK_LENGTH = 1;

/**
 * Used for building a block syntax tree.
 */
export class BlockSyntaxTreeBuilder {
  private blocks: BlockList;
  private activeBlock: Block | undefined;
  private lastOffset: number;

  constructor() {
    this.blocks = this.emptyBlockList();
    this.lastOffset = -1;
    this.reset();
  }

  reset() {
    this.blocks = this.emptyBlockList();
    this.lastOffset = -1;
    return this;
  }

  /**
   * Return the build syntax tree.
   * Call `reset` to build a new syntax tree.
   *
   * @returns Syntax tree instance.
   */
  syntaxTree() {
    return this.blocks;
  }

  private emptyBlockList(): BlockList {
    return { children: [], type: "blockList" };
  }

  newEmptyLine() {
    throw new Error("Not implemented yet.");
  }

  newBlock(level: number, indentationText: string, lineContent: string) {
    this.lastOffset += LINE_BREAK_LENGTH;
    const lineNumber = this.blocks.children.length + 1;
    const lineContentLength = lineContent.length;
    const indentationLength = indentationText.length;
    const block: Block = {
      type: "block",
      level,
      children: [
        {
          type: "rootBlockLine",
          indentation: {
            type: "blockLineIndentation",
            indentation: indentationLength,
            value: indentationText,
            position: {
              start: { column: 1, line: lineNumber, offset: this.lastOffset },
              end: {
                column: 1,
                line: lineNumber,
                offset: (this.lastOffset += indentationLength),
              },
            },
          },
          content: {
            type: "blockLineContent",
            value: lineContent,
            position: {
              start: {
                column: 1 + indentationLength,
                line: lineNumber,
                offset: this.lastOffset,
              },
              end: {
                column: 1 + indentationLength + lineContentLength,
                line: lineNumber,
                offset: (this.lastOffset += lineContentLength),
              },
            },
          },
        },
      ],
    };
    this.activeBlock = block;
    this.blocks.children.push(block);
    return this;
  }

  newBlockLine(indentationText: string, lineContent: string) {
    this.lastOffset += LINE_BREAK_LENGTH;
    const lineNumber = this.blocks.children.length + 1;
    const lineContentLength = lineContent.length;
    const indentationLength = indentationText.length;
    this.activeBlock!.children.push({
      type: "childBlockLine",
      indentation: {
        type: "blockLineIndentation",
        indentation: indentationLength,
        value: indentationText,
        position: {
          start: { column: 1, line: lineNumber, offset: this.lastOffset },
          end: {
            column: 1,
            line: lineNumber,
            offset: (this.lastOffset += indentationLength),
          },
        },
      },
      content: {
        type: "blockLineContent",
        value: lineContent,
        position: {
          start: {
            column: 1 + indentationLength,
            line: lineNumber,
            offset: this.lastOffset,
          },
          end: {
            column: 1 + indentationLength + lineContentLength,
            line: lineNumber,
            offset: (this.lastOffset += lineContentLength),
          },
        },
      },
    });
    return this;
  }
}
