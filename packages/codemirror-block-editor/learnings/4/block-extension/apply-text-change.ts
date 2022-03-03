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
    console.log(
      "line level changed",
      line.number,
      "from level",
      fromLevel,
      "to level",
      toLevel
    );
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
  const lineDeleted = (line: Line, fromLevel: number) => {
    console.log("deleting line", line.number, "from level", fromLevel);
    resultingChanges.push({
      from: line.from,
      to: line.from + fromLevel,
    });
    resultingEffects.push(
      setBlockLevelEffect.of({
        changeText: false,
        fromLevel,
        toLevel: -1,
        lineNumber: line.number,
      })
    );
  };

  transaction.changes.iterChanges((fromA, toA, _, __, text) => {
    console.log("changes", fromA, toA);
    const startingLine = startDoc.lineAt(fromA);
    let endingLine = startDoc.lineAt(toA);
    // eg if we delete a line ending / replace with identical text
    console.log("changed", transaction.docChanged);
    console.log("equal", transaction.startState.doc.eq(transaction.newDoc));
    const lastText = text.line(text.lines).text;
    console.log("last text", lastText);
    console.log("text lines", text.lines);
    const replacingOnlyLineBreakOfEndingLine = toA === endingLine.from;
    console.log(
      "replacing only line break",
      replacingOnlyLineBreakOfEndingLine
    );
    const replacingLineBreakOfEndingLine = toA < endingLine.to;
    console.log(
      "replacing line break of ending line",
      replacingLineBreakOfEndingLine
    );
    const lastTextHasEndingLine = text.lines > 1 && lastText === "";
    console.log("last text has ending line", lastTextHasEndingLine);
    const lastTextLineIsLineBreakAdjustment =
      lastTextHasEndingLine && replacingOnlyLineBreakOfEndingLine ? 1 : 0;
    console.log("last text line break", lastTextLineIsLineBreakAdjustment);

    const affectedOldLinesCount =
      endingLine.number -
      startingLine.number +
      1 -
      lastTextLineIsLineBreakAdjustment;
    const affectedNewLinesCount =
      text.lines - lastTextLineIsLineBreakAdjustment;
    const maxAffectedLinesCount = Math.max(
      affectedNewLinesCount,
      affectedOldLinesCount
    );
    console.log("max affected lines", maxAffectedLinesCount);
    console.log("affected old", affectedOldLinesCount);
    console.log("affected new", affectedNewLinesCount);

    for (let lineNumber = 0; lineNumber < maxAffectedLinesCount; lineNumber++) {
      const affectedOldLine =
        lineNumber < affectedOldLinesCount
          ? startDoc.line(lineNumber + startingLine.number)
          : undefined;
      const affectedNewLine =
        lineNumber < affectedNewLinesCount
          ? text.line(lineNumber + 1)
          : undefined;
      console.log("affected lines", affectedOldLine, affectedNewLine);

      if (affectedOldLine !== undefined && affectedNewLine !== undefined) {
        // replace
        console.log("line num", lineNumber);
        if (lineNumber + 1 === 1) {
          console.log("resolving first line");
          const startLineIntersection = fromA - affectedOldLine.from;
          const startLevel = levelOfLine(affectedOldLine.number);
          console.log("start line intersection", startLineIntersection);
          console.log("startlevel", startLevel);
          lineLevelChanged(
            startingLine,
            startLevel,
            Math.min(startLevel, startLineIntersection)
          );
        } else if (
          affectedOldLinesCount === affectedNewLinesCount &&
          lineNumber + 1 === affectedOldLinesCount
        ) {
          // last line
          console.log("resolving last line");
          // TODO extract into common function (with lower last line function)
          const endLineIntersection = toA - affectedOldLine.from;
          const remainingLevelIntersection =
            levelOfLine(affectedOldLine.number) - endLineIntersection;

          console.log("intersection", endLineIntersection);
          console.log(
            "remaining level intersection",
            remainingLevelIntersection
          );
          if (remainingLevelIntersection > 0) {
            lineLevelChanged(
              affectedOldLine,
              levelOfLine(affectedOldLine.number),
              remainingLevelIntersection
            );
            resultingChanges.push({
              from: affectedOldLine.from + endLineIntersection,
              to:
                affectedOldLine.from +
                endLineIntersection +
                remainingLevelIntersection,
            });
          }
        } else if (!(lastTextHasEndingLine && toA === endingLine.from)) {
          lineLevelChanged(
            affectedOldLine,
            levelOfLine(affectedOldLine.number),
            0
          );
        } else {
          // replace the line
          console.log("skip");
        }
      } else if (
        affectedOldLine !== undefined &&
        affectedNewLine === undefined
      ) {
        // old line exists but new line does not

        // TODO extract into common function (with upper last line function)
        console.log("resolving last line");
        const levelOfEndingLine = levelOfLine(affectedOldLine.number);
        const endLineIntersection = toA - affectedOldLine.from;
        const remainingLevelIntersection =
          levelOfEndingLine - endLineIntersection;
        // levelOfLine(endingLine.number) - endLineIntersection;

        console.log(
          "remaining level intersection",
          remainingLevelIntersection,
          "level=",
          levelOfEndingLine
        );
        // if (
        //   // affectedOldLinesCount === maxAffectedLinesCount - 1 &&
        //   replacingOnlyLineBreakOfEndingLine &&
        //   lastTextHasEndingLine
        // ) {
        //   // if this is the last line we have can skip any changes if the new line only contains a line break
        //   console.log("skipping line because it only affects line break");
        // }

        // if (remainingLevelIntersection !== levelOfEndingLine) {
        //   lineLevelChanged(
        //     endingLine,
        //     levelOfLine(endingLine.number),
        //     remainingLevelIntersection
        //   );
        //   resultingChanges.push({
        //     from: endingLine.from + endLineIntersection,
        //     to:
        //       endingLine.from +
        //       endLineIntersection +
        //       remainingLevelIntersection,
        //   });
        // }
        console.log("deleting old line with number", affectedOldLine.number);
        lineDeleted(affectedOldLine, levelOfLine(affectedOldLine.number));
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
            lineNumber:
              affectedOldLinesCount -
              // (lastTextLineIsLineBreakAdjustment === 1 ? 0 : 1),
              (lastTextLineIsLineBreakAdjustment !== 1 &&
              lastTextHasEndingLine &&
              replacingLineBreakOfEndingLine
                ? 1
                : 0),
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
