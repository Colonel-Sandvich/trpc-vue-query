import { z } from "zod";
import { publicProcedure, router } from "../trpc";

let name = "Jeff";

export const appRouter = router({
  helloName: publicProcedure.query(() => `Hello there, ${name}!`),
  changeName: publicProcedure.input(z.string()).mutation(({ input }) => {
    name = input;
  }),
  plusOne: publicProcedure.input(z.number()).query(({ input }) => input + 1),
  prefetchExample: publicProcedure.query(() => Math.random()),
});

// export type definition of API
export type AppRouter = typeof appRouter;
