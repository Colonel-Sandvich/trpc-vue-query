import { QueryClient, VUE_QUERY_CLIENT } from "@tanstack/vue-query";
import type { inferRouterProxyClient } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import type { App } from "vue-demi";
import { createTrpcVueClient } from "./client.ts";

export const clientKey = Symbol();

export type Options = {
  trpcClient: inferRouterProxyClient<AnyRouter>;
  queryClient?: QueryClient;
};

export function TrpcVueQueryPlugin(app: App, options: Options) {
  const queryClient =
    options.queryClient ??
    (app._context.provides[VUE_QUERY_CLIENT] as QueryClient | undefined);

  if (!queryClient) {
    throw new Error(
      "Failed to get tanstack query client, did you setup the plugin?",
    );
  }

  // @ts-expect-error
  const client = createTrpcVueClient(options.trpcClient, queryClient);

  app.provide(clientKey, client);
}
