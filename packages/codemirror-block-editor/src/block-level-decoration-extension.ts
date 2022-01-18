import { EditorState, EditorView } from "@codemirror/basic-setup";
import { Extension, StateEffect, StateField } from "@codemirror/state";
import { Line } from "@codemirror/text";
import { Decoration, DecorationSet } from "@codemirror/view";
import { invertedEffects } from "@codemirror/history";
import { setBlockLevelEffect } from "./line-block-level-map-field";

const blockLevelDecoration = Decoration.mark({
  attributes: {
    style: `color: red`,
  },
});

export const blockLevelDecorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, transaction) {
    const { state, newDoc, startState, effects } = transaction;
    const startDoc = startState.doc;
    decorations = decorations.map(transaction.changes);
    for (const effect of effects) {
      if (effect.is(setBlockLevelEffect)) {
        const { lineNumber, fromLevel, toLevel } = effect.value;
        const line = startState.doc.line(lineNumber);
        let decoration = undefined;
        if (toLevel > 0) {
          decoration = [
            blockLevelDecoration.range(line.from, line.from + toLevel),
            // blockLevelDecoration.range(0, 10),
          ];
        }
        decorations = decorations.update({
          filter: (from) => from !== startState.doc.line(lineNumber).from,
          add: decoration,
        });
        console.log("added a block level decoration");
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});
