import { DeepPartial } from "@trpc/server";

/**
 * To allow easy interactions with groups of related queries, such as
 * invalidating all queries of a router, we use an array as the path when
 * storing in tanstack query.
 **/
export function getQueryKeyInternal(
  path: string[],
  input: unknown,
  type: QueryType,
): TRPCQueryKey {
  // Construct a query key that is easy to destructure and flexible for
  // partial selecting etc.
  // https://github.com/trpc/trpc/issues/3128

  // some parts of the path may be dot-separated, split them up
  const splitPath = path.flatMap((part) => part.split("."));

  if (!input && (!type || type === "any"))
    // for `utils.invalidate()` to match all queries (including vanilla react-query)
    // we don't want nested array if path is empty, i.e. `[]` instead of `[[]]`
    return splitPath.length ? [splitPath] : ([] as unknown as TRPCQueryKey);
  return [
    splitPath,
    {
      ...(typeof input !== "undefined" && { input: input }),
      ...(type && type !== "any" && { type: type }),
    },
  ];
}

type GetInfiniteQueryInput<
  TProcedureInput,
  TInputWithoutCursor = Omit<TProcedureInput, "cursor">,
> = keyof TInputWithoutCursor extends never
  ? undefined
  : DeepPartial<TInputWithoutCursor> | undefined;

/** @internal */
export type GetQueryProcedureInput<TProcedureInput> = TProcedureInput extends {
  cursor?: any;
}
  ? GetInfiniteQueryInput<TProcedureInput>
  : DeepPartial<TProcedureInput> | undefined;

export type QueryType = "any" | "infinite" | "query";

export type QueryKey = [
  string[],
  { input?: unknown; type?: Exclude<QueryType, "any"> }?,
];

export type QueryKeyKnown<TInput, TType extends Exclude<QueryType, "any">> = [
  string[],
  { input?: GetQueryProcedureInput<TInput>; type: TType }?,
];
export type TRPCQueryKey = [
  string[],
  { input?: unknown; type?: Exclude<QueryType, "any"> }?,
];
