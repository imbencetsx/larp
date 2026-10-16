export function isSameOrigin(headers: Headers) {
  const raw = headers.get("origin");
  if (!raw || headers.get("sec-fetch-site") === "cross-site") return false;
  try {
    const origin = new URL(raw);
    const expected =
      process.env.APP_ORIGIN ??
      `${process.env.NODE_ENV === "production" ? "https" : "http"}://${headers.get("host") ?? ""}`;
    return (
      ["http:", "https:"].includes(origin.protocol) &&
      origin.origin === new URL(expected).origin &&
      raw === origin.origin
    );
  } catch {
    return false;
  }
}
type Bucket = { count: number; expires: number };
export class RequestLimiter {
  private buckets = new Map<string, Bucket>();
  constructor(private capacity = 4096) {}
  allow(key: string, limit: number, now = Date.now()) {
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.expires <= now) {
      if (this.buckets.size >= this.capacity) {
        for (const [id, value] of this.buckets)
          if (value.expires <= now) this.buckets.delete(id);
      }
      if (this.buckets.size >= this.capacity && !this.buckets.has(key))
        return false;
      bucket = { count: 0, expires: now + 60000 };
      this.buckets.set(key, bucket);
    }
    if (bucket.count >= limit) return false;
    bucket.count++;
    return true;
  }
}
const state = globalThis as typeof globalThis & {
  larpRequestLimiter?: RequestLimiter;
};
export const requestLimiter = (state.larpRequestLimiter ??=
  new RequestLimiter());
export const MAX_BODY_BYTES = 256 * 1024;
