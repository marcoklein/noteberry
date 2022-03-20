import { Literal as UnistLiteral, Node, Parent, Position } from "unist";

interface Literal extends UnistLiteral {
  value: string;
}

/**
 * Indendation of the block line.
 */
export interface BlockLineIndentation extends Literal {
  type: "blockLineIndentation";
  position: Position;
  /**
   * Number of characters of the indentation.
   */
  indentation: number;
}

/**
 * Text content of a block line.
 */
export interface BlockLineContent extends Literal {
  type: "blockLineContent";
  position: Position;
  /**
   * Text content of the block line.
   */
  value: string;
}

/**
 * An empty line in the document.
 */
export interface EmptyLine extends Literal {
  type: "emptyLine";
  position: Position;
}

/**
 * Line that belongs to a block and has a certain indentation and content.
 */
export interface BlockLine extends Node {
  type: "rootBlockLine" | "childBlockLine";
  indentation: BlockLineIndentation;
  content: BlockLineContent;
}

/**
 * A single block that might span multiple lines.
 */
export interface Block extends Parent {
  type: "block";
  children: BlockLine[];
  /**
   * 1-based level.
   */
  level: number;
}

/**
 * Root list of all blocks.
 */
export interface BlockList extends Parent {
  type: "blockList";
  children: (Block | EmptyLine)[];
}
