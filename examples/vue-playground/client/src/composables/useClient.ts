import { TrpcVueClient, clientKey } from "@colonel-sandvich/trpc-vue-query";
import { inject } from "vue";
import type { AppRouter } from "../../../server";

export function useClient(): TrpcVueClient<AppRouter> {
  return inject(clientKey)!;
}

export function useClient2() {
  return inject<TrpcVueClient<AppRouter>>(clientKey)!;
}

export function useClient3() {
  return inject(clientKey) as TrpcVueClient<AppRouter>;
}
