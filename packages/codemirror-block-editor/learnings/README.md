## Learnings

There are several stages I went through while implementing the block indentation. They are all listed in this folder.

### 1

- getting started with CodeMirror 6
- implement a basic line decoration

### 2

- add some keymap to work with indentation

### 3

- implement more intelligent indentation logic
- huge problem: cursor did not refresh when the line indentation (with `padding-left`) changed

### 4

- implement block levels in the editor
- logic to override individual file changes
- several very complicated re-writes
- did not get me closer to what the project should do

### 5

- block levels base on the `padding-left` approach
- fixed the cursor refresh issue form `3`rd approach
- however, when copying or deleting the line the indentation got lost
- it might be possible to modify to text when copying it into the clipboard
- therefore, it might be the simplest solution to work with `spaces` or `tabs` as indentation and overwrite them with decorations
