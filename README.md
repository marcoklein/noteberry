# Noteberry

A toolbox for working with block-based linked markdown notes.

> Noteberry enables developers to easily and effortless create tools and applications that use block-based linked markdown notes.

# Development

See how to develop individual modules in the `packages` folder.

## Prerequisite

1. Clone this repository
1. [Installation of NodeJS](https://nodejs.org/en/)
1. Install `yarn`: `npm -g yarn`

## Getting started

Install dependencies

```bash
yarn install
```

## Continuous Deployments

Every push to master triggers an automatic deployment of the noteberry documentation (docs). This includes all demos for packages and the landing page.

Run a manual deployment with

```bash
yarn deploy:docs
```
