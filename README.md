# trpc-vue-query

A simple package to bridge the gap between [TRPC](https://trpc.io/) and [TanStack Query for Vue](https://tanstack.com/query/v5/docs/vue/overview) much like how TRPC has their own in-house [React Query Integration](https://trpc.io/docs/client/react)

## Install

`pnpm i @colonel-sandvich/trpc-vue-query`

## Setup (Vue)

### 1. Plug in the plugin

```ts
// main.ts
import { TrpcVueQueryPlugin } from "@colonel-sandvich/trpc-vue-query";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { httpBatchLink } from "@trpc/client";
import { createApp } from "vue";
import App from "./src/App.vue";

export const app = createApp(App);

app
  .use(VueQueryPlugin) // Make sure {@tanstack/vue-query}'s plugin goes first
  .use(TrpcVueQueryPlugin, {
    trpcClient: {
      // See trpc.io docs for your options here
      links: [
        httpBatchLink({
          url: "http://localhost:3000",
        }),
      ],
    },
  })
  .mount("#app");
```

### 2. Make a composable

```ts
// src/composables/useClient.ts
import { TrpcVueClient, clientKey } from "@colonel-sandvich/trpc-vue-query";
import { inject } from "vue";
import type { AppRouter } from "your-path-to-trpc-app-router-type";

export function useClient() {
  return inject(clientKey) as TrpcVueClient<AppRouter>;
}
```

## Setup (Nuxt)

### 0. Setup `@tanstack/vue-query` for Nuxt if you haven't already

```ts
// src/plugins/01.vueQueryPlugin.ts

// Important that this plugin comes before the `02.clientPlugin` since that has this plugin as a dependency
export default defineNuxtPlugin((nuxt) => {
  nuxt.vueApp.use(VueQueryPlugin);

  // Below is for SSR. Remove if you don't need this
  // Provided from TanStack Query docs: https://tanstack.com/query/v5/docs/vue/guides/ssr
  const vueQueryState = useState<DehydratedState | null>("vue-query");

  if (process.server) {
    nuxt.hooks.hook("app:rendered", () => {
      vueQueryState.value = dehydrate(queryClient);
    });
  }

  if (process.client) {
    nuxt.hooks.hook("app:created", () => {
      hydrate(queryClient, vueQueryState.value);
    });
  }
});
```

### 1. Make a plugin

```ts
// src/plugins/02.clientPlugin.ts

export default defineNuxtPlugin(() => {
  const client = createTrpcVueClient<AppRouter>(
    {
      links: [
        httpBatchLink({
          url: "/api/trpc",
          headers: () => useRequestHeaders(),
          fetch: customFetchWrapper(), // Crucial for SSR
        }),
      ],
    },
    useQueryClient(),
  );

  return {
    provide: {
      client,
    },
  };
});
```

### 2. Make a composable

```ts
// src/composables/useClient.ts

export const useClient = () => {
  return useNuxtApp().$client;
};
```

### You're Done!

Go check out `/examples` to see some basic uses.

## Quickstart for testing `examples/vue-minimal`

`pnpm i` Anywhere

`cd examples/vue-minimal`

`pnpm dev`

If ports 5173 (client) and 3000 (server) are available then you should up and running

## Goals of the project

- [x] Easier integration with Vue and Nuxt
- [ ] Feature parity with TRPC's React Query (or at least as much as is possible with Vue Query)
  - [ ] Subscriptions
- [ ] Documentation

## Contributing

Please please please absolutely make an issue or PR for any bugs or feature requests, I highly encourage it.

## Acknowledgments

Big thanks to [Robert Soriano](https://github.com/wobsoriano) for his [trpc-nuxt](https://github.com/wobsoriano/trpc-nuxt) package that inspired this package.
