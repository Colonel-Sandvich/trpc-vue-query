import type { FetchEsque } from "@trpc/client/dist/internals/types";
import type { $Fetch } from "nitropack";
import type { FetchError } from "ofetch";

function isFetchError(error: unknown): error is FetchError {
  return error instanceof Error && error.name === "FetchError";
}

// Allows for SSR by using Nuxt's `$fetch` which turns api calls into local function calls.
export function customFetchWrapper(fetch?: $Fetch): FetchEsque {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const fetch_ = fetch ?? globalThis.$fetch;

    if (!fetch_) {
      throw new Error("globalThis.$fetch is missing, you should be using Nuxt");
    }

    try {
      const response = await fetch_.raw(
        input.toString(),
        init as RequestInit & { method: "GET" }, // ts hack. Method should be: "GET" | "POST" | "PATCH" ...
      );
      return {
        ...response,
        headers: response.headers,
        json: () => Promise.resolve(response._data),
      };
    } catch (e) {
      if (isFetchError(e) && e.response) {
        return e.response;
      }
      throw e;
    }
  };
}
