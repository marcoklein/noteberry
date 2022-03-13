# Block-based Notes Parser

Parse block-based Markdown content into a concrete syntax tree to work with block based notes.

```md
- This is a Block
  - This is a child Block
  - Here is a another block
    with a multiple lines
```

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

```md
- Block
  no intend
```

will get

```md
- Block
  no intend
```
