# Block-based Note Parser

Handling hierarchal blocks of text content.
Using the [unist syntax tree](https://github.com/syntax-tree/unist) specification.

```md
- This is a Block
  - This is a child Block
  - Here is a another block
    with a multiple lines
```

## Usage

Use as a preprocessor like

```ts
import { parseBlocks } from "block-based-note-parser";

const content = "- My Note";

const result = parseBlocks(content);

console.log(result);
```

## Why?

Networked and block-based note taking applications like RoamResearch or LogSeq are on the rise. However, there is no easy library that you could use and integrate into custom applications. Therefore, this small library should help with parsing text into a block-based format.

## Design

### "Everything is a block"

```
Pre lines
- Block
```

will get

```md
- Pre lines
- Block
```

And

```
- Block
no intend
```

will get

```md
- Block
  no intend
```

# Development

Run tests

```bash
yarn test
```

Run tests in watch mode

```bash
yarn test:watch
```

Release with

```bash
yarn release
```
