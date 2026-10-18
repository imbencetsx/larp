// A platform error page or authentication redirect is not a tRPC response.
// Report the transport failure without trying to parse HTML as JSON.
export async function fetchTRPC(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      response.status === 401 || response.status === 403 || response.redirected
        ? "Your session could not be verified. Refresh the page and try again."
        : `The learning service is unavailable (HTTP ${response.status}). Please try again shortly.`,
    );
  }
  return response;
}
