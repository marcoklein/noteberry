import { EditorState, EditorView } from "@codemirror/basic-setup";
import { StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import {
  blockLevelDecorationsField,
  findBlockLevelOfLine,
  setBlockLevelEffect,
} from "./block-level-decoration-extension";

export const inputIncreaseBlockLevelEffect = StateEffect.define<number>();
export const inputDecreaseBlockLevelEffect = StateEffect.define<number>();

function dispatchBlockCommand(view: EditorView, mode: "increase" | "decrease") {
  const effects: StateEffect<unknown>[] = [];
  const lines = view.state.selection.ranges.map((range) =>
    view.state.doc.lineAt(range.from)
  );
  for (const line of lines) {
    if (mode === "increase") {
      effects.push(inputIncreaseBlockLevelEffect.of(line.number));
    } else if (mode === "decrease") {
      effects.push(inputDecreaseBlockLevelEffect.of(line.number));
    } else {
      throw new Error("Unhandled mode: " + mode);
    }
  }
  if (!effects.length) return false;
  view.dispatch({ effects });
  return true;
}

export const indendationKeymap = keymap.of([
  {
    key: "Tab",
    preventDefault: true,
    run: (view) => dispatchBlockCommand(view, "increase"),
    shift: (view) => dispatchBlockCommand(view, "decrease"),
  },
]);

export const mapInputBlockEffectsToSetBlockEffects =
  EditorState.transactionFilter.of((transaction) => {
    const { state } = transaction;
    const decorations = state.field(blockLevelDecorationsField);
    const effects: StateEffect<unknown>[] = [];
    for (const effect of transaction.effects) {
      const isIncreaseEffect = effect.is(inputIncreaseBlockLevelEffect);
      if (isIncreaseEffect || effect.is(inputDecreaseBlockLevelEffect)) {
        const lineNumber = effect.value;
        const fromLevel = findBlockLevelOfLine(
          decorations,
          state.doc.line(lineNumber)
        );
        const toLevel = Math.max(
          0,
          isIncreaseEffect ? fromLevel + 1 : fromLevel - 1
        );
        if (fromLevel === toLevel) {
          console.log("no change for equal from and to level");
          continue;
        }
        if (lineNumber === 1) {
          console.log("cannot change level of root line");
          continue;
        }
        if (isIncreaseEffect) {
          const previousLevel = findBlockLevelOfLine(
            decorations,
            state.doc.line(lineNumber - 1)
          );
          if (toLevel > previousLevel + 1) {
            // only 1 level jumps
            console.log("only level jumps of 1 are allowed");
            continue;
          }
        } else {
          // decrease
        }
        effects.push(
          setBlockLevelEffect.of({
            fromLevel,
            toLevel,
            lineNumber,
          })
        );
      }
    }
    if (!effects.length) return transaction;
    return [
      transaction,
      transaction.state.update({ effects, sequential: true }),
    ];
  });
