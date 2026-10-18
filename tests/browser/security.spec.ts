import { fillCode } from "./editor-helpers";
import { test, expect } from "@playwright/test";

test("preview strips active learner HTML and cannot access the parent", async ({
  page,
}) => {
  await page.goto("/learn/html/1");
  const attempts: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("attacker.invalid"))
      attempts.push(request.url());
  });
  await fillCode(
    page.getByRole("textbox", { name: "Code editor for index.html" }),
    '<main><h1>Safe learner preview</h1><script>parent.document.body.dataset.pwned="yes"</script><img src="https://attacker.invalid/pixel" onerror="parent.location.href=\'https://attacker.invalid/\'"><iframe src="https://attacker.invalid/frame"></iframe><meta http-equiv="refresh" content="0;url=https://attacker.invalid"><a href="javascript:alert(1)">Bad link</a><form action="https://attacker.invalid"><input name="value"><button>Send</button></form></main>',
  );
  const frame = page.frameLocator('iframe[title="Sandboxed code preview"]');
  await expect(
    frame.getByRole("heading", { name: "Safe learner preview" }),
  ).toBeVisible();
  expect(await frame.locator("img").getAttribute("onerror")).toBeNull();
  await expect(frame.locator("iframe")).toHaveCount(0);
  expect(await frame.getByText("Bad link").getAttribute("href")).toBeNull();
  expect(
    await frame.locator("body").evaluate(() => {
      try {
        return window.parent.document.title;
      } catch {
        return "blocked";
      }
    }),
  ).toBe("blocked");
  expect(await page.locator("body").getAttribute("data-pwned")).toBeNull();
  expect(attempts).toEqual([]);
  expect(page.url()).toContain("/learn/html/1");
});

test("API rejects cross-site, non-JSON, oversized, and over-batched requests", async ({
  page,
}) => {
  const pageResponse = await page.goto("/");
  const headers = pageResponse!.headers();
  expect(headers["content-security-policy"]).toContain("'strict-dynamic'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  const endpoint = "/api/trpc/learning.save";
  const data = JSON.stringify({ json: { lessonId: "html-1", code: "" } });
  const origin = new URL(page.url()).origin;
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin: "null", "content-type": "application/json" },
        data,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post(endpoint, {
        headers: {
          origin: "https://evil.example",
          "x-forwarded-host": "evil.example",
          "content-type": "application/json",
        },
        data,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin, "content-type": "text/plain" },
        data,
      })
    ).status(),
  ).toBe(415);
  expect(
    (
      await page.request.post(endpoint, {
        headers: { origin, "content-type": "application/json" },
        data: "x".repeat(256 * 1024 + 1),
      })
    ).status(),
  ).toBe(413);
  expect(
    (
      await page.request.get(
        "/api/trpc/" +
          Array(5).fill("learning.overview").join(",") +
          "?batch=1",
      )
    ).status(),
  ).toBe(400);
});

test("dashboard cards keep artwork without icons", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator(".dashboard-courses .track-card").first(),
  ).toBeVisible();
  await expect(page.locator(".dashboard-courses .track-icon")).toHaveCount(0);
  await expect(page.locator(".dashboard-courses svg")).toHaveCount(0);
  const artwork = await page
    .locator(".dashboard-courses .track-card-top")
    .evaluateAll((cards) =>
      cards.map((card) => getComputedStyle(card).backgroundImage),
    );
  expect(
    artwork.every(
      (image) => image.includes("/artwork/") && image.includes("-scene.svg"),
    ),
  ).toBe(true);
});
