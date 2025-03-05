import type {
  DataTag,
  InvalidateOptions,
  InvalidateQueryFilters,
  MutationObserverResult,
  MutationOptions,
  NoInfer,
  QueryClient,
  QueryFunction,
  SetDataOptions,
  SkipToken,
  Updater,
  UseMutationReturnType,
  FetchQueryOptions as VueFetchQueryOptions,
} from "@tanstack/vue-query";
import {
  skipToken,
  useMutation as vueUseMutation,
  useQuery as vueUseQuery,
} from "@tanstack/vue-query";
import type { TRPCClient } from "@trpc/client";
import { TRPCUntypedClient } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";
import {
  computed,
  onServerPrefetch,
  toValue,
  unref,
  type MaybeRef,
  type UnwrapRef,
} from "vue";
import type { QueryType, TRPCQueryKey } from "./helpers.ts";
import { getQueryKeyInternal, pathToString } from "./helpers.ts";
import type {
  DeepPartialInput,
  DistributiveOmit,
  FunctionOverloadToUnion,
  MaybeRefDeep,
  MaybeRefDeepInput,
  ResolverDef,
  StripPath,
  TrpcRequestOptions,
  UnionToIntersection,
} from "./typeUtils.ts";
import { cloneDeepUnref, maybeReactiveToRefs } from "./utils.ts";

const untypedClientSymbol = Symbol.for("trpc_untypedClient");

export function createAugmentedClient<TRouter extends AnyTRPCRouter>(
  trpcProxyClient: TRPCClient<TRouter>,
  queryClient: QueryClient,
) {
  const trpcClient = trpcProxyClient[
    untypedClientSymbol as keyof TRPCClient<TRouter>
  ] as TRPCUntypedClient<TRouter>;

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

export type UseQuery<TDef extends ResolverDef> = UnionToIntersection<
  AddInputRemoveQueryClient<
    TDef["input"],
    FunctionOverloadToUnion<
      typeof vueUseQuery<TDef["output"], TDef["errorShape"]>
    >
  >
>;

type AddInputRemoveQueryClient<Input, FunctionOverloads> =
  FunctionOverloads extends (options: infer O, ...args: any) => infer R
    ? (
        input: MaybeRefDeep<Input | SkipToken>,
        options?: UnwrapRewrapOption<O>,
      ) => R
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
  this: { trpcClient: TRPCUntypedClient<AnyTRPCRouter> },
  path: Array<string>,
  input: unknown,
  opts?: any,
) {
  const queryFn: QueryFunction<unknown, TRPCQueryKey> = ({
    queryKey,
    signal,
  }) =>
    this.trpcClient.query(pathToString(path), queryKey[1]?.input, {
      context: opts?.trpc?.context,
      signal: opts?.trpc?.signal ?? signal,
    });
  const queryFnWithSkipToken = computed(() =>
    toValue(input) === skipToken ? skipToken : queryFn,
  );
  return vueUseQuery({
    queryKey: getQueryKeyInternal(path, input),
    queryFn: queryFnWithSkipToken,
    ...maybeReactiveToRefs(opts),
  });
}

export type UseMutation<
  TDef extends ResolverDef,
  TData = TDef["output"],
  TError = TDef["errorShape"],
  TVariables = MaybeRefDeepInput<TDef["input"]>,
  TResult = MutationResult<TData, TError, TDef["input"]>,
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
  this: { trpcClient: TRPCUntypedClient<AnyTRPCRouter> },
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

async function invalidateInternal<TDef extends ResolverDef>(
  this: { queryClient: QueryClient },
  path: Array<string>,
  input?: DeepPartialInput<TDef["input"]>,
  filters?: Omit<InvalidateQueryFilters, "queryKey">,
  opts?: MaybeRefDeep<InvalidateOptions>,
): Promise<void> {
  const queryKey = getQueryKeyInternal(path, input) as readonly unknown[];

  await this.queryClient.invalidateQueries(
    { ...cloneDeepUnref(filters), queryKey },
    opts,
  );
}

export type Invalidate<TDef extends ResolverDef> = StripPath<
  typeof invalidateInternal<TDef>
>;

function queryKeyInternal<TDef extends ResolverDef>(
  path: Array<string>,
  input?: DeepPartialInput<TDef["input"]>,
  type?: QueryType,
): DataTag<TRPCQueryKey, TDef["output"]> {
  return getQueryKeyInternal(path, input, type) as any;
}

export type QueryKey<TDef extends ResolverDef> = StripPath<
  typeof queryKeyInternal<TDef>
>;

function getQueryDataInternal<TDef extends ResolverDef, TData = TDef["output"]>(
  this: { queryClient: QueryClient },
  path: Array<string>,
  input: MaybeRefDeepInput<TDef["input"]>,
  type?: QueryType,
): TData | undefined {
  return this.queryClient.getQueryData(getQueryKeyInternal(path, input, type));
}

export type GetQueryData<TDef extends ResolverDef> = StripPath<
  typeof getQueryDataInternal<TDef>
>;

function setQueryDataInternal<TDef extends ResolverDef, TData = TDef["output"]>(
  this: { queryClient: QueryClient },
  path: Array<string>,
  input: MaybeRefDeepInput<TDef["input"]>,
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

export type SetQueryData<TDef extends ResolverDef> = StripPath<
  typeof setQueryDataInternal<TDef>
>;

type FetchQueryOptions<TData, TError = Error> = StripAndAddTrpc<
  VueFetchQueryOptions<TData, TError, TData, TRPCQueryKey>
>;

function prefetchQueryInternal<
  TDef extends ResolverDef,
  TData = TDef["output"],
>(
  this: {
    queryClient: QueryClient;
    trpcClient: TRPCUntypedClient<AnyTRPCRouter>;
  },
  path: Array<string>,
  input: MaybeRefDeepInput<TDef["input"]>,
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

export type PrefetchQuery<TDef extends ResolverDef> = StripPath<
  typeof prefetchQueryInternal<TDef>
>;
