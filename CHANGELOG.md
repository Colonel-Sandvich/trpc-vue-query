# trpc-vue-query

## 0.8.0

### Minor Changes

- 88085d1: # Breaking changes

  You must now use install "@trpc/client": "11.0.0-rc.824" and "@trpc/server": "11.0.0-rc.824". There is possible breaking changes between every trpc release, and this version of the package is built against this version.

  Requires typescript@^5.8.2.

  # Features

  Added ability to use `skipToken` directly. Refer to [examples/vue-playground/client/src/skipToken.vue](examples/vue-playground/client/src/skipToken.vue)

## 0.7.0

### Minor Changes

- c95a356: # Breaking

  - Users must now make the trpc proxy instance themselves and pass it to us when creating the augmented client. This is just simpler for the library to handle and most will already have this trpc instance lying around.

  # Improvements

  - Improved query invalidation and key generation

  # Other

  - Changed how we handle query keys internally

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
