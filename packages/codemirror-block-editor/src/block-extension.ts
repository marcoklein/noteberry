import { EditorState, EditorView } from "@codemirror/basic-setup";
import {
  ChangeSpec,
  Extension,
  StateEffect,
  StateField,
} from "@codemirror/state";
import { keymap, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { invertedEffects } from "@codemirror/history";
import { applyTextChangeToContent } from "./apply-text-change";
import {
  findBlockLevelOfLine,
  setBlockLevelEffect,
  lineBlockLevelMapField,
} from "./line-block-level-map-field";
import { blockLevelDecorationsField } from "./block-level-decoration-extension";

export const inputIncreaseBlockLevelEffect = StateEffect.define<number>();
export const inputDecreaseBlockLevelEffect = StateEffect.define<number>();

const blockLevelViewPlugin = ViewPlugin.define((view) => {
  console.log("created block level view plugin");
  return {
    update(update: ViewUpdate) {
      console.log("updating view");
      // unindentBlockCommand(view);
    },
  };
});

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

const indendationKeymap = keymap.of([
  {
    key: "Tab",
    preventDefault: true,
    run: (view) => dispatchBlockCommand(view, "increase"),
    shift: (view) => dispatchBlockCommand(view, "decrease"),
  },
]);

const mapInputBlockEffectsToSetBlockEffects = EditorState.transactionFilter.of(
  (transaction) => {
    const { state } = transaction;
    const effects: StateEffect<unknown>[] = [];
    for (const effect of transaction.effects) {
      const isIncreaseEffect = effect.is(inputIncreaseBlockLevelEffect);
      if (isIncreaseEffect || effect.is(inputDecreaseBlockLevelEffect)) {
        const lineNumber = effect.value;
        const fromLevel = findBlockLevelOfLine(state, lineNumber);
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
          const previousLevel = findBlockLevelOfLine(state, lineNumber - 1);
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
            changeText: true,
          })
        );
      }
    }
    if (!effects.length) return transaction;
    return [
      transaction,
      transaction.state.update({ effects, sequential: true }),
    ];
  }
);

const applyBlockLevelIndentationChanges = EditorState.transactionFilter.of(
  (transaction) => {
    const { state, newDoc } = transaction;
    let changes: ChangeSpec[] = [];
    for (const effect of transaction.effects) {
      if (effect.is(setBlockLevelEffect) && effect.value.changeText) {
        const { lineNumber, fromLevel, toLevel } = effect.value;
        const levelDiff = toLevel - fromLevel;
        const line = newDoc.line(lineNumber);
        console.log("block effect", effect.value);

        if (toLevel < fromLevel) {
          changes.push({
            from: line.from + toLevel,
            to: line.from + fromLevel,
          });
        } else {
          changes.push({
            from: line.from,
            to: line.from,
            insert: "-".repeat(levelDiff),
          });
        }
        console.log(transaction);
      }
    }

    return changes.length
      ? [transaction, { changes, sequential: true }]
      : transaction;
  }
);

export function getIntersectionAmount(
  rootFrom: number,
  rootTo: number,
  otherFrom: number,
  otherTo: number
) {
  if (otherTo < rootFrom || rootTo < otherTo) return 0;
  if (otherFrom < rootFrom && rootTo < otherTo) return rootTo - rootFrom;
  if (otherFrom < rootFrom) return rootTo - rootFrom - otherTo - rootFrom;
  if (otherTo < rootTo) return rootTo - rootFrom - rootTo - otherFrom;
  return otherTo - otherFrom;
}

const detectBlockLevelChangesByTextChanges = EditorState.transactionFilter.of(
  (transaction) => {
    const { startState, state, changes, newDoc } = transaction;
    const startDoc = startState.doc;
    const effects: StateEffect<unknown>[] = [];
    changes.iterChanges((fromA, toA, fromB, toB, text) => {
      const fromLine = startDoc.lineAt(toA);
      const fromLineNumber = fromLine.number;
      const toLineNumber = newDoc.lineAt(toB).number;
      const fromLevel = findBlockLevelOfLine(startState, fromLineNumber);
      console.log("lines", fromLineNumber, toLineNumber);
      if (text.lines > 1) console.log("new line!", toLineNumber);
      if (fromLineNumber > toLineNumber) {
        // TODO delete all line in-between
        console.log("deleted line ", fromLineNumber, " with level ", fromLevel);
        effects.push(
          setBlockLevelEffect.of({
            fromLevel,
            toLevel: 0,
            lineNumber: fromLineNumber,
            changeText: false,
          })
        );
      }
      const lineLevelIndentationRange = {
        from: fromLine.from,
        to: fromLine.from + fromLevel,
      };
      const intersectionAmount = getIntersectionAmount(
        lineLevelIndentationRange.from,
        lineLevelIndentationRange.to,
        fromA,
        toA
      );
      console.log("intersection amount", intersectionAmount);
      // check if change is within a block level indentation
      if (intersectionAmount > 0) {
        const toLevel = fromLevel - intersectionAmount;
        console.log("reducing level to ", toLevel);
        effects.push(
          setBlockLevelEffect.of({
            fromLevel,
            toLevel,
            lineNumber: fromLineNumber,
            changeText: false,
          })
        );
      }
    });
    return effects.length ? [transaction, { effects }] : transaction;
  }
);

const protectBlockLevelIndentationsFromChanges = EditorState.changeFilter.of(
  (transaction) => {
    const { startState, state, changes, newDoc } = transaction;
    const startDoc = startState.doc;
    // TODO only check for changed lines
    const result: number[] = [];
    for (let i = 1; i <= state.doc.lines; i++) {
      const level = findBlockLevelOfLine(state, i);
      const line = state.doc.line(i);
      // TODO multiply level by level separator length
      result.push(line.from, line.from + level);
    }
    return result;
  }
);

export function blockExtension(_options: {} = {}): Extension {
  return [
    indendationKeymap,
    mapInputBlockEffectsToSetBlockEffects,
    applyBlockLevelIndentationChanges,
    // detectBlockLevelChangesByTextChanges,
    EditorState.transactionFilter.of((transaction) => {
      return [
        ...applyTextChangeToContent(transaction, (line) =>
          findBlockLevelOfLine(transaction.state, line)
        ),
      ];
    }),
    blockLevelDecorationsField,
    lineBlockLevelMapField,
    // protectBlockLevelIndentationsFromChanges,
    // invertedEffects.of((tr) => {
    //   console.log("inverting effects");
    //   return [];
    // }),
    // TODO adjust history
    // invertedEffects.of((tr) => {
    //   const effects: StateEffect<unknown>[] = [];
    //   const decorations = tr.state.field(blockLevelDecorationsField);
    //   for (const effect of tr.effects) {
    //     if (effect.is(setBlockLevelEffect)) {
    //       // TODO store currentLevel in effect!
    //       const curLevel = findLevelOfLine(
    //         decorations,
    //         tr.newDoc.line(effect.value.lineNumber)
    //       );
    //       effects.push(
    //         setBlockLevelEffect.of({
    //           level: curLevel,
    //           lineNumber: effect.value.lineNumber,
    //         })
    //       );
    //     }
    //   }
    //   console.log("adding inverted effecs", effects);
    //   return effects;
    // }),
  ];
}
