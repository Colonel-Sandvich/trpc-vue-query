import {
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryClient,
} from "@tanstack/vue-query";
import { CreateTRPCClientOptions, createTRPCProxyClient } from "@trpc/client";
import {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  ProcedureRouterRecord,
} from "@trpc/server";
import { createFlatProxy, createRecursiveProxy } from "@trpc/server/shared";
import {
  Invalidate,
  QueryKey,
  UseMutation,
  UseQuery,
  createAugmentedClient,
} from "./functions.ts";

type DecorateProcedure<TProcedure extends AnyProcedure> =
  TProcedure extends AnyQueryProcedure
    ? {
        useQuery: UseQuery<TProcedure>;
        invalidate: Invalidate<TProcedure>;
        queryKey: QueryKey<TProcedure>;
      }
    : TProcedure extends AnyMutationProcedure
    ? {
        useMutation: UseMutation<TProcedure>;
        mutationKey: QueryKey<TProcedure>;
      }
    : never;

type DecoratedProcedureRecord<TProcedures extends ProcedureRouterRecord> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? DecoratedProcedureRecord<TProcedures[TKey]["_def"]["record"]> &
        DecorateRouter
    : TProcedures[TKey] extends AnyProcedure
    ? DecorateProcedure<TProcedures[TKey]>
    : never;
};

type DecorateRouter = {
  invalidate(
    input?: undefined,
    filters?: InvalidateQueryFilters,
    options?: InvalidateOptions,
  ): Promise<void>;
};

/**
 * Lots of generic magic to get the error to show.
 */
export function createTrpcVueClient<
  TRouter = void,
  Fallback extends AnyRouter = TRouter extends AnyRouter ? TRouter : AnyRouter,
>(
  opts: TRouter extends void
    ? "Missing AppRouter generic. Refer to the docs: https://trpc.io/docs/client/vanilla/setup#3-initialize-the-trpc-client"
    : CreateTRPCClientOptions<Fallback>,
  queryClient: QueryClient,
): DecoratedProcedureRecord<Fallback["_def"]["record"]> {
  const client = createTRPCProxyClient<Fallback>(
    opts as CreateTRPCClientOptions<Fallback>,
  );

  const augmentedClient = createAugmentedClient(client, queryClient);

  return createFlatProxy((key) => {
    return createClientProxyDecoration(key, augmentedClient);
  });
}

function createClientProxyDecoration(
  name: string,
  client: ReturnType<typeof createAugmentedClient>,
) {
  return createRecursiveProxy((opts) => {
    const args = opts.args;

    const pathCopy = [name, ...opts.path];

    // The last arg is `.useQuery()` or `.useMutation()` etc.
    const lastArg = pathCopy.pop()! as keyof typeof client;

    // The `path` ends up being something like `post.byId`
    const path = pathCopy.join(".");

    return (client[lastArg] as Function)(path, ...args);
  });
}
