import type {
  DataTag,
  InvalidateOptions,
  InvalidateQueryFilters,
  MutationObserverResult,
  MutationOptions,
  NoInfer,
  QueryClient,
  SetDataOptions,
  Updater,
  UseMutationReturnType,
  FetchQueryOptions as VueFetchQueryOptions,
} from "@tanstack/vue-query";
import {
  useMutation as vueUseMutation,
  useQuery as vueUseQuery,
} from "@tanstack/vue-query";
import type { CreateTRPCProxyClient } from "@trpc/client";
import { TRPCUntypedClient } from "@trpc/client";
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  inferProcedureInput,
} from "@trpc/server";
import type { MaybeRef, UnwrapRef } from "vue-demi";
import { onServerPrefetch, unref } from "vue-demi";
import type { QueryType, TRPCQueryKey } from "./helpers.ts";
import { getQueryKeyInternal, pathToString } from "./helpers.ts";
import type {
  DeepPartialInput,
  DistributiveOmit,
  FunctionOverloadToUnion,
  Input,
  MaybeRefDeep,
  Output,
  StripPath,
  TrpcError,
  TrpcRequestOptions,
  UnionToIntersection,
} from "./typeUtils.ts";
import { cloneDeepUnref, maybeReactiveToRefs } from "./utils.ts";

export function createAugmentedClient<TRouter extends AnyRouter>(
  trpcProxyClient: CreateTRPCProxyClient<TRouter>,
  queryClient: QueryClient,
) {
  const trpcClient =
    trpcProxyClient.__untypedClient as TRPCUntypedClient<TRouter>;
  const useQuery = useQueryInternal.bind({ trpcClient });
  const useMutation = useMutationInternal.bind({ trpcClient });
  const invalidate = invalidateInternal.bind({ queryClient });
  const getQueryData = getQueryDataInternal.bind({ queryClient });
  const setQueryData = setQueryDataInternal.bind({ queryClient });
  const prefetchQuery = prefetchQueryInternal.bind({ queryClient, trpcClient });

  const useSuspenseQuery = ((...args) => {
    const t = useQuery(...args);
    onServerPrefetch(t.suspense);
    return t;
  }) as typeof useQuery;

  return {
    useQuery,
    useSuspenseQuery,
    useMutation,
    invalidate,
    queryKey: queryKeyInternal,
    mutationKey: queryKeyInternal,
    getQueryData,
    setQueryData,
    prefetchQuery,
  } as const;
}

export type UseQuery<TProcedure extends AnyQueryProcedure> =
  UnionToIntersection<
    AddInputRemoveQueryClient<
      TProcedure,
      FunctionOverloadToUnion<
        typeof vueUseQuery<Output<TProcedure>, TrpcError<TProcedure>>
      >
    >
  >;

type AddInputRemoveQueryClient<
  TProcedure extends AnyQueryProcedure,
  FunctionOverloads,
> = FunctionOverloads extends (options: infer O, ...args: any) => infer R
  ? (input: Input<TProcedure>, options?: UnwrapRewrapOption<O>) => R
  : never;

type StripConflictKeys<T> = Omit<
  T,
  "queryKey" | "queryFn" | "queryHash" | "queryKeyHashFn"
>;

type StripAndAddTrpc<T> = StripConflictKeys<T> & TrpcRequestOptions;

// VueQuery incorrectly slaps { initialData: ...} on to the already MaybeRef'd UseQueryOptions
// So their types don't work with ref<{initialData: ...}> correctly.
type UnwrapRewrapOption<
  TOption,
  KeysRemoved = StripAndAddTrpc<UnwrapRef<TOption>>,
> = MaybeRef<
  TOption extends { initialData: infer D }
    ? KeysRemoved & { initialData: D }
    : TOption extends { initialData?: undefined }
      ? KeysRemoved & { initialData?: undefined }
      : KeysRemoved
>;

function useQueryInternal(
  this: { trpcClient: TRPCUntypedClient<AnyRouter> },
  path: Array<string>,
  input: any,
  opts?: any,
) {
  return vueUseQuery({
    queryKey: getQueryKeyInternal(path, input),
    queryFn: ({ queryKey, signal }) =>
      this.trpcClient.query(pathToString(path), queryKey[1]?.input, {
        context: opts?.trpc?.context,
        signal: opts?.trpc?.signal ?? signal,
      }),
    ...maybeReactiveToRefs(opts),
  });
}

