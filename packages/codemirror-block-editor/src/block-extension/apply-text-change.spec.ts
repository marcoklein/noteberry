import { EditorState } from "@codemirror/basic-setup";
import { expect } from "chai";
import { applyTextChangeToContent } from "./apply-text-change.js";
import { setBlockLevelEffect } from "./line-block-level-map-field.js";

describe("Block Level Changes", () => {
  it("should replace the line break", () =>
    testTextChange(
      ["A", "-B", "--C"],
      { from: 1, to: 2, insert: "XXXX" },
      ["AXXXXB", "--C"],
      [
        {
          line: 2,
          to: -1,
        },
      ]
    ));

  it("should replace the line break and move one line", () =>
    testTextChange(
      ["A", "-B", "--C"],
      { from: 1, to: 2, insert: "XXXX" },
      ["AXXXXB", "--C"],
      [
        {
          line: 2,
          to: -1,
        },
      ]
    ));

  it("should insert multiple lines and insert levels in between", () =>
    testTextChange(
      ["A", "-B"],
      { from: 0, to: 1, insert: "XX\nXX" },
      ["XX", "XX", "-B"],
      [
        {
          line: 1,
          to: 0,
          from: -1,
        },
      ]
    ));

  it("should insert multiple lines", () =>
    testTextChange(
      ["A", "-B"],
      { from: 0, to: 1, insert: "XX\nXX\nXX" },
      ["XX", "XX", "XX", "-B"],
      [
        {
          from: -1,
          line: 1,
          to: 0,
        },
        {
          from: -1,
          line: 1,
          to: 0,
        },
      ]
    ));

  it("should insert multiple lines without changing the bottom level", () =>
    testTextChange(
      ["A", "B"],
      { from: 0, to: 2, insert: "XX\nXX\n" },
      ["XX", "XX", "B"],
      [
        {
          from: -1,
          line: 1,
          to: 0,
        },
      ]
    ));

  it("should replace characters within level", () =>
    testTextChange(
      ["----A"],
      { from: 1, to: 2, insert: "XX" },
      ["-XXA"],
      [
        {
          line: 1,
          to: 1,
        },
      ]
    ));

  it("should replace the line break and change bottom line level", () =>
    testTextChange(
      ["A", "-B", "-C"],
      { from: 1, to: 2, insert: "X\n" },
      ["AX", "B", "-C"],
      [{ from: 1, line: 2, to: 0 }]
    ));

  it("should delete and replace multiple lines", () =>
    testTextChange(
      ["A", "-B", "--C"],
      { from: 1, to: 6, insert: "X\nXX\nXXX\nXXX\n" },
      ["AX", "XX", "XXX", "XXX", "C"],
      [
        {
          from: 1,
          line: 2,
          to: 0,
        },
        {
          from: -1,
          line: 2,
          to: 0,
        },
        {
          from: -1,
          line: 2,
          to: 0,
        },
        {
          from: 2,
          line: 3,
          to: 0,
        },
      ]
    ));
});

/**
 * Generates a test case.
 *
 * @param contentLines Original content. Use '-' in the beginning to indicate the level.
 * @param change
 * @param expectedLines
 * @param expectedLevelChanges
 */
function testTextChange(
  contentLines: string[],
  change: { from: number; to?: number; insert?: string },
  expectedLines: string[],
  expectedLevelChanges: { line: number; to: number; from?: number }[] = []
) {
  // given
  const state = EditorState.create({ doc: contentLines.join("\n") });
  const lineLevelMapping: { [line: number]: number } = {};
  contentLines.forEach((line, index) => {
    const lineNumber = index + 1;
    lineLevelMapping[lineNumber] = (line.match(/-/g) ?? []).length;
  });
  const transaction = state.update({
    changes: change,
  });
  // when
  const result = state.update(
    ...applyTextChangeToContent(transaction, (line) => lineLevelMapping[line])
  );
  // then
  expect(result.newDoc.toJSON()).to.deep.equal(expectedLines);
  // expect(result.effects).to.deep.equal([]);
  expect(result.effects).to.have.lengthOf(
    expectedLevelChanges.length,
    `Expected effects count and actual effects count differ. ${JSON.stringify(
      result.effects.map((effect) => effect.value)
    )}`
  );
  result.effects.forEach((effect) => {
    if (effect.is(setBlockLevelEffect)) {
      const foundLevelChangeIndex = expectedLevelChanges.findIndex(
        (expectedChange) => expectedChange.line === effect.value.lineNumber
      );
      if (foundLevelChangeIndex !== -1) {
        expect(expectedLevelChanges[foundLevelChangeIndex].to).to.equal(
          effect.value.toLevel,
          `Line ${effect.value.lineNumber} has an unexpected level change.`
        );
        expect(effect.value.fromLevel).to.equal(
          expectedLevelChanges[foundLevelChangeIndex].from ??
            lineLevelMapping[effect.value.lineNumber]
        );
        expectedLevelChanges.splice(foundLevelChangeIndex, 1);
      }
    }
  });
  expect(expectedLevelChanges).to.deep.equal(
    [],
    "Not all expected level changes were found."
  );
}
