import { Facet } from "@codemirror/state";

/**
 * Sets the block marker
 * Block Marker: Text that indicates a block. E.g. `- `.
 *
 * @defaultValue '- '
 */
export const blockMarkerFacet = Facet.define<string, string>({
  combine: (values) => (values.length ? values[0] : "- "),
});
