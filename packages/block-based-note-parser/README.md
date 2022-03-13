# Block-based Note Parser

Handling hierarchal blocks of text content.

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

```
- Block
no intend
```

will get

```md
- Block
  no intend
```
