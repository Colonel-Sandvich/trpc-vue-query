import {
  createTrpcVueClient,
  customFetchWrapper,
} from "@colonel-sandvich/trpc-vue-query";
import { useQueryClient } from "@tanstack/vue-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/routers";

export default defineNuxtPlugin(() => {
  const client = createTrpcVueClient<AppRouter>(
    {
      links: [
        httpBatchLink({
          url: "/api/trpc",
          headers: useRequestHeaders(),
          fetch: customFetchWrapper(),
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
