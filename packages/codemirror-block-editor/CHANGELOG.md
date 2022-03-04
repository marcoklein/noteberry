# Changelog

## Unreleased

- Disable `Tab+ESC` escape hatch for vim compatibility
- Improve testing pipeline by properly integrating the Karma runner

## 0.6.0

- Writing events of block level changes to website
- Link to open source page with GitHub badge

## 0.5.0

- Using [Karma Spec Reporter](https://www.npmjs.com/package/karma-spec-reporter) for better summaries of tests
- Moving cursor out of block level indentation
- Keep block indentation at certain level
- Move `playground` to `learnings` folder

## 0.4.0

- Refactor underlying architecture to use text as the basis for block level rendering
- Support history
- Handle line deletions
- Execute unit tests in browser with Karma

## 0.3.0

- Using the `padding-start` approach again
- Fixed bug that prevented a cursor refresh
- Improved stability of block level changes
- Write event notifications on screen
- Add level indentation marker (circle)

## 0.2.0

- Move selection out of block level indentation
- Decoration of block level indentations
- Using transaction filters with new indentation approach
- Handle character changes

## 0.1.0

- Basic indentation with Tab and Shift-Tab
- Increase and decrease levels of lines
- Increase block level with constraints
- Initial version