export type UseMutation<
  TProcedure extends AnyMutationProcedure,
  TData = Output<TProcedure>,
  TError = TrpcError<TProcedure>,
  TVariables = Input<TProcedure>,
  TResult = MutationResult<TData, TError, inferProcedureInput<TProcedure>>,
> = (
  options?: MaybeRefDeep<
    CustomiseMutationOptionsKeys<MutationOptions<TData, TError, TVariables>>
  >,
) => UseMutationReturnType<TData, TError, TVariables, unknown, TResult>;

type CustomiseMutationOptionsKeys<O> = Omit<O, "mutationKey" | "mutationFn"> &
  TrpcRequestOptions;

type MutationResult<TData, TError, TVariables> = DistributiveOmit<
  MutationObserverResult<TData, TError, TVariables>,
  "mutate" | "reset"
>;

function useMutationInternal(
  this: { trpcClient: TRPCUntypedClient<AnyRouter> },
  path: Array<string>,
  opts?: any,
): any {
  return vueUseMutation({
    mutationKey: getQueryKeyInternal(path, undefined),
    mutationFn: (input: any) =>
      this.trpcClient.mutation(
        pathToString(path),
        cloneDeepUnref(input),
        opts?.trpc,
      ),
    ...opts,
  });
}

async function invalidateInternal<TProcedure extends AnyQueryProcedure>(
  this: { queryClient: QueryClient },
  path: Array<string>,
  input?: DeepPartialInput<TProcedure>,
  filters?: MaybeRefDeep<Omit<InvalidateQueryFilters, "queryKey">>,
  opts?: MaybeRefDeep<InvalidateOptions>,
): Promise<void> {
  const queryKey = getQueryKeyInternal(path, input);

  await this.queryClient.invalidateQueries(
    { ...unref(filters), queryKey },
    opts,
  );
}

export type Invalidate<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof invalidateInternal<TProcedure>
>;

function queryKeyInternal<TProcedure extends AnyProcedure>(
  path: Array<string>,
  input?: DeepPartialInput<TProcedure>,
  type?: QueryType,
): DataTag<TRPCQueryKey, Output<TProcedure>> {
  return getQueryKeyInternal(path, input, type) as any;
}

export type QueryKey<TProcedure extends AnyProcedure> = StripPath<
  typeof queryKeyInternal<TProcedure>
>;

function getQueryDataInternal<
  TProcedure extends AnyQueryProcedure,
  TData = Output<TProcedure>,
>(
  this: { queryClient: QueryClient },
  path: Array<string>,
  input: Input<TProcedure>,
  type?: QueryType,
): TData | undefined {
  return this.queryClient.getQueryData(getQueryKeyInternal(path, input, type));
}

export type GetQueryData<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof getQueryDataInternal<TProcedure>
>;

function setQueryDataInternal<
  TProcedure extends AnyQueryProcedure,
  TData = Output<TProcedure>,
>(
  this: { queryClient: QueryClient },
  path: Array<string>,
  input: Input<TProcedure>,
  updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
  type?: QueryType,
  options?: MaybeRefDeep<SetDataOptions>,
): TData | undefined {
  return this.queryClient.setQueryData(
    getQueryKeyInternal(path, input, type),
    updater,
    options,
  );
}

export type SetQueryData<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof setQueryDataInternal<TProcedure>
>;

type FetchQueryOptions<TData, TError = Error> = StripAndAddTrpc<
  VueFetchQueryOptions<TData, TError, TData, TRPCQueryKey>
>;

function prefetchQueryInternal<
  TProcedure extends AnyQueryProcedure,
  TData = Output<TProcedure>,
>(
  this: { queryClient: QueryClient; trpcClient: TRPCUntypedClient<AnyRouter> },
  path: Array<string>,
  input: Input<TProcedure>,
  opts?: MaybeRefDeep<FetchQueryOptions<TData>>,
  type?: QueryType,
): Promise<void> {
  const trpcOpts = cloneDeepUnref(unref(opts)?.trpc);
  return this.queryClient.prefetchQuery({
    queryKey: getQueryKeyInternal(path, input, type),
    queryFn: (context) =>
      this.trpcClient.query(
        pathToString(path),
        context.queryKey[1]?.input,
        trpcOpts,
      ) as Promise<TData>,
    ...opts,
  });
}

export type PrefetchQuery<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof prefetchQueryInternal<TProcedure>
>;
