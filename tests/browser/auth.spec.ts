import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("learning requires sign-in and offers no guest bypass", async ({
  page,
  context,
}) => {
  await page.goto("/learn/html/1");
  await expect(page).toHaveURL(/\/sign-in\?/);
  expect(new URL(page.url()).searchParams.get("redirect_url")).toContain(
    "/learn/html/1",
  );
  await expect(
    page.getByRole("button", { name: /back to learning|continue as guest/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /back to learning|continue as guest/i }),
  ).toHaveCount(0);
  expect(
    (await context.cookies()).some((cookie) => cookie.name === "larp_guest"),
  ).toBe(false);
});

test("anonymous learning API requests return JSON authorization errors", async ({
  request,
}) => {
  const response = await request.get("/api/trpc/learning.overview");
  expect(response.status()).toBe(401);
  expect(response.headers()["content-type"]).toContain("application/json");
  expect(await response.json()).toEqual({
    error: "Sign in to continue learning.",
  });
});
