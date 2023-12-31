# trpc-vue-query

A simple package to bridge the gap between [TRPC](https://trpc.io/) and [TanStack Query for Vue](https://tanstack.com/query/v5/docs/vue/overview) much like how TRPC has their own in-house [React Query Integration](https://trpc.io/docs/client/react)

## Install

`pnpm i @colonel-sandvich/trpc-vue-query`

And then refer to the `vue-minimal` example to see how to set up the client

## Quickstart for testing `examples/vue-minimal`

`pnpm i` Anywhere

`cd examples/vue-minimal`

`pnpm dev`

If ports 5173 (client) and 3000 (server) are available then you should up and running

## Goals of the project

- [ ] Feature parity with TRPC's React Query (or at least as much as is possible with Vue Query)
- [ ] Documentation
- [ ] SSR support
- [ ] Easier integration with Vue and Nuxt

## Contributing

Please please please absolutely make an issue or PR for any bugs or feature requests, I highly encourage it.
