import { createTRPCVueClient } from "@colonel-sandvich/trpc-vue-query";
import { useQueryClient } from "@tanstack/vue-query";
import { httpBatchLink } from "@trpc/client";
import { ref } from "vue";
import { AppRouter } from "../../server";

const trpcRef = ref<ReturnType<typeof createTRPCVueClient<AppRouter>>>();

export function useTrpc() {
  if (trpcRef.value) {
    return trpcRef.value;
  }

  const trpc = createTRPCVueClient<AppRouter>(
    {
      links: [
        httpBatchLink({
          url: "http://localhost:3000",
        }),
      ],
    },
    useQueryClient(),
  );

  trpcRef.value = trpc;

  return trpcRef.value;
}
