import type { AnyTRPCRouter, inferRouterContext } from "@trpc/server";
import type {
  HTTPBaseHandlerOptions,
  ResolveHTTPRequestOptionsContextFn,
  TRPCRequestInfo,
} from "@trpc/server/http";
import { resolveResponse } from "@trpc/server/http";
import type { EventHandler, NodeIncomingMessage } from "h3";
import { H3Event, defineEventHandler, toWebRequest } from "h3";

// Copied from @wobsoriano https://github.com/wobsoriano/trpc-nuxt/blob/main/src/index.ts

type MaybePromise<T> = T | Promise<T>;

export type CreateContextFn<TRouter extends AnyTRPCRouter> = (
  event: H3Event,
  innerOptions: { info: TRPCRequestInfo },
) => MaybePromise<inferRouterContext<TRouter>>;

type H3HandlerOptions<TRouter extends AnyTRPCRouter> = HTTPBaseHandlerOptions<
  TRouter,
  NodeIncomingMessage
> & {
  createContext?: CreateContextFn<TRouter>;
};

function getPath(event: H3Event): string | null {
  const { params } = event.context;

  if (typeof params?.trpc === "string") {
    return params.trpc;
  }

  return null;
}

export function createH3ApiHandler<TRouter extends AnyTRPCRouter>(
  opts: H3HandlerOptions<TRouter>,
): EventHandler {
  return defineEventHandler(async (event) => {
    const createContext: ResolveHTTPRequestOptionsContextFn<TRouter> = async (
      innerOpts,
    ) => {
      return await opts.createContext?.(event, innerOpts);
    };

    const { req } = event.node;

    const path = getPath(event)!;

    const httpResponse = await resolveResponse({
      ...opts,
      req: toWebRequest(event),
      error: null,
      createContext,
      path,
      onError(o) {
        opts.onError?.({
          ...o,
          req,
        });
      },
    });

    return httpResponse;
  });
}

export const createNuxtApiHandler = createH3ApiHandler;
