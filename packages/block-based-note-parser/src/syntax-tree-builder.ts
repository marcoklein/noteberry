import { Position } from "unist";
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
    return { children: [], type: "BlockList" };
  }

  newEmptyLine() {
    throw new Error("Not implemented yet.");
  }

  newBlock(level: number, indentation: number, lineContent: string) {
    this.lastOffset += LINE_BREAK_LENGTH;
    const lineNumber = this.blocks.children.length + 1;
    const lineContentLength = lineContent.length;
    const block: Block = {
      type: "Block",
      data: {
        level: level,
      },
      children: [
        {
          type: "RootBlockLine",
          data: {
            indentation: {
              type: "BlockLineIndentation",
              value: indentation,
              position: {
                start: { column: 1, line: lineNumber, offset: this.lastOffset },
                end: {
                  column: 1,
                  line: lineNumber,
                  offset: (this.lastOffset += indentation),
                },
              },
            },
            content: {
              type: "BlockLineContent",
              value: lineContent,
              position: {
                start: {
                  column: 1 + indentation,
                  line: lineNumber,
                  offset: this.lastOffset,
                },
                end: {
                  column: 1 + indentation + lineContentLength,
                  line: lineNumber,
                  offset: (this.lastOffset += lineContentLength),
                },
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

  newBlockLine(indentation: number, lineContent: string) {
    this.lastOffset += LINE_BREAK_LENGTH;
    const lineNumber = this.blocks.children.length + 1;
    const lineContentLength = lineContent.length;
    this.activeBlock!.children.push({
      type: "ChildBlockLine",
      data: {
        indentation: {
          type: "BlockLineIndentation",
          value: indentation,
          position: {
            start: { column: 1, line: lineNumber, offset: this.lastOffset },
            end: {
              column: 1,
              line: lineNumber,
              offset: (this.lastOffset += indentation),
            },
          },
        },
        content: {
          type: "BlockLineContent",
          value: lineContent,
          position: {
            start: {
              column: 1 + indentation,
              line: lineNumber,
              offset: this.lastOffset,
            },
            end: {
              column: 1 + indentation + lineContentLength,
              line: lineNumber,
              offset: (this.lastOffset += lineContentLength),
            },
          },
        },
      },
    });
    return this;
  }
}
