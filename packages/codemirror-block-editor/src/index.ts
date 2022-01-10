import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { Extension, StateField, StateEffect, Facet } from "@codemirror/state";
import {
  DecorationSet,
  Decoration,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { RangeSetBuilder } from "@codemirror/rangeset";
import { keymap } from "@codemirror/view";

const baseTheme = EditorView.baseTheme({
  ".cm-indentation": { paddingLeft: "3rem" },
});

const stepSize = Facet.define<number, number>({
  combine: (values) => (values.length ? Math.min(...values) : 2),
});

const indendationDecoration = Decoration.line({
  attributes: { class: "cm-indentation" },
});

function indentationDecorator(view: EditorView) {
  const step = view.state.facet(stepSize);
  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      let line = view.state.doc.lineAt(pos);
      if (line.number % step === 0) {
        builder.add(line.from, line.from, indendationDecoration);
      }
      pos = line.to + 1;
    }
  }
  return builder.finish();
}

const showIndentations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = indentationDecorator(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = indentationDecorator(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

const indendationKeymap = keymap.of([
  {
    key: "tab",
    preventDefault: true,
    run: () => {
      console.log("tab");
      return true;
    },
  },
  {
    key: "tab",
    shift: () => {
      console.log("Shift-tab");
      return true;
    },
    preventDefault: true,
    run: () => {
      console.log("tab");
      return true;
    },
  },
]);

export function indendationExtension(
  options: { step?: number } = {}
): Extension {
  return [
    baseTheme,
    !options.step ? [] : stepSize.of(options.step),
    showIndentations,
    indendationKeymap,
  ];
}

const initialState = EditorState.create({
  doc: "",
  extensions: [vim(), indendationExtension(), basicSetup],
});
const view = new EditorView({
  parent: document.getElementById("editor") ?? undefined,
  state: initialState,
});
