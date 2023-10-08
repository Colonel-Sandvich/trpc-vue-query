import { createNuxtApiHandler } from "@colonel-sandvich/trpc-vue-query";
import { appRouter } from "~/server/routers";

export default createNuxtApiHandler({
  router: appRouter,
});
