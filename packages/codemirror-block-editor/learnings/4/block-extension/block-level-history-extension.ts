import { EditorState, EditorView } from "@codemirror/basic-setup";
import {
  EditorSelection,
  ChangeSpec,
  Extension,
  StateEffect,
  Prec,
} from "@codemirror/state";
import { invertedEffects } from "@codemirror/history";
import { keymap, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { applyTextChangeToContent } from "./apply-text-change";
import {
  blockLevelDecorationsFacet,
  blockLevelDecorationsField,
  redTextDecoration,
} from "./decorations-field";
import {
  findBlockLevelOfLine,
  setBlockLevelEffect,
} from "./line-block-level-map-field";

export const blockLevelHistory = invertedEffects.of((tr) => {
  const effects: StateEffect<unknown>[] = [];
  const decorations = tr.state.field(blockLevelDecorationsField);
  for (const effect of tr.effects) {
    if (effect.is(setBlockLevelEffect)) {
      console.log("inverting", effect.value);
      // TODO store currentLevel in effect!
      // const curLevel = findBlockLevelOfLine(
      //   decorations,
      //   tr.newDoc.line(effect.value.lineNumber)
      // );
      // effects.push(
      //   setBlockLevelEffect.of({
      //     level: curLevel,
      //     lineNumber: effect.value.lineNumber,
      //   })
      // );
    }
  }
  console.log("adding inverted effecs", effects);
  return effects;
});
