import { describe, expect, it } from "vitest";
import {
  initialPlaygroundDrafts,
  playgroundProject,
  readPlaygroundFiles,
  restorePlaygroundDrafts,
} from "~/lib/playground";
import { saveFiles } from "~/lib/workspace";
import { runPlayground, simulateComponent } from "~/server/services/validate";

describe("multi-file playground", () => {
  it("shares the web project and preserves all legacy drafts", () => {
    expect(
      ["html", "css", "javascript"].map((track) =>
        playgroundProject(track as "html" | "css" | "javascript"),
      ),
    ).toEqual(["web", "web", "web"]);
    const migrated = restorePlaygroundDrafts(
      {
        html: "<h1>My saved page</h1>",
        css: "h1{color:red}",
        javascript: "console.log(42)",
        typescript: "const saved: number=7;",
        nextjs: "export default function Page(){return <h1>Saved</h1>}",
      },
      true,
    );
    expect(migrated.web).toEqual({
      "index.html": "<h1>My saved page</h1>",
      "styles.css": "h1{color:red}",
      "experiment.js": "console.log(42)",
    });
    expect(migrated.typescript["experiment.ts"]).toContain("saved: number");
    expect(migrated.nextjs["app/garden/page.tsx"]).toContain("Saved");
    expect(restorePlaygroundDrafts(migrated)).toEqual(migrated);
  });

  it("runs the same HTML, CSS, and JavaScript project from every web language", async () => {
    const files = {
      "index.html":
        '<main><h1 id="message">My fern</h1><button id="grow">Water fern</button></main>',
      "styles.css": "h1{color:green}",
      "experiment.js":
        'const message=document.getElementById("message");document.getElementById("grow").onclick=()=>{message.textContent="Fern watered";console.log("Watered");};console.log(typeof fetch,typeof process,typeof window);',
    };
    for (const track of ["html", "css", "javascript"] as const) {
      const output = await runPlayground(track, saveFiles(files));
      expect(output.error).toBeNull();
      expect(output.browserApp).toBe(true);
      expect(output.output).toEqual(["undefined undefined undefined"]);
      expect(output.preview).toContain("My fern");
      const button = Number(
        /<button[^>]*data-sim-id="(\d+)"/.exec(output.preview!)![1],
      );
      const clicked = await runPlayground(track, saveFiles(files), [
        { id: button, type: "click", fields: [] },
      ]);
      expect(clicked.error).toBeNull();
      expect(clicked.preview).toContain("Fern watered");
      expect(clicked.output).toContain("Watered");
      expect(clicked).not.toHaveProperty("browserCode");
    }
  });

  it("runs typed DOM projects and reports companion CSS and TypeScript errors", async () => {
    const files = initialPlaygroundDrafts().typescript;
    const output = await runPlayground("typescript", saveFiles(files));
    expect(output.error).toBeNull();
    expect(output.preview).toContain("Small ideas grow here.");
    files["styles.css"] = "h1 { color: red;";
    expect(
      (await runPlayground("typescript", saveFiles(files))).error,
    ).toContain("Unclosed");
    files["styles.css"] = "";
    files["experiment.ts"] = "const leaves: number = 'wrong';";
    const invalid = await runPlayground("typescript", saveFiles(files));
    expect(invalid.error).toContain("type errors");
    expect(invalid.output.join(" ")).toContain("not assignable");
  });

  it("runs multi-file Next.js projects and replays component state", async () => {
    const files = initialPlaygroundDrafts().nextjs;
    files["app/garden/page.tsx"] =
      '"use client";import {useState} from "react";import "../globals.css";export default function Page(){const [count,setCount]=useState(0);return <button onClick={()=>setCount(count+1)}>{count} leaves</button>}';
    const draft = saveFiles(files);
    expect((await runPlayground("nextjs", draft)).preview).toContain("0");
    const clicked = await simulateComponent(draft, 3);
    expect(clicked.error).toBeNull();
    expect(clicked.preview).toContain("3");
    expect(clicked.preview).toContain("leaves");
  });

  it("bounds file sizes, interaction history, and accepted filenames", async () => {
    const files = initialPlaygroundDrafts().web;
    expect(
      readPlaygroundFiles(
        "html",
        saveFiles({ ...files, "../../.env": "secret" }),
      ),
    ).not.toHaveProperty("../../.env");
    expect(
      readPlaygroundFiles("html", saveFiles({ ...files, "index.html": "" }))![
        "index.html"
      ],
    ).toBe("");
    files["experiment.js"] = " ".repeat(12001);
    expect((await runPlayground("html", saveFiles(files))).error).toContain(
      "12,000",
    );
    expect(
      (
        await runPlayground(
          "html",
          saveFiles(initialPlaygroundDrafts().web),
          Array.from({ length: 65 }, () => ({
            id: 0,
            type: "click" as const,
            fields: [],
          })),
        )
      ).error,
    ).toContain("64 interactions");
  });
  it("keeps full HTML document content and safe semantic markup when running", async () => {
    const files = initialPlaygroundDrafts().web;
    files["index.html"] =
      '<!doctype html><html><head><title>My page</title></head><body><main><figure><img alt="A fern" src="data:image/png;base64,AA=="><figcaption>My fern</figcaption></figure><pre><code>const plant = 1;</code></pre></main></body></html>';
    files["experiment.js"] = "";
    const output = await runPlayground("html", saveFiles(files));
    expect(output.error).toBeNull();
    expect(output.preview).toContain('<img alt="A fern"');
    expect(output.preview).toContain("<figcaption");
    expect(output.preview).toContain("const plant = 1;");
    expect(output.preview).not.toContain("My page");
  });
  it("lets HTML and CSS experiments replace the default page without editing JavaScript", async () => {
    const files = initialPlaygroundDrafts().web;
    files["index.html"] = "<h1>A page of my own</h1>";
    const output = await runPlayground("css", saveFiles(files));
    expect(output.error).toBeNull();
    expect(output.preview).toContain("A page of my own");
  });
});
