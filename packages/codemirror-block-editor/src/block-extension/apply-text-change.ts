import { EditorState } from "@codemirror/basic-setup";
import {
  ChangeSpec,
  StateEffect,
  Transaction,
  TransactionSpec,
} from "@codemirror/state";
import { Line } from "@codemirror/text";
import {
  findBlockLevelOfLine,
  setBlockLevelEffect,
} from "./line-block-level-map-field";

export function applyTextChangeToContent(
  transaction: Transaction,
  levelOfLine: (line: number) => number
): Array<Transaction | TransactionSpec> {
  const resultingEffects: StateEffect<unknown>[] = [];
  const resultingChanges: ChangeSpec[] = [];
  const { startState } = transaction;
  const { doc: startDoc } = startState;

  const lineLevelChanged = (line: Line, fromLevel: number, toLevel: number) => {
    console.log("line level changed", line.number, fromLevel, toLevel);
    if (toLevel < fromLevel && fromLevel > 0) {
      resultingChanges.push({
        from: line.from + Math.max(0, toLevel),
        to: line.from + fromLevel,
      });
    }
    if (fromLevel !== toLevel) {
      resultingEffects.push(
        setBlockLevelEffect.of({
          changeText: false,
          fromLevel,
          toLevel,
          lineNumber: line.number,
        })
      );
    }
  };
  const lineDeleted = (lineNumber: number, fromLevel: number) => {
    console.log("deleting line", lineNumber, fromLevel);
    resultingEffects.push(
      setBlockLevelEffect.of({
        changeText: false,
        fromLevel,
        toLevel: -1,
        lineNumber,
      })
    );
  };

  transaction.changes.iterChanges((fromA, toA, _, __, text) => {
    console.log("changes", fromA, toA);
    const startingLine = startDoc.lineAt(fromA);
    const endingLine = startDoc.lineAt(toA);
    // eg if we delete a line ending / replace with identical text
    console.log("changed", transaction.docChanged);
    console.log("equal", transaction.startState.doc.eq(transaction.newDoc));
    const lastText = text.line(text.lines).text;
    console.log("text lines", text.lines);
    const lastTextLineIsLineBreakAdjustment = lastText === "" ? 1 : 0;
    console.log("last text line break", lastTextLineIsLineBreakAdjustment);
    const changedLines =
      endingLine.number -
      startingLine.number +
      1 -
      lastTextLineIsLineBreakAdjustment;
    console.log("affected lines", changedLines);
    const lineChangeDiff = text.lines - changedLines;
    console.log("line chane diff", lineChangeDiff);

    console.log("starting line", startingLine);
    console.log("ending line", endingLine);

    // start line
    const startLineIntersection = fromA - startingLine.from;
    const startLevel = levelOfLine(startingLine.number);
    console.log("start line intersection", startLineIntersection);
    console.log("startlevel", startLevel);
    lineLevelChanged(
      startingLine,
      startLevel,
      Math.min(startLevel, startLineIntersection)
    );

    // lines in-between
    const affectedOldLinesCount = endingLine.number - startingLine.number + 1;
    const affectedNewLinesCount = text.lines;
    const maxAffectedLinesCount = Math.max(
      affectedNewLinesCount,
      affectedOldLinesCount
    );
    console.log("max affected lines", maxAffectedLinesCount);
    console.log("affected old", affectedOldLinesCount);
    console.log("affected new", affectedNewLinesCount);

    for (let lineNumber = 1; lineNumber < maxAffectedLinesCount; lineNumber++) {
      const affectedOldLine =
        lineNumber < affectedOldLinesCount
          ? startDoc.line(lineNumber + startingLine.number)
          : undefined;
      const affectedNewLine =
        lineNumber < affectedNewLinesCount ? text.line(lineNumber) : undefined;
      console.log("affected lines", affectedOldLine, affectedNewLine);

      if (affectedOldLine !== undefined && affectedNewLine !== undefined) {
        // replace
        if (
          affectedOldLinesCount === affectedNewLinesCount &&
          lineNumber === affectedOldLinesCount
        ) {
          // last line
          console.log("resolving last line");
          // TODO extract into common function (with lower last line function)
          const endLineIntersection = toA - endingLine.from;
          const remainingLevelIntersection =
            levelOfLine(endingLine.number) - endLineIntersection;

          console.log(
            "remaining level intersection",
            remainingLevelIntersection
          );
          if (remainingLevelIntersection > 0) {
            lineLevelChanged(
              endingLine,
              levelOfLine(endingLine.number),
              remainingLevelIntersection
            );
            resultingChanges.push({
              from: endingLine.from + endLineIntersection,
              to:
                endingLine.from +
                endLineIntersection +
                remainingLevelIntersection,
            });
          }
        } else {
          lineLevelChanged(
            affectedOldLine,
            levelOfLine(affectedOldLine.number),
            0
          );
        }
      } else if (
        affectedOldLine !== undefined &&
        affectedNewLine === undefined
      ) {
        // delete
        console.log("diff line cound", affectedNewLinesCount - lineNumber);
        console.log(
          "diff line cound",
          affectedOldLinesCount - affectedNewLinesCount
        );
        // TODO extract into common function (with upper last line function)
        console.log("resolving last line");
        const endLineIntersection = toA - endingLine.from;
        const remainingLevelIntersection =
          levelOfLine(endingLine.number) - endLineIntersection;

        console.log("remaining level intersection", remainingLevelIntersection);
        if (remainingLevelIntersection > 0) {
          lineLevelChanged(
            endingLine,
            levelOfLine(endingLine.number),
            remainingLevelIntersection
          );
          resultingChanges.push({
            from: endingLine.from + endLineIntersection,
            to:
              endingLine.from +
              endLineIntersection +
              remainingLevelIntersection,
          });
        }
        console.log("deleting old line with number", affectedOldLine.number);
        lineDeleted(
          affectedOldLine.number,
          levelOfLine(affectedOldLine.number)
        );
      } else if (
        affectedOldLine === undefined &&
        affectedNewLine !== undefined
      ) {
        // insert
        console.log("insert");
        resultingEffects.push(
          setBlockLevelEffect.of({
            changeText: false,
            fromLevel: -1,
            toLevel: 0,
            // TODO only set last text line break if new text has content?
            lineNumber:
              affectedOldLinesCount - lastTextLineIsLineBreakAdjustment,
          })
        );
      } else {
        throw Error("Too many iterations.");
      }
    }
  });

  return [
    transaction,
    { changes: resultingChanges, effects: resultingEffects, sequential: false },
  ];
}

export const detectBlockLevelChangesByTextChanges =
  EditorState.transactionFilter.of((transaction) =>
    applyTextChangeToContent(transaction, (line) =>
      findBlockLevelOfLine(transaction.startState, line)
    )
  );
