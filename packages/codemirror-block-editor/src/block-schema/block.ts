type BlockListLink = {
  prev?: BlockListLink;
  value: Block;
  next?: BlockListLink;
};
export class BlockList {
  private _headLink: BlockListLink;
  private _tailLink: BlockListLink;
  constructor(rootBlock: Block) {
    this._headLink = {
      value: rootBlock,
    };
    this._tailLink = this._headLink;
  }

  add(block: Block) {
    // this._tailLink.next = {block}
  }

  /**
   *
   * @param list
   * @param callback
   * @returns True to stop the iteration.
   */
  iterate(callback: (block: Block, index: number) => void | boolean) {
    let cur: BlockListLink | undefined = this._headLink;
    let index = 0;
    while (cur) {
      if (callback(cur.value, index)) return;
      cur = cur.next;
      index++;
    }
  }

  toArray() {
    const result: Block[] = [];
    this.iterate((block) => {
      result.push(block);
    });
    return result;
  }
}

export class Block {
  private _lines: string[];
  private children: BlockList = new BlockList(this);

  private constructor(lines: string[] = []) {
    this._lines = lines;
  }

  get lines(): readonly string[] {
    return this._lines;
  }
  get linesCount() {
    return this._lines.length;
  }

  static empty() {
    return new Block();
  }

  static withLines(lines: string[]) {
    return new Block(lines);
  }

  static setLines(block: Block, lines: string[]) {
    block._lines = lines;
  }

  static iterateChildren(
    rootBlock: Block,
    callback: (block: Block, index: number) => void | boolean
  ) {
    rootBlock.children.iterate((block, index) => {
      if (callback(block, index)) {
        return true;
      }
    });
  }

  static iterateChildrenRecursively(
    rootBlock: Block,
    callback: (
      block: Block,
      blockIndex: number,
      childIndex: number
    ) => void | boolean
  ) {
    let blockIndex = 0;
    const iterateNextBlock = (nextBlock: Block) => {
      this.iterateChildren(nextBlock, (block, childIndex) => {
        blockIndex++;
        iterateNextBlock(nextBlock);
        if (callback(block, blockIndex, childIndex)) {
          return true;
        }
      });
    };
    iterateNextBlock(rootBlock);
  }
}

/**
 * 1-based line index range.
 */
export interface LineRange {
  fromLine: number;
  toLine: number;
}

export interface BlockInLineRange extends LineRange {
  block: Block;
}

export class BlockManager {
  static findBlocksInLineRange(
    rootBlock: Block,
    range: LineRange
  ): BlockInLineRange[] {
    const result: BlockInLineRange[] = [];
    let currentLine = 1;
    Block.iterateChildren(rootBlock, (block, index) => {
      currentLine++;
    });
    return result;
  }

  static iterateBlocksRecursively(
    rootBlock: Block,
    callback: (block: Block, index: number) => void | boolean
  ) {}
}
