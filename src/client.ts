import {
  useQueryClient,
  type InvalidateOptions,
  type InvalidateQueryFilters,
  type QueryClient,
} from "@tanstack/vue-query";
import type { TRPCClient } from "@trpc/client";
import type {
  AnyTRPCProcedure,
  AnyTRPCRootTypes,
  AnyTRPCRouter,
  inferProcedureInput,
  inferTransformedProcedureOutput,
  TRPCProcedureType,
} from "@trpc/server";
import { createTRPCFlatProxy, createTRPCRecursiveProxy } from "@trpc/server";

import type { RouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { ResolverDef } from "src/typeUtils.ts";
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

type DecorateProcedure<
  TType extends TRPCProcedureType,
  TDef extends ResolverDef,
> = TType extends "query"
  ? {
      useQuery: UseQuery<TDef>;
      useSuspenseQuery: UseQuery<TDef>;
      invalidate: Invalidate<TDef>;
      queryKey: QueryKey<TDef>;
      getQueryData: GetQueryData<TDef>;
      setQueryData: SetQueryData<TDef>;
      prefetchQuery: PrefetchQuery<TDef>;
    }
  : TType extends "mutation"
    ? {
        useMutation: UseMutation<TDef>;
        mutationKey: QueryKey<TDef>;
      }
    : never;

type DecorateRouter = {
  invalidate(
    filters?: InvalidateQueryFilters,
    options?: InvalidateOptions,
  ): Promise<void>;
};

type DecorateRouterRecord<
  TRoot extends AnyTRPCRootTypes,
  TRecord extends RouterRecord,
> = DecorateRouter & {
  [TKey in keyof TRecord]: TRecord[TKey] extends infer $Value
    ? $Value extends RouterRecord
      ? DecorateRouterRecord<TRoot, $Value>
      : $Value extends AnyTRPCProcedure
        ? DecorateProcedure<
            $Value["_def"]["type"],
            {
              input: inferProcedureInput<$Value>;
              output: inferTransformedProcedureOutput<TRoot, $Value>;
              transformer: TRoot["transformer"];
              errorShape: TRoot["errorShape"];
            }
          > &
            DecorateRouter
        : never
    : never;
};

export type TrpcVueClient<TRouter extends AnyTRPCRouter> = DecorateRouterRecord<
  TRouter["_def"]["_config"]["$types"],
  TRouter["_def"]["record"]
> & {
  $client: TRPCClient<TRouter>;
};

export function createTrpcVueClient<TRouter extends AnyTRPCRouter>(
  trpcClient: TRPCClient<TRouter>,
  queryClient?: QueryClient,
): TrpcVueClient<TRouter> {
  const augmentedClient = createAugmentedClient(
    trpcClient,
    queryClient ?? useQueryClient(),
  );

  return createTRPCFlatProxy((key) => {
    if (key === "$client") {
      return trpcClient;
    }
    return createTRPCRecursiveProxy(({ path, args }) => {
      const pathCopy = [key, ...path];

      // The last arg is `.useQuery()` or `.useMutation()` etc.
      const lastArg = pathCopy.pop()! as keyof typeof augmentedClient;

      return (augmentedClient[lastArg] as Function)(pathCopy, ...args);
    });
  });
}
