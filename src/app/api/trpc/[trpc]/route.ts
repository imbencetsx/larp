import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import {
  isSameOrigin,
  MAX_BODY_BYTES,
  requestLimiter,
} from "~/server/security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = async (req: NextRequest) => {
  const blocked = (message: string, status: number) =>
    Response.json(
      { error: message },
      {
        status,
        headers: {
          "Cache-Control": "private, no-store",
          ...(status === 429 ? { "Retry-After": "60" } : {}),
        },
      },
    );
  if (!requestLimiter.allow("transport:global", 2400))
    return blocked("Too many requests.", 429);
  if (req.nextUrl.pathname.split("/").at(-1)!.split(",").length > 4)
    return blocked("Too many batched operations.", 400);
  if (req.url.length > 12000) return blocked("Request URL is too long.", 414);
  let request: Request = req;
  if (req.method === "POST") {
    if (!isSameOrigin(req.headers))
      return blocked("Request origin is not allowed.", 403);
    if (
      req.headers.get("content-type")?.split(";")[0]?.trim() !==
      "application/json"
    )
      return blocked("Send application/json.", 415);
    if (Number(req.headers.get("content-length")) > MAX_BODY_BYTES)
      return blocked("Request body is too large.", 413);
    const reader = req.body?.getReader();
    if (!reader) return blocked("Request body is missing.", 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    let expired = false;
    const deadline = setTimeout(() => {
      expired = true;
      void reader.cancel().catch(() => undefined);
    }, 5000);
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY_BYTES) {
          await reader.cancel();
          return blocked("Request body is too large.", 413);
        }
        chunks.push(value);
      }
    } catch {
      return blocked("Could not read the request body.", 400);
    } finally {
      clearTimeout(deadline);
    }
    if (expired) return blocked("Request body timed out.", 408);
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    request = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body,
    });
  }
  // Keep module/configuration failures inside the JSON transport boundary.
  try {
    const [{ appRouter }, { createTRPCContext }] = await Promise.all([
      import("~/server/api/root"),
      import("~/server/api/trpc"),
    ]);
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: () => createTRPCContext({ headers: req.headers }),
      onError: ({ path, error }) => {
        console.error(`tRPC failed on ${path ?? "<no-path>"}:`, error);
      },
    });
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.append("Vary", "Cookie, Origin");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  } catch (error) {
    console.error("Could not initialize the learning API:", error);
    const failure = {
      error: {
        json: {
          message:
            "The learning service could not start. Please try again shortly.",
          code: -32603,
          data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 },
        },
      },
    };
    return Response.json(
      req.nextUrl.searchParams.get("batch") === "1" ? [failure] : failure,
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
};

export { handler as GET, handler as POST };
