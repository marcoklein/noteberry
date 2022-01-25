import { EditorView } from "@codemirror/basic-setup";
import { StateField } from "@codemirror/state";
import { Line } from "@codemirror/text";
import { Decoration, DecorationSet } from "@codemirror/view";
import { setBlockLevelEffect } from "./effects";

/**
 * Gets a block level of a line by searching the given decorations.
 *
 * @param decorations
 * @param line
 * @returns
 */
export const findBlockLevelOfLine = (
  decorations: DecorationSet,
  line: Line
) => {
  let level = 0;
  decorations.between(line.from, line.from, (_, __, value) => {
    // find current indentation of block
    level = Number.parseInt(value.spec.attributes.blockLevel);
    return false;
  });
  return level;
};

/**
 * All decorations for information about the current indentation levels of lines.
 *
 * Use `findBlockLevelOfLine` to get the block level indentation of a line.
 */
export const blockLevelDecorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, transaction) {
    decorations = decorations.map(transaction.changes);
    const lineChanges: {
      lineNumber: number;
      fromLevel: number;
      toLevel: number;
    }[] = [];
    for (const effect of transaction.effects) {
      if (effect.is(setBlockLevelEffect)) {
        // console.log("set block level effect", effect.value);
        const line = transaction.state.doc.line(effect.value.lineNumber);
        const toLevel = effect.value.toLevel;
        const fromLevel = findBlockLevelOfLine(decorations, line);
        decorations = _updateBlockLevelOfLine(decorations, line, toLevel);
        lineChanges.push({ lineNumber: line.number, fromLevel, toLevel });
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

function _updateBlockLevelOfLine(
  decorations: DecorationSet,
  line: Line,
  level: number
) {
  let add = [];
  if (level > 0) {
    add.push(
      Decoration.line({
        attributes: {
          style: `padding-left: ${level + 1}ch; text-indent: ${level + 1}ch`,
          blockLevel: `${level}`,
        },
      }).range(line.from)
    );
  }
  decorations = decorations.update({
    filter: (from) => from !== line.from,
    add,
  });
  // console.log(
  //   "set block indentation for line",
  //   line.number,
  //   " to level ",
  //   level
  // );
  return decorations;
}
