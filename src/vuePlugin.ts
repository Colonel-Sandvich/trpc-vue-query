import { QueryClient, VUE_QUERY_CLIENT } from "@tanstack/vue-query";
import type { TRPCClient } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";
import type { App } from "vue";
import { createTrpcVueClient } from "./client.ts";

export const clientKey = Symbol();

export type Options = {
  trpcClient: TRPCClient<AnyTRPCRouter>;
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

  const client = createTrpcVueClient(options.trpcClient, queryClient);

  app.provide(clientKey, client);
}
