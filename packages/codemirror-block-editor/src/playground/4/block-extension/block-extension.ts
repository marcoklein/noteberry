import { Extension, Prec } from "@codemirror/state";
import { applyBlockLevelIndentationChanges } from "./apply-block-level-indentation-changes";
import { detectBlockLevelChangesByTextChanges } from "./apply-text-change";
import {
  blockLevelDecorationsFacet,
  blockLevelDecorationsField,
  redTextDecoration,
} from "./decorations-field";
import {
  indendationKeymap,
  mapInputBlockEffectsToSetBlockEffects,
} from "./input-commands";
import { lineBlockLevelMapField } from "./line-block-level-map-field";
import { moveCursorToBlockLevelIndentationEndExtension } from "./move-selection";

export function blockExtension(_options: {} = {}): Extension {
  return [
    indendationKeymap,
    mapInputBlockEffectsToSetBlockEffects,
    applyBlockLevelIndentationChanges,
    detectBlockLevelChangesByTextChanges,
    blockLevelDecorationsFacet.of(() => redTextDecoration),
    blockLevelDecorationsField,
    lineBlockLevelMapField,
    // blockLevelHistory,
    // Prec.low(moveCursorToBlockLevelIndentationEndExtension),
  ];
}
