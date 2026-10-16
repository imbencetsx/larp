const MAX_AGE = 365 * 24 * 60 * 60;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function secret() {
  const value =
    process.env.GUEST_SESSION_SECRET ?? process.env.CLERK_SECRET_KEY;
  if (value) return value;
  if (process.env.NODE_ENV === "production")
    throw Error(
      "Configure GUEST_SESSION_SECRET or Clerk before running in production.",
    );
  return "local-development-only-guest-sessions";
}
async function key() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`larp:guest:v1:${secret()}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
const encode = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
export async function signGuest(
  id: string,
  issued = Math.floor(Date.now() / 1000),
) {
  if (!uuid.test(id)) throw Error("Invalid guest identifier.");
  const payload = `v1.${id}.${issued}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(),
    new TextEncoder().encode(payload),
  );
  return `${payload}.${encode(new Uint8Array(signature))}`;
}
export async function verifyGuest(
  token: string | undefined,
  now = Math.floor(Date.now() / 1000),
): Promise<string | null> {
  if (!token || token.length > 160) return null;
  const parts = token.split(".");
  if (
    parts.length !== 4 ||
    parts[0] !== "v1" ||
    !uuid.test(parts[1]!) ||
    !/^\d{10}$/.test(parts[2]!) ||
    !/^[-_a-zA-Z0-9]{43}$/.test(parts[3]!)
  )
    return null;
  const issued = Number(parts[2]);
  if (issued > now + 60 || now - issued > MAX_AGE) return null;
  try {
    const bytes = Uint8Array.from(
      atob(parts[3]!.replaceAll("-", "+").replaceAll("_", "/") + "="),
      (c) => c.charCodeAt(0),
    );
    return (await crypto.subtle.verify(
      "HMAC",
      await key(),
      bytes,
      new TextEncoder().encode(parts.slice(0, 3).join(".")),
    ))
      ? parts[1]!
      : null;
  } catch {
    return null;
  }
}
