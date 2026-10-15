import ts from "typescript";
import postcss from "postcss";
import { parseHTML } from "linkedom";
import { getQuickJS } from "quickjs-emscripten";
import { getLesson, type TrackId } from "~/content/curriculum";
export type Check = { label: string; passed: boolean };
export type RunResult = {
  passed: boolean;
  checks: Check[];
  output: string[];
  error: string | null;
  preview: string | null;
};
const result = (
  checks: Check[],
  output: string[] = [],
  error: string | null = null,
  preview: string | null = null,
): RunResult => ({
  passed: checks.length > 0 && checks.every((c) => c.passed) && !error,
  checks,
  output,
  error,
  preview,
});
const named = (labels: string[], values: boolean[]) =>
  labels.map((label, i) => ({ label, passed: values[i] ?? false }));
function typecheck(code: string, jsx = false) {
  const filename = jsx ? "/exercise.tsx" : "/exercise.ts";
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    strict: true,
    noEmit: true,
    types: [],
    jsx: ts.JsxEmit.React,
    skipLibCheck: true,
  };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (file, language, onError, shouldCreate) => {
    if (file === filename)
      return ts.createSourceFile(
        file,
        code,
        language,
        true,
        jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
    if (file === "/react-stub.d.ts")
      return ts.createSourceFile(
        file,
        `declare namespace JSX { interface IntrinsicElements { [key: string]: { [key: string]: unknown } } }\ndeclare namespace React { type ReactNode = unknown; }\ndeclare const React: {createElement: (...args: unknown[]) => unknown};\ndeclare module "react" { export function useState<T>(initial:T): [T, (value:T|((previous:T)=>T))=>void]; }`,
        language,
        true,
      );
    // Only the TypeScript standard library is readable by the checker.
    // Learner imports and triple-slash references cannot load host files.
    const libraryRoot = ts
      .getDefaultLibFilePath(options)
      .replace(/[^/\\]+$/, "");
    if (!file.startsWith(libraryRoot)) return undefined;
    return original(file, language, onError, shouldCreate);
  };
  const program = ts.createProgram(
    [filename, ...(jsx ? ["/react-stub.d.ts"] : [])],
    options,
    host,
  );
  return ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    .slice(0, 5)
    .map((d) => {
      const location =
        d.file && d.start !== undefined
          ? `Line ${d.file.getLineAndCharacterOfPosition(d.start).line + 1}: `
          : "";
      return location + ts.flattenDiagnosticMessageText(d.messageText, " ");
    });
}
async function sandbox(
  source: string,
  test: string,
  react = false,
  dom = false,
) {
  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(8 * 1024 * 1024);
  runtime.setMaxStackSize(256 * 1024);
  const deadline = Date.now() + 150;
  runtime.setInterruptHandler(() => Date.now() > deadline);
  const vm = runtime.newContext();
  try {
    const harness = `var __logs=[]; var console={log:(...args)=>{if(__logs.length<30)__logs.push(args.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ').slice(0,1000))},error:(...args)=>console.log(...args),warn:(...args)=>console.log(...args)};`;
    const reactHarness = react
      ? `var exports={}; var __state=[]; var __cursor=0; var React={createElement:(tag,props,...children)=>({tag,props:props||{},children:children.flat(Infinity)})}; function require(name){if(name!=='react') throw Error('Only react is available in this simulator'); return {useState:(initial)=>{const i=__cursor++;if(!(i in __state))__state[i]=initial;return [__state[i],value=>{__state[i]=typeof value==='function'?value(__state[i]):value}]}}} function __render(){__cursor=0;return exports.default()} function __text(node){return node==null?'':typeof node==='object'?(node.children||[]).map(__text).join(''):String(node)} function __find(node,tag){if(!node||typeof node!=='object')return null;if(node.tag===tag)return node;for(const child of node.children||[]){const found=__find(child,tag);if(found)return found}return null} function __safeTree(node){if(node==null||typeof node==='boolean')return '';if(typeof node!=='object')return String(node);return {tag:typeof node.tag==='string'?node.tag:'div',children:(node.children||[]).map(__safeTree)}}`
      : "";
    const domHarness = dom
      ? `var __root={tag:'main',children:[],textContent:'',append(...items){this.children.push(...items)}};var __list={tag:'ul',children:[],textContent:'',append(...items){this.children.push(...items)},appendChild(item){this.children.push(item)}};__root.children.push({tag:'h1',children:[],textContent:'Seed shelf'});__root.children.push(__list);function __element(tag){return {tag,children:[],textContent:'',append(...items){this.children.push(...items)},appendChild(item){this.children.push(item)}}}var document={createElement:__element,querySelector(selector){return selector==='#plant-list'?__list:selector==='main'?__root:null}};function __text(node){if(node==null)return '';if(typeof node!=='object')return String(node);return (node.textContent||'')+(node.children||[]).map(__text).join('')}function __find(node,tag){if(!node||typeof node!=='object')return null;if(node.tag===tag)return node;for(const child of node.children||[]){const found=__find(child,tag);if(found)return found}return null}function __safeTree(node){if(node==null||typeof node==='boolean')return '';if(typeof node!=='object')return String(node);return {tag:typeof node.tag==='string'?node.tag:'div',children:[...(node.textContent?[String(node.textContent)]:[]),...(node.children||[]).map(__safeTree)]}}`
      : "";
    const evaluation = vm.evalCode(
      harness +
        reactHarness +
        domHarness +
        "\n" +
        source +
        "\n;JSON.stringify((()=>{" +
        test +
        "})())",
    );
    if (evaluation.error) {
      const dumped = vm.dump(evaluation.error) as { message?: string };
      evaluation.error.dispose();
      throw new Error(
        dumped.message === "interrupted"
          ? "Execution stopped after 150ms. Check for an infinite loop."
          : (dumped.message ?? "Code could not run."),
      );
    }
    const raw = vm.getString(evaluation.value);
    evaluation.value.dispose();
    return JSON.parse(raw) as {
      values: boolean[];
      logs: string[];
      tree?: Tree;
    };
  } finally {
    vm.dispose();
    runtime.dispose();
  }
}
type Tree = string | { tag: string; children: Tree[] };
function escape(text: string) {
  return text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
function treeHTML(tree: Tree): string {
  if (typeof tree === "string") return escape(tree);
  const tag =
    /^(main|section|article|div|span|h[1-6]|p|button|ul|ol|li|strong|em)$/.test(
      tree.tag,
    )
      ? tree.tag
      : "div";
  return `<${tag}${tag === "button" ? " disabled" : ""}>${tree.children.map(treeHTML).join("")}</${tag}>`;
}
function sourceFile(code: string, jsx = false) {
  return ts.createSourceFile(
    jsx ? "exercise.tsx" : "exercise.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
    jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}
function hasType(code: string, name: string, kind: ts.SyntaxKind) {
  let found = false;
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText() === name &&
      node.type?.kind === kind
    )
      found = true;
    ts.forEachChild(node, visit);
  };
  visit(sourceFile(code));
  return found;
}
export async function validateExercise(
  lessonId: string,
  code: string,
): Promise<RunResult> {
  const lesson = getLesson(lessonId);
  if (!lesson) return result([], [], "Lesson not found.");
  if (code.length > 12000)
    return result([], [], "Keep your exercise under 12,000 characters.");
  const labels = lesson.requirements;
  try {
    if (lesson.checks?.length) {
      const checks = lesson.checks;
      if (lesson.track === "html") {
        const { document } = parseHTML(code);
        return result(
          named(
            labels,
            checks.map((check) => {
              if (check.kind !== "html") return false;
              const node = document.querySelector(check.selector);
              if (!node) return false;
              if (check.text && !node.textContent?.toLowerCase().includes(check.text.toLowerCase())) return false;
              if (check.attribute) {
                const attribute = node.getAttribute(check.attribute);
                if (attribute === null || (check.value !== undefined && attribute !== check.value)) return false;
              }
              return true;
            }),
          ),
          [],
          null,
          code,
        );
      }
      if (lesson.track === "css") {
        const root = postcss.parse(code);
        const values = checks.map((check) => {
          if (check.kind !== "css") return false;
          const mediaPrefix = /^(@media\s*\([^)]*\))\s+(.+)$/i.exec(check.selector);
          const selector = mediaPrefix?.[2] ?? check.selector;
          let matched = false;
          root.walkRules((rule) => {
            if (!rule.selector.split(",").map((part) => part.trim()).includes(selector)) return;
            if (mediaPrefix) {
              const parent = rule.parent;
              const mediaFound = parent?.type === "atrule" && parent.name === "media" && `@media ${parent.params}`.toLowerCase() === mediaPrefix[1]!.toLowerCase();
              if (!mediaFound) return;
            }
            rule.walkDecls((decl) => {
              if (decl.prop === check.property && decl.value.trim().toLowerCase() === check.value.toLowerCase()) matched = true;
            });
          });
          return matched;
        });
        return result(named(labels, values));
      }
      if (lesson.track === "typescript") {
        const errors = typecheck(code);
        if (errors.length) return result(named(labels, checks.map(() => false)), errors, "Fix the type errors, then run your code again.");
      }
      if (lesson.track === "javascript" || lesson.track === "typescript") {
        const source = lesson.track === "typescript"
          ? ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText
          : code;
        const expressions = checks.map((check) => check.kind === "runtime" ? `Boolean(${check.expression})` : "false");
        const includePreview = lesson.id === "javascript-10";
        const run = await sandbox(
          source,
          `return {values:[${expressions.join(",")}],logs:__logs${includePreview ? ",tree:__safeTree(__root)" : ""}};`,
          false,
          includePreview,
        );
        return result(named(labels, run.values), run.logs, null, run.tree ? treeHTML(run.tree) : null);
      }
      if (lesson.track === "nextjs") {
        const errors = typecheck(code, true);
        if (errors.length) return result(named(labels, checks.map(() => false)), errors, "Fix the type errors, then run your code again.");
        const file = sourceFile(code, true);
        const client = file.statements.some((node, index) => index === 0 && ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === "use client");
        const metadata = file.statements.some((node) => ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) && node.declarationList.declarations.some((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === "metadata"));
        const compiled = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText;
        const assertions = checks.map((check) => {
          if (check.kind !== "next") return "false";
          const tags = (check.tags ?? []).map((tag) => `!!__find(tree,${JSON.stringify(tag)})`);
          const textMatches = check.text ? `__text(tree).toLowerCase().includes(${JSON.stringify(check.text.toLowerCase())})` : "true";
          const directive = check.directive === "client" ? String(client) : check.directive === "server" ? String(!client) : check.directive === "metadata" ? String(metadata) : "true";
          const busy = check.directive === "busy" ? `__find(tree,'main')?.props?.['aria-busy'] === 'true'` : "true";
          const clicks = check.text && /(?:^|\s)2(?:\s|$)/.test(check.text) ? 2 : 0;
          return `(()=>{__state=[];let tree=__render();for(let i=0;i<${clicks};i++){const button=__find(tree,'button');if(button&&typeof button.props.onClick==='function'){button.props.onClick();tree=__render()}}return [${tags.join(",")},${textMatches},${directive},${busy}].every(Boolean)})()`;
        });
        const run = await sandbox(compiled, `return {values:[${assertions.join(",")}],logs:__logs,tree:__safeTree((__state=[],__render()))};`, true);
        return result(named(labels, run.values), run.logs, null, run.tree ? treeHTML(run.tree) : null);
      }
    }
    if (lesson.track === "html") {
      const { document } = parseHTML(code);
      const nonempty = (selector: string) =>
        Boolean(document.querySelector(selector)?.textContent?.trim());
      const values =
        lesson.number === 1
          ? [
              /^\s*<!doctype\s+html\s*>/i.test(code),
              nonempty("head title"),
              document.querySelector("body h1")?.textContent?.trim() ===
                "Hello, LARP!",
            ]
          : [
              nonempty("h1") && nonempty("h2"),
              nonempty("p"),
              Array.from(document.querySelectorAll("a")).some(
                (a) =>
                  a.getAttribute("href")?.replace(/\/$/, "") ===
                    "https://developer.mozilla.org" &&
                  Boolean(a.textContent?.trim()),
              ),
            ];
      return result(named(labels, values), [], null, code);
    }
    if (lesson.track === "css") {
      const root = postcss.parse(code);
      const values: Record<string, string> = {};
      root.walkRules((rule) => {
        if (
          rule.selector
            .split(",")
            .map((s) => s.trim())
            .includes(".plant")
        )
          rule.walkDecls((d) => {
            values[d.prop] = d.value.toLowerCase().trim();
          });
      });
      const checks =
        lesson.number === 1
          ? [
              Boolean(root.nodes.length && Object.keys(values).length),
              ["green", "#008000", "rgb(0, 128, 0)"].includes(
                values.color ?? "",
              ),
              values["background-color"] === "#eef4e8" ||
                values.background === "#eef4e8",
            ]
          : [
              values["box-sizing"] === "border-box" && values.width === "240px",
              values.padding === "24px" && values.margin === "16px",
              /^2px\s+solid\s+\S+/.test(values.border ?? ""),
            ];
      return result(named(labels, checks));
    }
    if (lesson.track === "typescript" || lesson.track === "nextjs") {
      const errors = typecheck(code, lesson.track === "nextjs");
      if (errors.length)
        return result(
          named(labels, []),
          errors,
          "Fix the type errors, then run your code again.",
        );
    }
    if (lesson.track === "nextjs") {
      const file = sourceFile(code, true);
      const defaultFn = file.statements.some(
        (n) =>
          ts.isFunctionDeclaration(n) &&
          n.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword),
      );
      const client =
        file.statements[0] &&
        ts.isExpressionStatement(file.statements[0]) &&
        ts.isStringLiteral(file.statements[0].expression) &&
        file.statements[0].expression.text === "use client";
      const imported = file.statements.some(
        (n) =>
          ts.isImportDeclaration(n) &&
          n.moduleSpecifier.getText().replace(/["']/g, "") === "react" &&
          n.importClause?.namedBindings &&
          ts.isNamedImports(n.importClause.namedBindings) &&
          n.importClause.namedBindings.elements.some(
            (e) => (e.propertyName ?? e.name).text === "useState",
          ),
      );
      const compiled = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.React,
        },
      }).outputText;
      const test =
        lesson.number === 1
          ? `const tree=__render();return {values:[${defaultFn},!!__find(tree,'main'),__text(__find(tree,'h1')).trim()==='My garden'],logs:__logs,tree:__safeTree(tree)};`
          : `let tree=__render();let button=__find(tree,'button');const zero=__state[0]===0;let working=!!button&&typeof button.props.onClick==='function'&&__text(button).includes('0');if(working){button.props.onClick();tree=__render();button=__find(tree,'button');working=__state[0]===1&&__text(button).includes('1');if(working){button.props.onClick();tree=__render();working=__state[0]===2&&__text(__find(tree,'button')).includes('2')}}return {values:[${client},${Boolean(imported)}&&zero,${defaultFn}&&working],logs:__logs,tree:__safeTree((__state=[],__render()))};`;
      const run = await sandbox(compiled, test, true);
      return result(
        named(labels, run.values),
        [
          ...run.logs,
          ...(lesson.number === 2
            ? ["Simulator clicked the button twice to verify state updates."]
            : []),
        ],
        null,
        run.tree ? treeHTML(run.tree) : null,
      );
    }
    let test = "";
    if (lessonId === "javascript-1")
      test = `return {values:[typeof plant!=='undefined'&&plant==='Fern',typeof leaves!=='undefined'&&leaves===4,__logs.includes('Fern has 4 leaves.')],logs:__logs};`;
    if (lessonId === "javascript-2")
      test = `const callable=typeof waterPlant==='function';return {values:[callable,callable&&[0,15,29].every(v=>waterPlant(v)==='Water me'),callable&&[30,50,100].every(v=>waterPlant(v)==='I am happy')],logs:__logs};`;
    if (lessonId === "typescript-1")
      test = `return {values:[${hasType(code, "plantName", ts.SyntaxKind.StringKeyword)}&&plantName==='Fern',${hasType(code, "leafCount", ts.SyntaxKind.NumberKeyword)}&&leafCount===4,${hasType(code, "isHealthy", ts.SyntaxKind.BooleanKeyword)}&&isHealthy===true],logs:__logs};`;
    if (lessonId === "typescript-2") {
      const file = sourceFile(code);
      const type = file.statements.find(
        (n) =>
          (ts.isTypeAliasDeclaration(n) || ts.isInterfaceDeclaration(n)) &&
          n.name.text === "Plant",
      );
      const members =
        type && ts.isInterfaceDeclaration(type)
          ? type.members
          : type &&
              ts.isTypeAliasDeclaration(type) &&
              ts.isTypeLiteralNode(type.type)
            ? type.type.members
            : [];
      const shape =
        members.some(
          (m) =>
            ts.isPropertySignature(m) &&
            m.name.getText() === "name" &&
            m.type?.kind === ts.SyntaxKind.StringKeyword,
        ) &&
        members.some(
          (m) =>
            ts.isPropertySignature(m) &&
            m.name.getText() === "leaves" &&
            m.type?.kind === ts.SyntaxKind.NumberKeyword,
        );
      const fn = file.statements.find(
        (n) => ts.isFunctionDeclaration(n) && n.name?.text === "describePlant",
      );
      const typed =
        fn &&
        ts.isFunctionDeclaration(fn) &&
        fn.parameters[0]?.type?.getText() === "Plant" &&
        fn.type?.kind === ts.SyntaxKind.StringKeyword;
      test = `return {values:[${shape},${Boolean(typed)},typeof describePlant==='function'&&describePlant({name:'Fern',leaves:4})==='Fern has 4 leaves'&&describePlant({name:'Basil',leaves:7})==='Basil has 7 leaves'],logs:__logs};`;
    }
    const source =
      lesson.track === "typescript"
        ? ts.transpileModule(code, {
            compilerOptions: {
              target: ts.ScriptTarget.ES2020,
              module: ts.ModuleKind.None,
            },
          }).outputText
        : code;
    const run = await sandbox(source, test);
    return result(named(labels, run.values), run.logs);
  } catch (error) {
    return result(
      named(labels, []),
      [],
      error instanceof Error
        ? error.message
        : "Something went wrong. Try again.",
    );
  }
}
export async function runPlayground(
  track: TrackId,
  code: string,
): Promise<RunResult> {
  if (code.length > 12000)
    return result([], [], "Keep code under 12,000 characters.");
  if (track === "html") return result([], [], null, code);
  if (track === "css") {
    try {
      postcss.parse(code);
      return result([]);
    } catch (error) {
      return result(
        [],
        [],
        error instanceof Error ? error.message : "Invalid CSS",
      );
    }
  }
  if (track === "nextjs") return simulateComponent(code, 0);
  try {
    if (track === "typescript") {
      const errors = typecheck(code);
      if (errors.length)
        return result([], errors, "Fix the type errors before running.");
    }
    const source =
      track === "typescript"
        ? ts.transpileModule(code, {
            compilerOptions: {
              target: ts.ScriptTarget.ES2020,
              module: ts.ModuleKind.None,
            },
          }).outputText
        : code;
    const run = await sandbox(source, "return {values:[],logs:__logs};");
    return result([], run.logs);
  } catch (error) {
    return result(
      [],
      [],
      error instanceof Error ? error.message : "Execution failed.",
    );
  }
}

// State is replayed from the component's initial render on each request.
// Only this isolated model receives learner event handlers.
export async function simulateComponent(
  code: string,
  clicks: number,
): Promise<RunResult> {
  if (
    code.length > 12000 ||
    !Number.isInteger(clicks) ||
    clicks < 0 ||
    clicks > 20
  )
    return result(
      [],
      [],
      "Keep the simulation within 20 clicks and 12,000 characters.",
    );
  try {
    const errors = typecheck(code, true);
    if (errors.length)
      return result([], errors, "Fix the type errors before simulating.");
    const compiled = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
      },
    }).outputText;
    const run = await sandbox(
      compiled,
      `let tree=__render();for(let i=0;i<${clicks};i++){const button=__find(tree,'button');if(!button||typeof button.props.onClick!=='function')throw Error('Add an onClick handler to your button first.');button.props.onClick();tree=__render()}return {values:[],logs:__logs,tree:__safeTree(tree)};`,
      true,
    );
    return result([], run.logs, null, run.tree ? treeHTML(run.tree) : null);
  } catch (error) {
    return result(
      [],
      [],
      error instanceof Error ? error.message : "Simulation failed.",
    );
  }
}
