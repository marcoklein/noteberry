# CodeMirror Block Editor Extension

Creating indented list of blocks in [CodeMirror6](https://codemirror.net/6/).

[Demo](https://marcoklein.github.io/codemirror-block-editor/)

## Installation

Install via NPM

```sh
npm install codemirror-block-editor
```

or yarn

```sh
yarn add codemirror-block-editor
```

## Usage

Import the `blockEditor` extension and list it in the CodeMirror state `extensions` configuration:

```ts
import { basicSetup } from "@codemirror/basic-setup";
import { blockEditor } from "codemirror-block-editor";

const initialState = EditorState.create({
  doc: "- Indent block with Tab",
  extensions: [blockEditor(), basicSetup],
});
new EditorView({
  state: initialState,
});
```

# Development

## Prerequisite

1. Clone this repository
1. [Installation of NodeJS](https://nodejs.org/en/)
1. Install `yarn`: `npm -g yarn`

## Getting started

Install dependencies

```bash
yarn install
```

Run the demo website

```bash
yarn start
```

## Building the demo

Build demo source

```bash
yarn build:demo
```

> It is not possible to omit the package.json main field in the parcel CLI. As a fix to build tests the package.json is renamed to package.json.tmp for the build. See [here](https://parceljs.org/getting-started/library/) for more information.

Deploy demo website on GitHub Pages

```bash
yarn deploy
```

## Testing

Run tests with

```bash
yarn test
```

For running tests on change use

```bash
yarn test:watch
```

> Currently, the testing approach is very basic. Parcel builds `*.test.ts` files and karma picks up build files to run tests. Therefore, there is no direct mapping to the TypeScript source. This is due to the complicated setup with ESM modules.

> Additionally, it is not possible to omit the package.json main field in the parcel CLI. As a fix to build tests the package.json is renamed to package.json.tmp for the build. See [here](https://parceljs.org/getting-started/library/) for more information.

## Releasing

Update the `CHANGELOG.md` and bump the version in `package.json`.

To release a package with the version listed in `package.json` run:

```sh
yarn release
```

## Approach

### Implementation

Handle only text changes to stay compatible with the VIM plugin and Codemirror text history. This means, if you want to indent a block you insert two spaces to the start of the line. That is how the VIM plugin would do it with the `>` key in visual mode.

Raw text is parsed and decorations replace the `- ` string with a visual dot. Therefore, if you copy text text underlying text get copied which is very easy to handle.

Custom implementation builds on the auto indentation of blocks and the deletion of blocks when the user deletes a character from the block indentation.

### Limiting interactions by limiting selections

Selection is limited to the block content only:

```sh
- blockA1
  |<--->| # selection range (inclusive)
```

Any selection in the _Block Marker_ is placed to the start of the block.

To increase or decrease a block level the extension adds or removes whitespace from the start of a line.

### Naming

- **Block**: Section that may span multiple lines.
- **Block Indentation**: Number of characters (including the _block marker_) before the actual _line content_ starts.
- **Indentation per Level**: Number of characters that indicate one level. This is the length of a _block marker_ to keep _block indentation_ consistent throughout all _block lines_.
- **Block Level**: Depth of an individual block. It is the _block indentation_ divided by the _indentation per level_.
- **Block Marker**: Text that indicates a block. E.g. `- `.
- **Block Line**: Any line within a block.
- **Root Block Line**: Starting line of a block.
- **Child Block Line**: Lines that precede the _Root Block Line_.
- **Line Content**: The text of a line.
- **Block Content**: All text lines of a block. E.g. the sum of all _line contents_.

### Block Level Depth

### Rendering Block Content

The `setBlockContentViewFacet` sets a function to listen for block contents that shall be rendered.

Only lines blocks that have no focus render. A block with focus shows its original text to allow seamless editing of the underlying text content.

## Learnings

There are several learnings I documented in the [learnings folder](./learnings/README.md)
