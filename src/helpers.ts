/**
 * To allow easy interactions with groups of related queries, such as
 * invalidating all queries of a router, we use an array as the path when
 * storing in tanstack query.
 **/
export function getQueryKeyInternal(
  path: string[],
  input: unknown,
  type?: QueryType,
): TRPCQueryKey {
  // Construct a query key that is easy to destructure and flexible for
  // partial selecting etc.
  // https://github.com/trpc/trpc/issues/3128
  // https://github.com/TanStack/query/issues/5111#issuecomment-1464864361

  // some parts of the path may be dot-separated, split them up
  const splitPath = path.flatMap((part) => part.split("."));

  if (!input && !type) {
    // for `utils.invalidate()` to match all queries (including vanilla react-query)
    // we don't want nested array if path is empty, i.e. `[]` instead of `[[]]`
    return splitPath.length ? [splitPath] : ([] as unknown as TRPCQueryKey);
  }

  return [
    splitPath,
    {
      ...(typeof input !== "undefined" && { input: input }),
      ...(type && { type: type }),
    },
  ];
}

export type QueryType = "infinite";

export type TRPCQueryKey = Readonly<
  [string[], { input?: unknown; type?: QueryType }?]
>;

export function pathToString(path: Array<string>) {
  // // The `path` ends up being something like `post.byId`
  return path.join(".");
}
