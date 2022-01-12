import { EditorView } from "@codemirror/basic-setup";
import { Extension, StateEffect } from "@codemirror/state";
import { keymap, ViewPlugin, ViewUpdate } from "@codemirror/view";
import {
  blockLevelDecorationsField,
  findLevelOfLine,
  setBlockLevelEffect,
} from "./block-level-decoration-extension";

function _blockCommand(view: EditorView, mode: "increase" | "decrease") {
  const effects: StateEffect<unknown>[] = [];
  const lines = view.state.selection.ranges.map((range) =>
    view.state.doc.lineAt(range.from)
  );
  for (const line of lines) {
    if (mode === "increase") {
      const decorations = view.state.field(blockLevelDecorationsField);
      console.log("increase block indentation for line", line.number);
      let newLevel = findLevelOfLine(decorations, line) + 1;
      if (line.number === 1) {
        // never increase first line
        console.log("cannot increase level of root line");
        continue;
      }
      const previousLine = view.state.doc.line(line.number - 1);
      const previousLevel = findLevelOfLine(decorations, previousLine);
      if (newLevel > previousLevel + 1) {
        // only 1 level jumps
        console.log("only level jumps of 1 are allowed");
        continue;
      }
      effects.push(
        setBlockLevelEffect.of({
          lineNumber: line.number,
          level: newLevel,
        })
      );
    } else if (mode === "decrease") {
      const decorations = view.state.field(blockLevelDecorationsField);
      console.log("decrease block indentation for line", line.number);
      const level = Math.max(findLevelOfLine(decorations, line) - 1, 0);
      effects.push(
        setBlockLevelEffect.of({
          lineNumber: line.number,
          level: level,
        })
      );
    } else {
      throw new Error("Unhandled mode: " + mode);
    }
  }
  if (!effects.length) return false;
  // TODO dispatch even to update cursor state or just update view?
  view.dispatch({ effects });
}

export const increaseBlockIndentationEffect = StateEffect.define<number>();
export const decreaseBlockIndentationEffect = StateEffect.define<number>();

const blockLevelViewPlugin = ViewPlugin.define((view) => {
  console.log("created block level view plugin");
  return {
    update(update: ViewUpdate) {
      console.log("updating view");
      // unindentBlockCommand(view);
    },
  };
});

export function indentBlockCommand(view: EditorView) {
  _blockCommand(view, "increase");
  return true;
}

export function unindentBlockCommand(view: EditorView) {
  _blockCommand(view, "decrease");
  return true;
}

const indendationKeymap = keymap.of([
  {
    key: "Tab",
    preventDefault: true,
    run: indentBlockCommand,
    shift: unindentBlockCommand,
  },
]);

export function blockLevelExtension(_options: {} = {}): Extension {
  return [blockLevelViewPlugin, indendationKeymap];
}
