import { learningRouter } from "~/server/api/routers/learning";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
export const appRouter = createTRPCRouter({ learning: learningRouter });
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
