import {
  useQueryClient,
  type InvalidateOptions,
  type InvalidateQueryFilters,
  type QueryClient,
} from "@tanstack/vue-query";
import type { CreateTRPCProxyClient } from "@trpc/client";
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  ProcedureRouterRecord,
} from "@trpc/server";
import { createFlatProxy, createRecursiveProxy } from "@trpc/server/shared";
import type {
  GetQueryData,
  Invalidate,
  PrefetchQuery,
  QueryKey,
  SetQueryData,
  UseMutation,
  UseQuery,
} from "./functions.ts";
import { createAugmentedClient } from "./functions.ts";

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

type DecoratedProcedureRecord<TProcedures extends ProcedureRouterRecord> =
  DecorateRouter & {
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
  $client: CreateTRPCProxyClient<TRouter>;
};

export function createTrpcVueClient<TRouter extends AnyRouter>(
  trpcClient: CreateTRPCProxyClient<TRouter>,
  queryClient?: QueryClient,
): TrpcVueClient<TRouter> {
  const augmentedClient = createAugmentedClient(
    trpcClient,
    queryClient ?? useQueryClient(),
  );

  return createFlatProxy((key) => {
    if (key === "$client") {
      return trpcClient;
    }
    return createRecursiveProxy(({ path, args }) => {
      const pathCopy = [key, ...path];

      // The last arg is `.useQuery()` or `.useMutation()` etc.
      const lastArg = pathCopy.pop()! as keyof typeof augmentedClient;

      return (augmentedClient[lastArg] as Function)(pathCopy, ...args);
    });
  });
}
