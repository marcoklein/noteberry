import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { Extension, StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, keymap } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";

const baseTheme = EditorView.baseTheme({
  ".cm-block-indentation": { paddingLeft: "3rem" },
});

const blockIndendationDecoration = Decoration.line({
  attributes: { class: "cm-block-indentation" },
});

const increaseBlockIndentation = StateEffect.define<number>();
const decreaseBlockIndentation = StateEffect.define<number>();

const blockIndentationField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(indentations, transaction) {
    indentations = indentations.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (effect.is(increaseBlockIndentation)) {
        console.log("increase block indentation for line", effect.value);
        indentations = indentations.update({
          add: [blockIndendationDecoration.range(effect.value)],
        });
      }
      if (effect.is(decreaseBlockIndentation)) {
        console.log("decrease block indentation for line", effect.value);
        indentations = indentations.update({
          filter: (from) => from !== effect.value,
        });
      }
    }
    return indentations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function indentBlock(view: EditorView) {
  let effects: StateEffect<unknown>[] = view.state.selection.ranges.map(
    (range) =>
      increaseBlockIndentation.of(view.state.doc.lineAt(range.from).from)
  );
  if (!effects.length) return false;
  if (!view.state.field(blockIndentationField, false)) {
    effects.push(
      StateEffect.appendConfig.of([blockIndentationField, baseTheme])
    );
  }
  view.dispatch({ effects });

  return true;
}

export function unindentBlock(view: EditorView) {
  let effects: StateEffect<unknown>[] = view.state.selection.ranges.map(
    (range) =>
      decreaseBlockIndentation.of(view.state.doc.lineAt(range.from).from)
  );
  if (!effects.length) return false;
  if (!view.state.field(blockIndentationField, false)) {
    effects.push(
      StateEffect.appendConfig.of([blockIndentationField, baseTheme])
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
      indentBlock(view);
      return true;
    },
    shift: (view: EditorView) => {
      console.log("Shift-Tab");
      unindentBlock(view);
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
    basicSetup,
  ],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});
