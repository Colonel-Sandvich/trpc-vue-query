import { TrpcVueQueryPlugin } from "@colonel-sandvich/trpc-vue-query";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { httpBatchLink } from "@trpc/client";
import { createApp } from "vue";
import App from "./src/App.vue";

export const app = createApp(App);

app
  .use(VueQueryPlugin)
  .use(TrpcVueQueryPlugin, {
    trpcClient: {
      links: [
        httpBatchLink({
          url: "http://localhost:3000",
        }),
      ],
    },
  })
  .mount("#app");

// import { trpc } from "./your-path/to/trpc.ts"
//
// app
//   .use(VueQueryPlugin)
//   .use(TrpcVueQueryPlugin, {
//     trpcClient: <CustomTRPC> if you already have one setup,
//     queryClient: <CustomQueryClient> if you want
//   })
//   .mount("#app");
