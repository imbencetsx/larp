import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "~/server/db";
import { getClerkUserId } from "~/server/auth";
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const userId = await getClerkUserId();
  const raw = opts.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)larp_guest=([0-9a-f-]{36})(?:;|$)/)?.[1];
  const guestId = raw ? `guest_${raw}` : null;
  return { db, userId, guestId, learnerId: userId ?? guestId, ...opts };
};
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const learnerProcedure = t.procedure.use(({ ctx, next, type }) => {
  if (!ctx.learnerId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Refresh the page to start a learning session.",
    });
  if (type === "mutation") {
    const origin = ctx.headers.get("origin");
    const host = ctx.headers.get("x-forwarded-host") ?? ctx.headers.get("host");
    if (origin && new URL(origin).host !== host)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Request origin is not allowed.",
      });
  }
  return next({ ctx: { ...ctx, learnerId: ctx.learnerId } });
});
export const protectedProcedure = learnerProcedure.use(({ ctx, next }) => {
  if (!ctx.userId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Sign in to access account data.",
    });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
