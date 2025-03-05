import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";
import { publicProcedure, router, sleepyProcedure } from "./trpc";

let name = "Jeff";

const appRouter = router({
  helloName: publicProcedure.query(() => `Hello there, ${name}!`),
  changeName: sleepyProcedure
    .input(z.object({ input: z.string() }))
    .mutation(({ input }) => {
      name = input.input;
    }),
  reactiveToInput: publicProcedure
    .input(z.number())
    .query(({ input }) => `Changed! ${input}`),
  deep: {
    deeper: {
      all: sleepyProcedure.query(() => "deep.deeper.all"),
      byId: sleepyProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => `deep.deeper.byId(${input.id})`),
    },
    all: sleepyProcedure.query(() => "deep.all"),
  },
  other: sleepyProcedure.query(() => "other"),
  // TODO
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

createHTTPServer({
  router: appRouter,
}).listen(3001);

console.log("Listening on 3001...");
