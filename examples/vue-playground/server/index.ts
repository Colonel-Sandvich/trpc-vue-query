import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import { publicProcedure, router, sleepyProcedure } from "./trpc";

let name = "Jeff";

const appRouter = router({
  helloName: sleepyProcedure.query(() => `Hello there, ${name}!`),
  reactiveToInput: publicProcedure
    .input(z.number())
    .query(({ input }) => `Changed! ${input}`),
  changeName: publicProcedure
    .input(z.object({ input: z.string() }))
    .mutation(({ input }) => {
      name = input.input;
    }),
  deep: router({
    deeper: router({
      all: sleepyProcedure.query(() => "deep.deeper.all"),
      byId: sleepyProcedure
        .input(z.object({ id: z.number() }))
        .query(() => "deep.deeper.byId"),
    }),
    all: sleepyProcedure.query(() => "deep.all"),
  }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

createHTTPServer({
  router: appRouter,
}).listen(3000);

console.log("Listening on 3000...");
