import { TrpcVueQueryPlugin } from "@colonel-sandvich/trpc-vue-query";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createApp } from "vue";
import App from "./src/App.vue";
import { trpc } from "./trpc";

export const app = createApp(App);

app
  .use(VueQueryPlugin)
  .use(TrpcVueQueryPlugin, {
    trpcClient: trpc,
  })
  .mount("#app");
