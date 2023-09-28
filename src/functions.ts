import {
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryClient,
  UseMutationOptions,
  UseMutationReturnType,
  UseQueryOptions,
  UseQueryReturnType,
  useMutation as vueUseMutation,
  useQuery as vueUseQuery,
} from "@tanstack/vue-query";
import {
  DeepUnwrapRef,
  MaybeRef,
  MaybeRefDeep,
} from "@tanstack/vue-query/build/modern/types";
import {
  TRPCClientErrorLike,
  TRPCRequestOptions as TRPCRequestOptionsInternal,
  inferRouterProxyClient,
} from "@trpc/client";
import {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  inferProcedureInput,
} from "@trpc/server";
import { inferTransformedProcedureOutput } from "@trpc/server/shared";
import { TRPCQueryKey, getQueryKeyInternal } from "./helpers";
import { cloneDeepUnref } from "./utils";

export function createAugmentedClient<TRouter extends AnyRouter>(
  trpcClient: inferRouterProxyClient<TRouter>,
  queryClient: QueryClient,
) {
  const useQuery = useQueryInternal.bind({ trpcClient });
  const useMutation = useMutationInternal.bind({ trpcClient });
  const invalidate = invalidateInternal.bind({ queryClient });

  return {
    useQuery,
    useMutation,
    invalidate,
    queryKey: queryKeyInternal,
  };
}

type TRPCRequestOptions = {
  trpc?: TRPCRequestOptionsInternal;
};

type Input<TProcedure extends AnyProcedure> = MaybeRefDeep<
  inferProcedureInput<TProcedure>
>;

type UseQueryTRPCOptions<TData> = UseQueryOptions<TData> & TRPCRequestOptions;

function useQueryInternal<
  TProcedure extends AnyQueryProcedure,
  TData = inferTransformedProcedureOutput<TProcedure>,
>(
  this: { trpcClient: any },
  path: string,
  input: Input<TProcedure>,
  opts?: UseQueryTRPCOptions<TData>,
): UseQueryReturnType<TData, TRPCClientErrorLike<TProcedure>> {
  const trpc = opts?.trpc;

  const queryKey = getQueryKeyInternal([path], input, "query");

  const query = vueUseQuery<TData, TRPCClientErrorLike<TProcedure>>({
    queryKey,
    queryFn: () => this.trpcClient[path].query(cloneDeepUnref(input), trpc),
    ...(opts as any),
  });

  return query;
}

export type UseQuery<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof useQueryInternal<TProcedure>
>;

type UseMutationTRPCOptions<TData> = UseMutationOptions<TData> &
  TRPCRequestOptions;

function useMutationInternal<
  TProcedure extends AnyMutationProcedure,
  TData = inferTransformedProcedureOutput<TProcedure>,
  TError = TRPCClientErrorLike<TProcedure>,
  TVariables = inferProcedureInput<TProcedure>,
  TContext = unknown,
>(
  this: { trpcClient: any },
  path: string,
  opts?: UseMutationTRPCOptions<TData>,
): UseMutationReturnType<TData, TError, TVariables, TContext> {
  const trpc = opts?.trpc;

  const query = vueUseMutation<TData, TError, TVariables, TContext>({
    mutationFn: (input) => this.trpcClient[path].mutate(input, trpc),
    ...(opts as any),
  });

  return query;
}

export type UseMutation<TProcedure extends AnyMutationProcedure> = StripPath<
  typeof useMutationInternal<TProcedure>
>;

async function invalidateInternal<TProcedure extends AnyQueryProcedure>(
  this: { queryClient: QueryClient },
  path: string,
  input?: Input<TProcedure>,
  filters?: InvalidateQueryFilters,
  opts?: InvalidateOptions,
): Promise<void> {
  const queryKey = getQueryKeyInternal([path], input, "query");

  await this.queryClient.invalidateQueries({ ...filters, queryKey }, opts);
}

export type Invalidate<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof invalidateInternal<TProcedure>
>;

function queryKeyInternal<TProcedure extends AnyQueryProcedure>(
  path: string,
  input: Input<TProcedure>,
): TRPCQueryKey {
  return getQueryKeyInternal([path], input, "query");
}

export type QueryKey<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof queryKeyInternal<TProcedure>
>;

type StripPath<T> = T extends (path: any, ...args: infer A) => infer R
  ? (...args: PrettifyList<A>) => R
  : never;

type PrettifyList<T extends any[]> = [...{ [P in keyof T]: Prettify<T[P]> }];

type Prettify<T> = T extends MaybeRef<void | undefined>
  ? void | undefined
  : T extends MaybeRefDeep<infer L>
  ? MaybeRefDeep<PrettifyShallow<DeepUnwrapRef<L>>>
  : PrettifyShallow<T>;

type PrettifyShallow<T> = {
  [K in keyof T]: T[K];
} & {};
