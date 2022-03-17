import { Literal, Node, Parent, Position } from "unist";

export interface BlockLineIndentation extends Literal<number> {
  type: "BlockLineIndentation";
  position: Position;
}

export interface BlockLineContent extends Literal<string> {
  type: "BlockLineContent";
  position: Position;
}

export interface EmptyLine extends Literal<string> {
  type: "EmptyLine";
  position: Position;
}

export interface BlockLine extends Node {
  type: "RootBlockLine" | "ChildBlockLine";
  data: {
    indentation: BlockLineIndentation;
    content: BlockLineContent;
  };
}

export interface Block extends Parent<BlockLine, { level: number }> {
  type: "Block";
  data: { level: number };
}

export interface BlockList extends Parent<Block | EmptyLine> {
  type: "BlockList";
}
