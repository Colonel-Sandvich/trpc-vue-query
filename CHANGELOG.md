# trpc-vue-query

## 0.2.0

### Minor Changes

- 100b63e: Rename `createTRPCVueClient` -> `createTrpcVueClient`
  Add `createNuxtApiHandler`, `createH3ApiHandler` (alias) to correctly capture tRPC client calls in nuxt/h3
  Add `customFetchWrapper` so Nuxt users can have correctly working SSR when using tRPC
  Fix various types surrounding `useMutation`

## 0.1.0

### Minor Changes

- 3db2ccd: Add router level invalidation
  Add `mutationKey` getter function
  Cleanup function argument types
  Get `initialData` working without function overloads
  Add TS declaration maps

## 0.0.1

### Patch Changes

- 9e6da03: Initial Publish
