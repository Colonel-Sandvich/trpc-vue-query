import {
  InvalidateOptions,
  InvalidateQueryFilters,
  MutationObserverResult,
  MutationOptions,
  NoInfer,
  QueryClient,
  SetDataOptions,
  Updater,
  UseMutationReturnType,
  useMutation as vueUseMutation,
  useQuery as vueUseQuery,
} from "@tanstack/vue-query";
import { CreateTRPCProxyClient } from "@trpc/client";
import {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  inferProcedureInput,
} from "@trpc/server";
import { MaybeRef, UnwrapRef } from "vue-demi";
import { TRPCQueryKey, getQueryKeyInternal } from "./helpers.ts";
import {
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
  trpcClient: CreateTRPCProxyClient<TRouter>,
  queryClient: QueryClient,
) {
  const useQuery = useQueryInternal.bind({ trpcClient });
  const useMutation = useMutationInternal.bind({ trpcClient });
  const invalidate = invalidateInternal.bind({ queryClient });
  const getQueryData = getQueryDataInternal.bind({ queryClient });
  const setQueryData = setQueryDataInternal.bind({ queryClient });

  return {
    useQuery,
    useMutation,
    invalidate,
    queryKey: queryKeyInternal,
    mutationKey: queryKeyInternal,
    getQueryData,
    setQueryData,
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

type CustomiseQueryOptionsKeys<T> = Omit<
  T,
  "queryKey" | "queryFn" | "queryHash" | "queryKeyHashFn"
> &
  TrpcRequestOptions;

// VueQuery incorrectly slaps { initialData: ...} on to the already MaybeRef'd UseQueryOptions
// So their types don't work with ref<{initialData: ...}> correctly.
type UnwrapRewrapOption<
  TOption,
  KeysRemoved = CustomiseQueryOptionsKeys<UnwrapRef<TOption>>,
> = MaybeRef<
  TOption extends { initialData: infer D }
    ? KeysRemoved & { initialData: D }
    : TOption extends { initialData?: undefined }
      ? KeysRemoved & { initialData?: undefined }
      : KeysRemoved
>;

function useQueryInternal(
  this: { trpcClient: any },
  path: string,
  input: any,
  opts?: any,
): any {
  return vueUseQuery({
    queryKey: getQueryKeyInternal([path], input, "query"),
    queryFn: () =>
      this.trpcClient[path].query(cloneDeepUnref(input ?? {}), opts?.trpc),
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
  options: MaybeRefDeep<
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
  this: { trpcClient: any },
  path: string,
  opts?: any,
): any {
  return vueUseMutation({
    mutationKey: getQueryKeyInternal([path], undefined, "query"),
    mutationFn: (input: any) =>
      this.trpcClient[path].mutate(cloneDeepUnref(input), opts?.trpc),
    ...opts,
  });
}

async function invalidateInternal<TProcedure extends AnyQueryProcedure>(
  this: { queryClient: QueryClient },
  path: string,
  input: Input<TProcedure>,
  filters?: MaybeRefDeep<InvalidateQueryFilters>,
  opts?: MaybeRefDeep<InvalidateOptions>,
): Promise<void> {
  const queryKey = getQueryKeyInternal([path], input, "query");

  await this.queryClient.invalidateQueries(
    { ...cloneDeepUnref(filters), queryKey },
    opts,
  );
}

export type Invalidate<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof invalidateInternal<TProcedure>
>;

function queryKeyInternal<TProcedure extends AnyProcedure>(
  path: string,
  input: Input<TProcedure>,
): TRPCQueryKey {
  return getQueryKeyInternal([path], input, "query");
}

export type QueryKey<TProcedure extends AnyProcedure> = StripPath<
  typeof queryKeyInternal<TProcedure>
>;

function getQueryDataInternal<
  TProcedure extends AnyQueryProcedure,
  TData = Output<TProcedure>,
>(
  this: { queryClient: QueryClient },
  path: string,
  input: Input<TProcedure>,
): TData | undefined {
  return this.queryClient.getQueryData(
    getQueryKeyInternal([path], input, "query"),
  );
}

export type GetQueryData<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof getQueryDataInternal<TProcedure>
>;

function setQueryDataInternal<
  TProcedure extends AnyQueryProcedure,
  TData = Output<TProcedure>,
>(
  this: { queryClient: QueryClient },
  path: string,
  input: Input<TProcedure>,
  updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
  options?: MaybeRefDeep<SetDataOptions>,
): TData | undefined {
  return this.queryClient.setQueryData(
    getQueryKeyInternal([path], input, "query"),
    updater,
    options,
  );
}

export type SetQueryData<TProcedure extends AnyQueryProcedure> = StripPath<
  typeof setQueryDataInternal<TProcedure>
>;
