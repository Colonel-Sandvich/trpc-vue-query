import type { FetchEsque } from "node_modules/@trpc/client/dist/internals/types.d.ts";
import type { $Fetch } from "node_modules/nitropack/dist/index.d.ts";
import { FetchError } from "ofetch";

// Allows for SSR by using Nuxt's `$fetch` which turns api calls into local function calls.
export function customFetchWrapper(fetch: $Fetch): FetchEsque {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const response = await fetch.raw(
        input.toString(),
        init as RequestInit & { method: "GET" }, // ts hack. Method should be: "GET" | "POST" | "PATCH" ...
      );
      return {
        ...response,
        headers: response.headers,
        json: () => Promise.resolve(response._data),
      };
    } catch (e) {
      if (e instanceof FetchError && e.response) {
        return e.response;
      }
      throw e;
    }
  };
}
