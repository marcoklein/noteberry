# Deployment Docs

Builds docs for all packages and bootstraps them into a single web page for publishing.

Calls `build:docs` for all packages and collects their `dist-docs` folders.

## Getting started

Start with

```bash
yarn start
```

Build with

```bash
yarn build
```

Run an http server on the dist folder to see the final output

```bash
npx http-server dist
```
