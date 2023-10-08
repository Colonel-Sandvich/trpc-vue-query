import {
  AnyRouter,
  MaybePromise,
  ProcedureType,
  TRPCError,
  inferRouterContext,
  inferRouterError,
} from "@trpc/server";
import { ResponseMeta, resolveHTTPResponse } from "@trpc/server/http";
import { TRPCResponse } from "@trpc/server/rpc";
import { getErrorShape } from "@trpc/server/shared";
import {
  EventHandler,
  H3Event,
  createError,
  defineEventHandler,
  getRequestURL,
  isMethod,
  readBody,
} from "h3";

// Copied from @wobsoriano https://github.com/wobsoriano/trpc-nuxt/blob/main/src/index.ts

export type CreateContextFn<TRouter extends AnyRouter> = (
  event: H3Event,
) => MaybePromise<inferRouterContext<TRouter>>;

export interface ResponseMetaFnPayload<TRouter extends AnyRouter> {
  data: TRPCResponse<unknown, inferRouterError<TRouter>>[];
  ctx?: inferRouterContext<TRouter>;
  paths?: string[];
  type: ProcedureType | "unknown";
  errors: TRPCError[];
}

export type ResponseMetaFn<TRouter extends AnyRouter> = (
  opts: ResponseMetaFnPayload<TRouter>,
) => ResponseMeta;

export interface OnErrorPayload<TRouter extends AnyRouter> {
  error: TRPCError;
  type: ProcedureType | "unknown";
  path: string | undefined;
  req: H3Event["node"]["req"];
  input: unknown;
  ctx: undefined | inferRouterContext<TRouter>;
}

export type OnErrorFn<TRouter extends AnyRouter> = (
  opts: OnErrorPayload<TRouter>,
) => void;

export interface ResolveHTTPRequestOptions<TRouter extends AnyRouter> {
  /**
   * The tRPC router to use.
   * @see https://trpc.io/docs/router
   */
  router: TRouter;
  /**
   * An async function that returns the tRPC context.
   * @see https://trpc.io/docs/context
   */
  createContext?: CreateContextFn<TRouter>;
  /**
   * A function that returns the response meta.
   * @see https://trpc.io/docs/caching#using-responsemeta-to-cache-responses
   */
  responseMeta?: ResponseMetaFn<TRouter>;
  /**
   * A function that is called when an error occurs.
   * @see https://trpc.io/docs/error-handling#handling-errors
   */
  onError?: OnErrorFn<TRouter>;
  batching?: {
    enabled: boolean;
  };
}

function getPath(event: H3Event): string | null {
  const { params } = event.context;

  if (typeof params?.trpc === "string") {
    return params.trpc;
  }

  return null;
}

export function createH3ApiHandler<TRouter extends AnyRouter>({
  router,
  createContext,
  responseMeta,
  onError,
  batching,
}: ResolveHTTPRequestOptions<TRouter>): EventHandler {
  return defineEventHandler(async (event) => {
    const { req, res } = event.node;

    const $url = getRequestURL(event);

    const path = getPath(event);

    if (path === null) {
      const error = getErrorShape({
        config: router._def._config,
        error: new TRPCError({
          message:
            'Query "trpc" not found - is the file named `[trpc]`.ts or `[...trpc].ts`?',
          code: "INTERNAL_SERVER_ERROR",
        }),
        type: "unknown",
        ctx: undefined,
        path: undefined,
        input: undefined,
      });

      throw createError({
        statusCode: 500,
        statusMessage: JSON.stringify(error),
      });
    }

    const httpResponse = await resolveHTTPResponse({
      batching,
      router,
      req: {
        method: req.method!,
        headers: req.headers,
        body: isMethod(event, "GET") ? null : await readBody(event),
        query: $url.searchParams,
      },
      path,
      createContext: async () => await createContext?.(event),
      responseMeta,
      onError: (o) => {
        onError?.({
          ...o,
          req,
        });
      },
    });

    const { status, headers, body } = httpResponse;

    res.statusCode = status;

    headers &&
      Object.keys(headers).forEach((key) => {
        res.setHeader(key, headers[key]!);
      });

    return body;
  });
}

export const createNuxtApiHandler = createH3ApiHandler;
