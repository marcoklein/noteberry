import { Facet } from "@codemirror/state";

/**
 * Sets the number of characters that translate into one level jump.
 *
 * E.g. a value of 2 would translate two spaces (`  `) into one level.
 *
 * @defaultValue 2
 */
export const indentationPerLevelFacet = Facet.define<number, number>({
  combine: (values) => (values.length ? values[0] : 2),
});
