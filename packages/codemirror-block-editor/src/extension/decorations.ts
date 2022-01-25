import { EditorView } from "@codemirror/basic-setup";
import { Extension, StateField } from "@codemirror/state";
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
    const { state, newDoc, startState } = transaction;
    const startDoc = startState.doc;
    transaction.changes.iterChanges((_fromA, toA, _fromB, toB, text) => {
      const fromLineNumber = startDoc.lineAt(toA).number;
      const toLineNumber = newDoc.lineAt(toB).number;
      console.log("lines", fromLineNumber, toLineNumber);
      if (text.lines > 1) console.log("new line!");
      if (fromLineNumber > toLineNumber) console.log("deleted line");
    });
    decorations = decorations.map(transaction.changes);
    const affectedLinesMap: { [lineNumber: number]: boolean } = {};
    const lineChanges: {
      lineNumber: number;
      fromLevel: number;
      toLevel: number;
    }[] = [];
    for (const effect of transaction.effects) {
      if (effect.is(setBlockLevelEffect)) {
        console.log("set block level effect", effect.value);
        const line = transaction.state.doc.line(effect.value.lineNumber);
        const toLevel = effect.value.toLevel;
        const fromLevel = findBlockLevelOfLine(decorations, line);
        // TODO add logic to verify line change from block-level-extension
        decorations = _updateBlockLevelOfLine(decorations, line, toLevel);
        lineChanges.push({ lineNumber: line.number, fromLevel, toLevel });
        affectedLinesMap[line.number] = true;
      }
    }

    // TODO apply adjustment logic for all block level effects
    const totalLines = newDoc.lines;
    for (const { lineNumber, fromLevel, toLevel } of lineChanges) {
      if (fromLevel < toLevel) {
        // increase
        for (
          let childLineNumber = lineNumber + 1;
          childLineNumber <= totalLines;
          childLineNumber++
        ) {
          // next iteration will handle the next affected line
          // TODO verify that line numbers are sorted!
          if (affectedLinesMap[childLineNumber]) break;
          const childLine = newDoc.line(childLineNumber);
          const childLineLevel = findBlockLevelOfLine(decorations, childLine);
          // is no child cause it has been on the same or smaller level
          if (childLineLevel <= fromLevel) break;
          // also increase children
          decorations = _updateBlockLevelOfLine(
            decorations,
            childLine,
            childLineLevel + 1
          );
        }
      } else {
        // decrease
        for (
          let childLineNumber = lineNumber + 1;
          childLineNumber <= totalLines;
          childLineNumber++
        ) {
          // next iteration will handle the next affected line
          if (affectedLinesMap[childLineNumber]) break;
          const childLine = newDoc.line(childLineNumber);
          const childLineLevel = findBlockLevelOfLine(decorations, childLine);
          if (childLineLevel <= fromLevel) break;
          // also increase children
          decorations = _updateBlockLevelOfLine(
            decorations,
            childLine,
            childLineLevel - 1
          );
        }
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function blockLevelDecorationExtension(_options: {} = {}): Extension {
  return [blockLevelDecorationsField];
}

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
  console.log(
    "set block indentation for line",
    line.number,
    " to level ",
    level
  );
  return decorations;
}
