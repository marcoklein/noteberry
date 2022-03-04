import { createTestEditorWithExtensionsAndDoc } from "../../tests/test-utils.test";
import { handleChangeWithinBlockLevel } from "./handle-change-within-block-level";
import {
  setBlockLevelEffect,
  SetBlockLevelEffectSpec,
} from "./set-block-level-effect";

function createTestEditorWithDoc(content: string) {
  return createTestEditorWithExtensionsAndDoc(
    [handleChangeWithinBlockLevel],
    content
  );
}

describe("Handle Change within Block Level", () => {
  it("should delete a line if the first character gets deleted", () => {
    // given
    const view = createTestEditorWithDoc(["- a", "- b"].join("\n"));
    // when
    const changes = view.state.changes({ from: 5, to: 6 });
    view.dispatch(view.state.update({ changes }));
    // then
    expect(view.state.doc.toJSON()).toEqual(["- ab"]);
  });

  it("should fire event if level is decreased", () => {
    // given
    const view = createTestEditorWithDoc(["- a", "  - b"].join("\n"));
    // when
    const changes = view.state.changes({ from: 4, to: 6 });
    const transaction = view.state.update({ changes });
    // then
    expect(transaction.state.doc.toJSON()).toEqual(["- a", "- b"]);
    expect(
      transaction.effects
        .filter((effect) => effect.is(setBlockLevelEffect))
        .map((effect) => effect.value as SetBlockLevelEffectSpec)
    ).toEqual([
      {
        lineNumber: 2,
        fromLevel: 2,
        toLevel: 1,
      },
    ]);
  });

  it("should fire event if level is increased", () => {
    // given
    const view = createTestEditorWithDoc("- a");
    // when
    const changes = view.state.changes({ from: 0, insert: "  " });
    const transaction = view.state.update({ changes });
    // then
    expect(transaction.state.doc.toJSON()).toEqual(["  - a"]);
    expect(
      transaction.effects
        .filter((effect) => effect.is(setBlockLevelEffect))
        .map((effect) => effect.value as SetBlockLevelEffectSpec)
    ).toEqual([
      {
        lineNumber: 1,
        fromLevel: 1,
        toLevel: 2,
      },
    ]);
  });
});
