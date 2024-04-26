import { customFetchWrapper } from "@colonel-sandvich/trpc-vue-query";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "~/server/routers";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch: customFetchWrapper(),
    }),
  ],
});
