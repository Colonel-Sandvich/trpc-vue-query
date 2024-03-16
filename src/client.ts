import {
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryClient,
} from "@tanstack/vue-query";
import {
  CreateTRPCClientOptions,
  CreateTRPCProxyClient,
  createTRPCProxyClient,
} from "@trpc/client";
import {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  ProcedureRouterRecord,
} from "@trpc/server";
import { createFlatProxy, createRecursiveProxy } from "@trpc/server/shared";
import {
  GetQueryData,
  Invalidate,
  QueryKey,
  SetQueryData,
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
        getQueryData: GetQueryData<TProcedure>;
        setQueryData: SetQueryData<TProcedure>;
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

type TrpcVueClient<TRouter extends AnyRouter> = DecoratedProcedureRecord<
  TRouter["_def"]["record"]
> & {
  client: CreateTRPCProxyClient<TRouter>;
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
): TrpcVueClient<Fallback> {
  const client = createTRPCProxyClient<Fallback>(
    opts as CreateTRPCClientOptions<Fallback>,
  );

  const augmentedClient = createAugmentedClient(client, queryClient);

  return createFlatProxy((key) => {
    if (key === "client") {
      return client;
    }
    return createRecursiveProxy((opts) => {
      const args = opts.args;

      const pathCopy = [key, ...opts.path];

      // The last arg is `.useQuery()` or `.useMutation()` etc.
      const lastArg = pathCopy.pop()! as keyof typeof augmentedClient;

      // The `path` ends up being something like `post.byId`
      const path = pathCopy.join(".");

      return (augmentedClient as any)[lastArg](path, ...args);
    });
  });
}
