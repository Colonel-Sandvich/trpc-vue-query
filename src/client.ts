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
  PrefetchQuery,
  QueryKey,
  SetQueryData,
  UseMutation,
  UseQuery,
  createAugmentedClient,
} from "./functions.ts";
import { isPlainObject } from "./utils.ts";

type DecorateProcedure<TProcedure extends AnyProcedure> =
  TProcedure extends AnyQueryProcedure
    ? {
        useQuery: UseQuery<TProcedure>;
        useSuspenseQuery: UseQuery<TProcedure>;
        invalidate: Invalidate<TProcedure>;
        queryKey: QueryKey<TProcedure>;
        getQueryData: GetQueryData<TProcedure>;
        setQueryData: SetQueryData<TProcedure>;
        prefetchQuery: PrefetchQuery<TProcedure>;
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

export type TrpcVueClient<TRouter extends AnyRouter> = DecoratedProcedureRecord<
  TRouter["_def"]["record"]
> & {
  client: CreateTRPCProxyClient<TRouter>;
};

export function createTrpcVueClient<TRouter extends AnyRouter>(
  opts: CreateTRPCClientOptions<TRouter> | CreateTRPCProxyClient<TRouter>,
  queryClient: QueryClient,
): TrpcVueClient<TRouter> {
  const client = isPlainObject(opts)
    ? createTRPCProxyClient(opts as CreateTRPCClientOptions<TRouter>)
    : (opts as CreateTRPCProxyClient<TRouter>);

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

      return (augmentedClient[lastArg] as Function)(path, ...args);
    });
  });
}
