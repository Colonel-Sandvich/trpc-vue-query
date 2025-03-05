import type { DehydratedState } from "@tanstack/vue-query";
import {
  QueryClient,
  VueQueryPlugin,
  dehydrate,
  hydrate,
} from "@tanstack/vue-query";

// Important that this plugin comes before the `02.clientPlugin` since that has this plugin as a dependency
export default defineNuxtPlugin((nuxt) => {
  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } },
  });

  nuxt.vueApp.use(VueQueryPlugin, { queryClient });

  // Below is for SSR. Remove if you don't need this
  // Provided from TanStack Query docs: https://tanstack.com/query/v5/docs/vue/guides/ssr
  const vueQueryState = useState<DehydratedState | null>("vue-query");

  if (import.meta.server) {
    nuxt.hooks.hook("app:rendered", () => {
      vueQueryState.value = dehydrate(queryClient);
    });
  }

  if (import.meta.client) {
    nuxt.hooks.hook("app:created", () => {
      hydrate(queryClient, vueQueryState.value);
    });
  }
});
