import { createTrpcVueClient } from "@colonel-sandvich/trpc-vue-query";
import { trpc } from "~/trpc/client";

export default defineNuxtPlugin(() => {
  const client = createTrpcVueClient(trpc);

  return {
    provide: {
      client,
    },
  };
});
