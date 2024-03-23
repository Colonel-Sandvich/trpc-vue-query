# trpc-vue-query

## 0.6.1

### Patch Changes

- 229af1f: Fix prefetchQuery options

## 0.6.0

### Minor Changes

- f321b9e: Add `useSuspenseQuery`, `prefetchQuery`
  Reduce dependency on `cloneDeepUnref`

## 0.5.0

### Minor Changes

- 6e14e3a: Create vue plugin
  Update docs
  Clean up /examples

## 0.4.1

### Patch Changes

- 7f7cb41: (fix): Make options argument of `useMutation` optional

## 0.4.0

### Minor Changes

- 45a71c8: Add {get/set}QueryData functions

## 0.3.0

### Minor Changes

- 5b58cdd: Add traditional trpc client at key: "client"

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
