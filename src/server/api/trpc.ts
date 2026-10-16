import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "~/server/db";
import { getClerkUserId } from "~/server/auth";
import { verifyGuest } from "~/lib/guest-session";
import { isSameOrigin, requestLimiter } from "~/server/security";
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const userId = await getClerkUserId();
  const raw = opts.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)larp_guest=([^;]+)(?:;|$)/)?.[1];
  const verified = await verifyGuest(raw);
  const guestId = verified ? `guest_${verified}` : null;
  return { db, userId, guestId, learnerId: userId ?? guestId, ...opts };
};
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      message:
        process.env.NODE_ENV === "production" &&
        error.code === "INTERNAL_SERVER_ERROR"
          ? "Request failed. Please try again."
          : shape.message,
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
export const learnerProcedure = t.procedure.use(({ ctx, next, type, path }) => {
  if (!ctx.learnerId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Refresh the page to start a learning session.",
    });
  if (type === "mutation") {
    if (!isSameOrigin(ctx.headers))
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Request origin is not allowed.",
      });
  }
  const expensive =
    /\.(run|submit|playground|simulate|browserSimulate|exportProject)$/.test(
      path,
    );
  if (
    !requestLimiter.allow(
      `${ctx.learnerId}:${expensive ? "execution" : type}`,
      expensive ? 180 : type === "mutation" ? 300 : 600,
    )
  )
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please wait a moment and try again.",
    });
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
