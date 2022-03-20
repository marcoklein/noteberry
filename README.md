# Noteberry

A toolbox for working with block-based linked markdown notes.

> Noteberry enables developers to easily and effortlessly create tools and applications that use block-based linked markdown notes.

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

## Testing

Packages usually have unit and component tests. Unit tests address the smallest unit and also live in the `src` folder of a project with the `.test.ts` extension.

The `tests` folder holds component tests that test a larger function of the package. This folder might also include test resources and more complex testing scenarios that would pollute the `src` folder.

## Continuous Deployments

Every push to master triggers an automatic deployment of the noteberry documentation (docs). This includes all demos for packages and the landing page.

Run a manual deployment with

```bash
yarn deploy:docs
```
