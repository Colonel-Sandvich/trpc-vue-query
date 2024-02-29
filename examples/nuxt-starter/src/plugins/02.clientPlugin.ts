import {
  createTrpcVueClient,
  customFetchWrapper,
} from "@colonel-sandvich/trpc-vue-query";
import { useQueryClient } from "@tanstack/vue-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/routers";

export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders();

  const queryClient = useQueryClient();

  const client = createTrpcVueClient<AppRouter>(
    {
      links: [
        httpBatchLink({
          url: "/api/trpc",
          headers() {
            return headers;
          },
          fetch: customFetchWrapper($fetch),
        }),
      ],
    },
    queryClient,
  );

  return {
    provide: {
      client,
    },
  };
});
