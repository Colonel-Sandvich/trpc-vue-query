import {
  InitialDataFunction,
  InvalidateOptions,
  InvalidateQueryFilters,
  MutateFunction,
  MutationObserverResult,
  QueryClient,
  QueryObserverOptions,
  UseMutationOptions,
  UseQueryDefinedReturnType,
  UseQueryReturnType,
  useMutation as vueUseMutation,
  useQuery as vueUseQuery,
} from "@tanstack/vue-query";
import {
  CreateTRPCProxyClient,
  TRPCClientErrorLike,
  TRPCRequestOptions as TRPCRequestOptionsInternal,
} from "@trpc/client";
import {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  inferProcedureInput,
  inferProcedureOutput,
} from "@trpc/server";
import { TRPCQueryKey, getQueryKeyInternal } from "./helpers.ts";
import {
  MaybeRefDeep,
  StripPath,
  ToRefs,
  VoidReturnType,
} from "./typeUtils.ts";
import { cloneDeepUnref } from "./utils.ts";

export function createAugmentedClient<TRouter extends AnyRouter>(
  trpcClient: CreateTRPCProxyClient<TRouter>,
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
    mutationKey: queryKeyInternal,
  } as const;
}

type TrpcRequestOptions = {
  trpc?: TRPCRequestOptionsInternal;
};

type Input<TProcedure extends AnyProcedure> =
  inferProcedureInput<TProcedure> extends void | undefined
    ? void | undefined
    : MaybeRefDeep<inferProcedureInput<TProcedure>>;

type TrpcError<TProcedure extends AnyProcedure> =
  TRPCClientErrorLike<TProcedure>;

type UseQueryTRPCOptions<TData> = MaybeRefDeep<
  Omit<QueryObserverOptions<TData>, "queryFn" | "queryKey" | "queryHash">
> &
  TrpcRequestOptions;

function useQueryInternal<
  TProcedure extends AnyQueryProcedure,
  TData = inferProcedureOutput<TProcedure>,
>(
  this: { trpcClient: any },
  path: string,
  input: Input<TProcedure>,
  opts?: Omit<UseQueryTRPCOptions<TData>, "initialData"> & {
    initialData: undefined;
  },
): UseQueryReturnType<TData, TrpcError<TProcedure>> {
  const trpc = opts?.trpc;

  const query = vueUseQuery<TData, TrpcError<TProcedure>>({
    queryKey: getQueryKeyInternal([path], input, "query"),
    queryFn: () =>
      this.trpcClient[path].query(cloneDeepUnref(input ?? {}), trpc),
    ...opts,
  });

  return query;
}

export type UseQuery<
  TProcedure extends AnyQueryProcedure,
  TData = inferProcedureOutput<TProcedure>,
> = <TInitialData = unknown>(
  input: Input<TProcedure>,
  opts?: UseQueryTRPCOptions<TData> & {
    initialData?: TInitialData | InitialDataFunction<TInitialData>;
  },
) => TInitialData extends undefined
  ? UseQueryReturnType<TData, TrpcError<TProcedure>>
  : unknown extends TInitialData
  ? UseQueryReturnType<TData, TrpcError<TProcedure>>
  : UseQueryDefinedReturnType<TData, TrpcError<TProcedure>>;

type UseMutationTRPCOptions<TData, TError, TVariables, TContext> =
  UseMutationOptions<TData, TError, TVariables, TContext> & TrpcRequestOptions;

type UseMutationReturnType<
  TData,
  TError,
  TVariables,
  TContext,
  Result = MutationObserverResult<TData, TError, TVariables, TContext>,
> = ToRefs<
  Readonly<
    Omit<Result, "mutate"> & {
      mutate: VoidReturnType<
        MutateFunction<TData, TError, MaybeRefDeep<TVariables>, TContext>
      >;
      mutateAsync: MutateFunction<
        TData,
        TError,
        MaybeRefDeep<TVariables>,
        TContext
      >;
    }
  >
>;

function useMutationInternal<
  TProcedure extends AnyMutationProcedure,
  TData = inferProcedureOutput<TProcedure>,
  TError = TrpcError<TProcedure>,
  TVariables = inferProcedureInput<TProcedure>,
  TContext = unknown,
>(
  this: { trpcClient: any },
  path: string,
  opts?: UseMutationTRPCOptions<TData, TError, TVariables, TContext>,
): UseMutationReturnType<TData, TError, TVariables, TContext> {
  const trpc = opts?.trpc;

  const query = vueUseMutation<TData, TError, TVariables, TContext>({
    mutationKey: getQueryKeyInternal([path], undefined, "query"),
    mutationFn: (input) =>
      this.trpcClient[path].mutate(cloneDeepUnref(input ?? {}), trpc),
    ...opts,
  });

  return query as any;
}

export type UseMutation<TProcedure extends AnyMutationProcedure> = StripPath<
  typeof useMutationInternal<TProcedure>
>;

async function invalidateInternal<TProcedure extends AnyQueryProcedure>(
  this: { queryClient: QueryClient },
  path: string,
  input: Input<TProcedure>,
  filters?: InvalidateQueryFilters,
  opts?: InvalidateOptions,
): Promise<void> {
  const queryKey = getQueryKeyInternal([path], input, "query");

  await this.queryClient.invalidateQueries({ ...filters, queryKey }, opts);
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
