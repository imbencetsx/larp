export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

export function databaseConfiguration({
  url,
  authToken,
  vercel,
}: {
  url: string | undefined;
  authToken?: string;
  vercel: boolean;
}) {
  const trimmedUrl = url?.trim();
  const databaseUrl =
    trimmedUrl === "" || trimmedUrl === undefined
      ? "file:./db.sqlite"
      : trimmedUrl;
  if (vercel && databaseUrl.startsWith("file:")) {
    throw new DatabaseConfigurationError(
      "The production database is not configured. Set DATABASE_URL to a hosted libSQL/Turso URL and DATABASE_AUTH_TOKEN in Vercel, then redeploy.",
    );
  }
  if (!/^(file|libsql|https?|wss?):/.test(databaseUrl)) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL must be a libSQL/Turso URL (libsql:// or https://), or a file: URL for local development.",
    );
  }
  const token = authToken?.trim();
  return { url: databaseUrl, authToken: token === "" ? undefined : token };
}
