import { fillCode, expectCodeValue } from "./editor-helpers";
import { test, expect } from "@playwright/test";

test("top bar keeps the same dimensions on app and standalone pages", async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    let reference: unknown;
    for (const path of [
      "/",
      "/courses",
      "/courses/html",
      "/garden",
      "/progress",
      "/settings",
      "/learn/html/1",
      "/learn/html/15",
      "/playground",
      "/welcome",
      "/sign-in",
      "/sign-up",
    ]) {
      await page.goto(path);
      await expect(page.locator(".topbar")).toBeVisible();
      const dimensions = await page.evaluate(() => {
        const bar = document.querySelector(".topbar")!.getBoundingClientRect();
        const logo = document
          .querySelector(".topbar .brand")!
          .getBoundingClientRect();
        return {
          height: bar.height,
          left: bar.left,
          width: bar.width,
          logoX: logo.x,
          logoY: logo.y,
        };
      });
      reference ??= dimensions;
      expect(dimensions, `${path} at ${viewport.width}`).toEqual(reference);
    }
  }
});

test("dashboard card artwork stays above its text at every width", async ({
  page,
}) => {
  for (const width of [1440, 1100, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".dashboard-courses .track-card")).toHaveCount(5);
    const cards = await page
      .locator(".dashboard-courses .track-card")
      .evaluateAll((cards) =>
        cards.map((card) => {
          const art = card.querySelector(".track-card-top")!;
          const text = card.querySelector(".track-card-body")!;
          const title = card.querySelector("h3")!;
          const footer = card.querySelector(".track-card-footer")!;
          return {
            separated:
              art.getBoundingClientRect().bottom <=
                text.getBoundingClientRect().top &&
              text.getBoundingClientRect().bottom <=
                footer.getBoundingClientRect().top,
            artwork:
              getComputedStyle(art).backgroundImage.includes("/artwork/"),
            titleFits: title.scrollWidth <= title.clientWidth,
            contentFits: card.scrollWidth <= card.clientWidth,
          };
        }),
      );
    expect(
      cards.every(
        (card) =>
          card.separated && card.artwork && card.titleFits && card.contentFits,
      ),
      `Cards at ${width}`,
    ).toBe(true);
    const overflow = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll("body *")]
        .filter((node) => node.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 10)
        .map((node) => ({
          tag: node.tagName,
          className: node.getAttribute("class"),
          right: node.getBoundingClientRect().right,
        })),
    }));
    expect(overflow.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(
      width,
    );
  }
});

test("playground runs companion files as one interactive project and saves them", async ({
  page,
}) => {
  await page.goto("/playground");
  const html =
    '<main><h1 id="message">My fern</h1><button id="grow">Water fern</button></main>';
  await fillCode(
    page.getByRole("textbox", { name: "Code editor for index.html" }),
    html,
  );
  await page.getByRole("tab", { name: "styles.css", exact: true }).click();
  const css = "body > main > h1 { color: rgb(115, 170, 95); }";
  await fillCode(
    page.getByRole("textbox", { name: "Code editor for styles.css" }),
    css,
  );
  await page.getByRole("tab", { name: "experiment.js", exact: true }).click();
  const js =
    'document.getElementById("grow").onclick=()=>{document.getElementById("message").textContent="Fern watered";console.log("Watered");};';
  await fillCode(
    page.getByRole("textbox", { name: "Code editor for experiment.js" }),
    js,
  );
  // Run while editing CSS: all companion files must still participate.
  await page.getByRole("button", { name: "HTML & CSS", exact: true }).click();
  await page.getByRole("tab", { name: "styles.css", exact: true }).click();
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  const app = page.frameLocator('iframe[title="Sandboxed code preview"]');
  await expect(app.getByRole("button", { name: "Water fern" })).toHaveAttribute(
    "data-sim-id",
    /\d+/,
  );
  await expect(app.getByRole("heading", { name: "My fern" })).toHaveCSS(
    "color",
    "rgb(115, 170, 95)",
  );
  await app.getByRole("button", { name: "Water fern" }).click();
  await expect(
    app.getByRole("heading", { name: "Fern watered" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Console", exact: true }).click();
  await expect(page.locator(".console-output")).toContainText("Watered");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("larp-playground-v2")))
    .toContain("Fern watered");
  await page.reload();
  await expectCodeValue(
    page.getByRole("textbox", { name: "Code editor for index.html" }),
    html,
  );
  await page.getByRole("button", { name: "HTML & CSS", exact: true }).click();
  await page.getByRole("tab", { name: "styles.css", exact: true }).click();
  await expectCodeValue(
    page.getByRole("textbox", { name: "Code editor for styles.css" }),
    css,
  );
  await page.getByRole("button", { name: "JavaScript", exact: true }).click();
  await expectCodeValue(
    page.getByRole("textbox", { name: "Code editor for experiment.js" }),
    js,
  );
  await page.getByRole("button", { name: "Reset code to starter" }).click();
  await page.getByRole("tab", { name: "index.html", exact: true }).click();
  await expectCodeValue(
    page.getByRole("textbox", { name: "Code editor for index.html" }),
    html,
  );
});

test("playground migrates old drafts and runs TypeScript and Next.js companion files", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("larp-playground-v2"))
      localStorage.setItem(
        "larp-playground-v1",
        JSON.stringify({
          html: "<h1>Saved page</h1>",
          css: "h1{color:tomato}",
          javascript: "console.log('Saved JS');",
        }),
      );
  });
  await page.goto("/playground");
  await expectCodeValue(
    page.getByRole("textbox", { name: "Code editor for index.html" }),
    "<h1>Saved page</h1>",
  );
  await page.getByRole("button", { name: "TypeScript", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "index.html", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "styles.css", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  const app = page.frameLocator('iframe[title="Sandboxed code preview"]');
  await app.getByRole("button", { name: "Grow an idea" }).click();
  await expect(app.getByText("1 ideas taking root.")).toBeVisible();
  await page.getByRole("button", { name: "Next.js", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "app/globals.css", exact: true }),
  ).toBeVisible();
  await fillCode(
    page.getByRole("textbox", { name: "Code editor for app/garden/page.tsx" }),
    '"use client";import {useState} from "react";export default function Page(){const [count,setCount]=useState(0);return <button onClick={()=>setCount(count+1)}>{count} leaves</button>}',
  );
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await expect(app.getByRole("button", { name: "0 leaves" })).toBeVisible();
  await page.getByRole("button", { name: "Simulate a click" }).click();
  await expect(app.getByRole("button", { name: "1 leaves" })).toBeVisible();
});
