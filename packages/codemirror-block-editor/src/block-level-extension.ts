import { EditorView } from "@codemirror/basic-setup";
import { Extension, StateEffect, StateField } from "@codemirror/state";
import { Line } from "@codemirror/text";
import { Decoration, DecorationSet, keymap } from "@codemirror/view";

function _blockCommand(
  view: EditorView,
  command:
    | typeof increaseBlockIndentationEffect
    | typeof decreaseBlockIndentationEffect
) {
  let effects: StateEffect<unknown>[] = view.state.selection.ranges.map(
    (range) => command.of(view.state.doc.lineAt(range.from).from)
  );
  // TODO put block level changing logic here
  if (!effects.length) return false;
  view.dispatch({ effects });
}

export const increaseBlockIndentationEffect = StateEffect.define<number>();
export const decreaseBlockIndentationEffect = StateEffect.define<number>();

export const findLevelOfLine = (decorations: DecorationSet, line: Line) => {
  let level = 0;
  decorations.between(line.from, line.to, (_, __, value) => {
    // find current indentation of block
    level = Number.parseInt(value.spec.attributes.blockLevel);
    return false;
  });
  return level;
};

export const blockIndentationDecorationsField =
  StateField.define<DecorationSet>({
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
      const updateBlockLevelOfLine = (line: Line, level: number) => {
        let add = [];
        if (level > 0) {
          add.push(
            Decoration.line({
              attributes: {
                style: `padding-left: ${level + 1}rem`,
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
          line,
          " to level ",
          level
        );
      };
      decorations = decorations.map(transaction.changes);
      for (const effect of transaction.effects) {
        if (effect.is(increaseBlockIndentationEffect)) {
          const line = transaction.state.doc.lineAt(effect.value);
          console.log("increase block indentation for line", line.number);
          let newLevel = findLevelOfLine(decorations, line) + 1;
          if (line.number === 1) {
            // never increase first line
            console.log("cannot increase level of root line");
            continue;
          }
          const previousLine = transaction.state.doc.line(line.number - 1);
          const previousLevel = findLevelOfLine(decorations, previousLine);
          if (newLevel > previousLevel + 1) {
            // only 1 level jumps
            console.log("only level jumps of 1 are allowed");
            continue;
          }
          updateBlockLevelOfLine(line, newLevel);
        }
        if (effect.is(decreaseBlockIndentationEffect)) {
          const line = transaction.state.doc.lineAt(effect.value);
          console.log("decrease block indentation for line", line.number);
          const level = Math.max(findLevelOfLine(decorations, line) - 1, 0);
          updateBlockLevelOfLine(line, level);
        }
      }

      return decorations;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

export function indentBlockCommand(view: EditorView) {
  _blockCommand(view, increaseBlockIndentationEffect);
  return true;
}

export function unindentBlockCommand(view: EditorView) {
  _blockCommand(view, decreaseBlockIndentationEffect);
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
  return [blockIndentationDecorationsField, indendationKeymap];
}
