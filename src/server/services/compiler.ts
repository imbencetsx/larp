import ts from "typescript";
import { getLesson } from "~/content/curriculum";
import { readFiles } from "~/lib/workspace";
import { htmlDocument } from "~/lib/html-document";

const normalize = (path: string) => {
  const parts: string[] = [];
  for (const part of path.split("/")) {
    if (part === "..") parts.pop();
    else if (part && part !== ".") parts.push(part);
  }
  return "/" + parts.join("/");
};
const stub = `declare namespace JSX { interface IntrinsicElements { [key:string]: {[key:string]:unknown} } }
declare namespace React { type ReactNode=unknown; }
declare const React:{createElement:(...args:unknown[])=>unknown;Fragment:unknown};
declare module "react" { export type ReactNode=unknown;export function useState<T>(initial:T):[T,(value:T|((previous:T)=>T))=>void]; }
declare module "*.css" {}`;

export function checkTypes(
  code: string,
  jsx = false,
  files?: Record<string, string>,
  entry?: string,
) {
  const filename =
    files && entry
      ? normalize("/project/" + entry)
      : jsx
        ? "/exercise.tsx"
        : "/exercise.ts";
  const virtual = new Map<string, string>([[filename, code]]);
  if (files)
    for (const [name, content] of Object.entries(files)) {
      if (/\.tsx?$/.test(name))
        virtual.set(normalize("/project/" + name), content);
    }
  virtual.set(filename, code);
  if (jsx) virtual.set("/react-stub.d.ts", stub);
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    strict: true,
    noEmit: true,
    types: [],
    jsx: ts.JsxEmit.React,
    skipLibCheck: true,
    esModuleInterop: true,
  };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  const libraryRoot = ts.getDefaultLibFilePath(options).replace(/[^/\\]+$/, "");
  host.getSourceFile = (file, language, onError, shouldCreate) => {
    const content = virtual.get(file);
    if (content !== undefined)
      return ts.createSourceFile(
        file,
        content,
        language,
        true,
        file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
    if (!file.startsWith(libraryRoot)) return undefined;
    return original(file, language, onError, shouldCreate);
  };
  host.resolveModuleNames = (names, containing) =>
    names.map((name) => {
      if (!name.startsWith(".")) return undefined;
      const base = normalize(
        containing.slice(0, containing.lastIndexOf("/")) + "/" + name,
      );
      for (const suffix of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        const resolved = base + suffix;
        if (virtual.has(resolved))
          return {
            resolvedFileName: resolved,
            extension: resolved.endsWith("tsx")
              ? ts.Extension.Tsx
              : ts.Extension.Ts,
          };
      }
      return undefined;
    });
  const program = ts.createProgram([...virtual.keys()], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    .slice(0, 5)
    .map((d) => {
      const location =
        d.file && d.start !== undefined
          ? `${d.file.fileName.replace("/project/", "")} line ${d.file.getLineAndCharacterOfPosition(d.start).line + 1}: `
          : "";
      return location + ts.flattenDiagnosticMessageText(d.messageText, " ");
    });
}

export function compileComponent(
  code: string,
  files?: Record<string, string>,
  entry?: string,
) {
  const compile = (source: string, filename: string) =>
    ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true,
      },
    }).outputText;
  if (!files || !entry) return compile(code, "exercise.tsx");
  const modules = Object.entries({ ...files, [entry]: code })
    .filter(([name]) => /\.tsx?$/.test(name))
    .map(
      ([name, source]) =>
        `${JSON.stringify(normalize(name))}:function(require,module,exports){\n${compile(source, name)}\n}`,
    )
    .join(",");
  return `var __modules={${modules}};var __moduleCache={};function __modulePath(path){var parts=[];for(var p of path.split('/')){if(p==='..')parts.pop();else if(p&&p!=='.')parts.push(p)}return '/'+parts.join('/')}function __loadModule(id){if(__moduleCache[id])return __moduleCache[id].exports;if(!__modules[id])throw Error('Unknown project module: '+id);var module={exports:{}};__moduleCache[id]=module;__modules[id](name=>{if(name.endsWith('.css'))return {};if(!name.startsWith('.'))return require(name);var base=__modulePath(id.slice(0,id.lastIndexOf('/'))+'/'+name);for(var suffix of ['', '.ts','.tsx','/index.ts','/index.tsx']){if(__modules[base+suffix])return __loadModule(base+suffix)}throw Error('Cannot find module '+name)},module,module.exports);return module.exports}exports=__loadModule(${JSON.stringify(normalize(entry))});`;
}

export function exportProject(lessonId: string, saved: string) {
  const lesson = getLesson(lessonId);
  if (!lesson) throw new Error("Lesson not found");
  const files = readFiles(lesson, saved);
  if (lesson.track === "nextjs") return files;
  const htmlName = Object.keys(files).find((name) => name.endsWith(".html"));
  const cssName = Object.keys(files).find((name) => name.endsWith(".css"));
  if (htmlName) {
    const html = files[htmlName]!;
    let script: string | undefined;
    if (lesson.track === "javascript" || lesson.track === "typescript") {
      const jsName = lesson.filename.replace(/\.ts$/, ".js");
      if (lesson.track === "typescript")
        files[jsName] = ts.transpileModule(files[lesson.filename]!, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None,
          },
        }).outputText;
      script = jsName;
    }
    files[htmlName] = htmlDocument(
      html,
      lesson.title,
      cssName ?? "styles.css",
      script,
    );
  }
  return files;
}

export function compileBrowser(code: string, track: string) {
  return track === "typescript"
    ? ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.None,
        },
      }).outputText
    : code;
}
