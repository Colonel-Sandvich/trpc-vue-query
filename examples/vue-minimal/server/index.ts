import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import { publicProcedure, router } from "./trpc";

let name: string = "Jeff";

const appRouter = router({
  helloName: publicProcedure.query(async () => {
    await sleep(2000);

    return `Hello there, ${name}!`;
  }),
  changeName: publicProcedure.input(z.string()).mutation(({ input }) => {
    name = input;
  }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

createHTTPServer({
  router: appRouter,
}).listen(3000);

console.log("Listening on 3000...");

////
////

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
