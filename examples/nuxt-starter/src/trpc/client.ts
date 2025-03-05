import { customFetchWrapper } from "@colonel-sandvich/trpc-vue-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "~/server/routers";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch: customFetchWrapper(),
    }),
  ],
});
