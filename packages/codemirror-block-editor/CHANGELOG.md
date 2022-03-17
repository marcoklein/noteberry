# Changelog

## Unreleased

- Disable `Tab+ESC` escape hatch for vim compatibility

## 0.9.0

- Adding a view plugin to replace text with HTML nodes

## 0.8.0

- Setting the block marker in facet
- Fix demo by upgrading dependencies

## 0.7.7

- Fixing git tagging

## 0.7.6

- Manual git tagging

## 0.7.5

- Add Git Tag on release
- Use newDoc in transaction

## 0.7.4

- Setting registry url in CI to point to npm registry

## 0.7.3

- Add script to check for NPM registry version
- Update Deployment scripts for CI

## 0.7.2

- Fix export of module that prevented library build
- Add prepare script to always run tests and build on publish
- Fix build script for demo

## 0.7.1

- Add descriptions to package json for NPM registry

## 0.7.0

- Rename project to `codemirror-block-editor`
- Building TypeScript definitions and TypeScript library
- Adjust test build script
- Add release script
- Exposing extension, listener, and effects

## 0.6.0

- Writing events of block level changes to website
- Link to open source page with GitHub badge
- Move demo into separate folder
- Add a view plugin to style `[[wikilinks]]`

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
