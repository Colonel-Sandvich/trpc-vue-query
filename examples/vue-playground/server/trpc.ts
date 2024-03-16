import { experimental_standaloneMiddleware, initTRPC } from "@trpc/server";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

const sleepyMiddleware = experimental_standaloneMiddleware().create(
  async (opts) => {
    await sleep(1000);
    return opts.next();
  },
);
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const sleepyProcedure = publicProcedure.use(sleepyMiddleware);
