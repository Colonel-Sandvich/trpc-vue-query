import { QueryClient } from "@tanstack/vue-query";
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
  UseMutation,
  UseQuery,
  createNuxtProxyDecorationInternal,
} from "./functions";

type DecorateProcedure<TProcedure extends AnyProcedure> =
  TProcedure extends AnyQueryProcedure
    ? {
        useQuery: UseQuery<TProcedure>;
        invalidate: Invalidate<TProcedure>;
      }
    : TProcedure extends AnyMutationProcedure
    ? {
        useMutation: UseMutation<TProcedure>;
      }
    : never;

export type DecoratedProcedureRecord<
  TProcedures extends ProcedureRouterRecord,
> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? DecoratedProcedureRecord<TProcedures[TKey]["_def"]["record"]>
    : TProcedures[TKey] extends AnyProcedure
    ? DecorateProcedure<TProcedures[TKey]>
    : never;
};

export function createTRPCVueClient<TRouter extends AnyRouter>(
  opts: CreateTRPCClientOptions<TRouter>,
  queryClient: QueryClient,
) {
  const client = createTRPCProxyClient<TRouter>(opts);

  const augmentedClient = createNuxtProxyDecorationInternal(
    client,
    queryClient,
  );
  return createFlatProxy((key) => {
    return createNuxtProxyDecoration(key, augmentedClient);
  }) as DecoratedProcedureRecord<TRouter["_def"]["record"]>;
}

function createNuxtProxyDecoration(name: string, client: any) {
  return createRecursiveProxy((opts) => {
    const args = opts.args;

    const pathCopy = [name, ...opts.path];

    // The last arg is for instance `.useMutation` or `.useQuery()`
    const lastArg = pathCopy.pop()!;

    // The `path` ends up being something like `post.byId`
    const path = pathCopy.join(".");

    return client[lastArg](path, ...args);

    // // Expose queryKey helper
    // if (lastArg === "getQueryKey") {
    //   return getArrayQueryKey([path, input], (rest[0] as any) ?? "any");
    // }
  });
}
