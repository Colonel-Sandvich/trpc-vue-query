import { QueryClient, VUE_QUERY_CLIENT } from "@tanstack/vue-query";
import { CreateTRPCClientOptions, CreateTRPCProxyClient } from "@trpc/client";
import { AnyRouter } from "@trpc/server";
import { App } from "vue-demi";
import { createTrpcVueClient } from "./client.ts";

export const clientKey = Symbol();

type Options = {
  trpcClient:
    | CreateTRPCClientOptions<AnyRouter>
    | CreateTRPCProxyClient<AnyRouter>;
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
