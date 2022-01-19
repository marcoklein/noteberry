import { EditorState, EditorView } from "@codemirror/basic-setup";
import { Facet, Extension, StateEffect, StateField } from "@codemirror/state";
import { Line } from "@codemirror/text";
import { WidgetType, Decoration, DecorationSet } from "@codemirror/view";
import { invertedEffects } from "@codemirror/history";
import {
  findBlockLevelOfLine,
  setBlockLevelEffect,
  SetBlockLevelEffectSpec,
} from "./line-block-level-map-field";

class DotWidget extends WidgetType {
  constructor(readonly level: number) {
    super();
  }

  eq(other: DotWidget) {
    return other.level == this.level;
  }

  toDOM() {
    const dot = document.createElement("span");
    dot.style.height = "8px";
    dot.style.width = "8px";
    dot.style.backgroundColor = "#bbb";
    dot.style.borderRadius = "50%";
    dot.style.display = "inline-block";

    const wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.style.padding = `2px`;
    wrap.style.paddingLeft = `${this.level}rem`;
    wrap.appendChild(dot);
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}

export const redTextDecoration = Decoration.mark({
  attributes: {
    style: `color: red`,
  },
});

export const blockLevelDecorationsFacet = Facet.define<
  (params: { toLevel: number }) => Decoration,
  (params: { toLevel: number }) => Decoration
>({
  combine: (decorations) =>
    decorations.length
      ? decorations[0]
      : (effect: { toLevel: number }) =>
          Decoration.replace({
            widget: new DotWidget(effect.toLevel),
            inclusive: false,
          }),
});

export const blockLevelDecorationsField = StateField.define<DecorationSet>({
  create(state) {
    // TODO alternatively we could use a view plugin to generate level decorations
    // one lines that get visible only!
    // see https://codemirror.net/6/examples/zebra/
    // const decoratorFunction = state.facet(blockLevelDecorationsFacet);
    // let add = [];
    // for (let i = 1; i < state.doc.lines; i++) {
    //   const line = state.doc.line(i);
    //   const toLevel = findBlockLevelOfLine(state, i);
    //   console.log(line.from, line.from + toLevel);
    //   add.push(
    //     decoratorFunction({ toLevel }).range(line.from, line.from + toLevel)
    //   );
    // }
    // return Decoration.none.update({ add });
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
            state
              .facet(blockLevelDecorationsFacet)(effect.value)
              .range(line.from, line.from + toLevel),
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
