import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { Extension, StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, keymap } from "@codemirror/view";
import { TreeCursor } from "@lezer/common";
import { Block } from "./block-document";

const baseTheme = EditorView.baseTheme({
  ".cm-block-indentation": { paddingLeft: "3rem" },
});

const increaseBlockIndentationEffect = StateEffect.define<number>();
const decreaseBlockIndentationEffect = StateEffect.define<number>();

// const blockState = StateField.define<Block[]>({
//   create(state: EditorState) {
//     console.log("creating");
//     return [];
//   },
//   update(blocks, transaction) {
//     // transaction.changes.iterChanges((fromA, toA, fromB, toB, text) => {
//     //   console.log("change", fromA, toA, fromB, toB, text.toJSON());
//     // });
//     console.log(
//       transaction.state.field(blockIndentationDecorationsField, false)
//     );

//     return blocks;
//   },
// });

const blockIndentationDecorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(indentations, transaction) {
    const findLevelOfLine = (line: number) => {
      let level = 0;
      indentations.between(line, line, (_, __, value) => {
        // find current indentation of block
        level = Number.parseInt(value.spec.attributes.blockLevel);
        return false;
      });
      return level;
    };
    const updateBlockLevelOfLine = (line: number, level: number) => {
      let add = [];
      if (level > 0) {
        add.push(
          Decoration.line({
            attributes: {
              style: `padding-left: ${level + 1}rem`,
              blockLevel: `${level}`,
            },
          }).range(line)
        );
      }
      indentations = indentations.update({
        filter: (from) => from !== line,
        add,
      });
      console.log("set block indentation for line", line, " to level ", level);
    };
    indentations = indentations.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (effect.is(increaseBlockIndentationEffect)) {
        console.log("increase block indentation for line", effect.value);
        const level = findLevelOfLine(effect.value) + 1;
        updateBlockLevelOfLine(effect.value, level);
      }
      if (effect.is(decreaseBlockIndentationEffect)) {
        console.log("decrease block indentation for line", effect.value);
        const level = Math.max(findLevelOfLine(effect.value) - 1, 0);
        updateBlockLevelOfLine(effect.value, level);
      }
    }
    return indentations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function indentBlockCommand(view: EditorView) {
  let effects: StateEffect<unknown>[] = view.state.selection.ranges.map(
    (range) =>
      increaseBlockIndentationEffect.of(view.state.doc.lineAt(range.from).from)
  );
  if (!effects.length) return false;
  if (!view.state.field(blockIndentationDecorationsField, false)) {
    effects.push(
      StateEffect.appendConfig.of([blockIndentationDecorationsField, baseTheme])
    );
  }
  view.dispatch({ effects });

  return true;
}

export function unindentBlockCommand(view: EditorView) {
  let effects: StateEffect<unknown>[] = view.state.selection.ranges.map(
    (range) =>
      decreaseBlockIndentationEffect.of(view.state.doc.lineAt(range.from).from)
  );
  if (!effects.length) return false;
  if (!view.state.field(blockIndentationDecorationsField, false)) {
    effects.push(
      StateEffect.appendConfig.of([blockIndentationDecorationsField, baseTheme])
    );
  }
  view.dispatch({ effects });
  return true;
}

const indendationKeymap = keymap.of([
  {
    key: "Tab",
    preventDefault: true,
    run: (view: EditorView) => {
      console.log("Tab");
      indentBlockCommand(view);
      return true;
    },
    shift: (view: EditorView) => {
      console.log("Shift-Tab");
      unindentBlockCommand(view);
      return true;
    },
  },
]);

export function blockIndentationExtension(_options: {} = {}): Extension {
  return [baseTheme, indendationKeymap];
}

const initialState = EditorState.create({
  doc: [
    "Indent block with Tab",
    "and use Shift-Tab to decrease the block indentation",
  ].join("\n"),
  extensions: [
    //vim(),
    blockIndentationExtension(),
    // blockState,
    basicSetup,
  ],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});
