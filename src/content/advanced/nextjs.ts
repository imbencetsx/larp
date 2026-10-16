import { lab, run as r, view as v, q, quiz } from "./helpers";
const layout =
  'import type { ReactNode } from "react";\nimport "./globals.css";\nexport const metadata={title:"LARP Workshop",description:"Built through the LARP Next.js course"};\nexport default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>;}';
const projectCSS =
  "body{margin:0;padding:24px;background:#191714;color:#eee9dc;font:16px/1.5 system-ui}main{max-width:900px;margin:auto}button,input,select{font:inherit;padding:10px;margin:4px}button{background:#a4c88c;border:0;color:#172010;cursor:pointer}article,li{border:1px solid #4a443a;padding:16px;margin-block:12px}ul{list-style:none;padding:0}label{display:block}button:focus-visible,input:focus-visible{outline:3px solid #f0c974;outline-offset:2px}";
const projectConfig = {
  "app/layout.tsx": layout,
  "app/globals.css": projectCSS,
  "package.json":
    '{"name":"larp-capstone","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start"},"dependencies":{"next":"^15.2.3","react":"^19.0.0","react-dom":"^19.0.0"},"devDependencies":{"typescript":"^5.8.2","@types/react":"^19","@types/react-dom":"^19","@types/node":"^20"}}',
  "tsconfig.json":
    '{"compilerOptions":{"target":"ES2020","lib":["dom","esnext"],"strict":true,"noEmit":true,"esModuleInterop":true,"module":"esnext","moduleResolution":"bundler","jsx":"preserve","resolveJsonModule":true,"plugins":[{"name":"next"}]},"include":["**/*.ts","**/*.tsx",".next/types/**/*.ts"],"exclude":["node_modules"]}',
  "README.md":
    "Run npm install, then npm run dev. This is a local client app. Add authenticated server persistence before using it for shared or sensitive data.",
};
const boardModel = `export type Task={id:number;title:string;done:boolean};
export function toggle(tasks:readonly Task[],id:number):Task[]{return tasks.map(task=>task.id===id?{...task,done:!task.done}:task);}
export function remaining(tasks:readonly Task[]):number{return tasks.filter(task=>!task.done).length;}`;
const boardApp = `"use client";
import { useState } from "react";
import { toggle, remaining, type Task } from "../lib/tasks";
export default function Board() {
  const [tasks,setTasks]=useState<Task[]>([{id:1,title:"Plan the app",done:false},{id:2,title:"Build the UI",done:false},{id:3,title:"Test the edge cases",done:false}]);
  const [title,setTitle]=useState("");
  const [filter,setFilter]=useState("all");
  const visible=tasks.filter(task=>filter==="all"||(filter==="done"?task.done:!task.done));
  return <main><h1>Project Board</h1><p role="status">{remaining(tasks)} tasks left</p><ul>{visible.map(task=><li key={task.id}><button aria-pressed={task.done} onClick={()=>setTasks(items=>toggle(items,task.id))}>{task.done?"Undo ":"Complete "}{task.title}</button><button onClick={()=>setTasks(items=>items.filter(item=>item.id!==task.id))}>Remove {task.title}</button></li>)}</ul><form onSubmit={(event:{preventDefault():void})=>{event.preventDefault();if(title.trim()){setTasks(items=>[...items,{id:Date.now(),title:title.trim(),done:false}]);setTitle("");}}}><label htmlFor="new-title">New task</label><input id="new-title" value={title} onChange={(event:{target:{value:string}})=>setTitle(event.target.value)}/><button type="submit">Add task</button></form><label htmlFor="view">View</label><select id="view" value={filter} onChange={(event:{target:{value:string}})=>setFilter(event.target.value)}><option value="all">All</option><option value="active">Active</option><option value="done">Done</option></select></main>;
}`;
const budgetModel = `export type Expense={id:number;title:string;cents:number};
export function total(expenses:readonly Expense[]):number{return expenses.reduce((sum,expense)=>sum+expense.cents,0);}
export function addExpense(expenses:readonly Expense[],expense:Expense):Expense[]{if(!expense.title.trim()||!Number.isInteger(expense.cents)||expense.cents<=0||expenses.some(item=>item.id===expense.id))return [...expenses];return [...expenses,{...expense,title:expense.title.trim()}];}`;
const budgetApp = `"use client";
import { useState } from "react";
import { total, addExpense, type Expense } from "../lib/budget";
export default function Budget() {
  const [expenses,setExpenses]=useState<Expense[]>([{id:1,title:"Seeds",cents:450}]);
  const [title,setTitle]=useState("");
  const [amount,setAmount]=useState("");
  const [message,setMessage]=useState("");
  return <main><h1>Small Budget</h1><p role="status">Total: €{(total(expenses)/100).toFixed(2)}</p><button onClick={()=>setExpenses(items=>addExpense(items,{id:Date.now(),title:"Plant pot",cents:300}))}>Add a €3 plant pot</button><ul>{expenses.map(expense=><li key={expense.id}>{expense.title}: €{(expense.cents/100).toFixed(2)}<button onClick={()=>setExpenses(items=>items.filter(item=>item.id!==expense.id))}>Remove {expense.title}</button></li>)}</ul><form onSubmit={(event:{preventDefault():void})=>{event.preventDefault();const cents=Math.round(Number(amount)*100);if(!title.trim()||!Number.isFinite(cents)||cents<=0){setMessage("Enter a title and positive amount");return;}setExpenses(items=>addExpense(items,{id:Date.now(),title,cents}));setTitle("");setAmount("");setMessage("Expense added");}}><label htmlFor="expense-title">Expense title</label><input id="expense-title" value={title} onChange={(event:{target:{value:string}})=>setTitle(event.target.value)}/><label htmlFor="amount">Amount in euros</label><input id="amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event:{target:{value:string}})=>setAmount(event.target.value)}/><button>Add expense</button></form><p role="status">{message}</p></main>;
}`;

export const nextjsLessons = [
  lab(
    "nextjs",
    11,
    "Render data with stable keys",
    [
      "React turns an array of elements into a list. A key identifies each sibling across renders so state follows the correct item when rows are inserted, removed, or reordered. A database id is usually a better key than an array index.",
      "Keep the array as data and derive the JSX with map. A key is not passed as a normal prop, so pass the id separately if the child needs it. Use semantic list elements when the content is actually a list.",
    ],
    "Render a main heading and three keyed plant list items from a data array.",
    'const plants=[{id:"fern",name:"Fern"},{id:"mint",name:"Mint"},{id:"basil",name:"Basil"}];\nexport default function Page(){return <main><h1>Plants</h1></main>;}',
    'const plants=[{id:"fern",name:"Fern"},{id:"mint",name:"Mint"},{id:"basil",name:"Basil"}];\nexport default function Page(){return <main><h1>Plants</h1><ul>{plants.map(plant=><li key={plant.id}>{plant.name}</li>)}</ul></main>;}',
    [
      ["Render a semantic list", v(["main", "ul", "li"])],
      ["Render Basil from the collection", v(["li"], "Basil")],
      ["Render Mint too", v(["li"], "Mint")],
    ],
  ),
  lab(
    "nextjs",
    12,
    "An intentional empty state",
    [
      "Conditional rendering makes loading, empty, and populated screens explicit. An empty collection is not an error: explain what is missing and give the person a useful next action.",
      "Avoid a numeric expression such as items.length && <List/> because zero can appear in the rendered output. A ternary or a boolean comparison communicates the branches clearly.",
    ],
    "Build PlantList with an empty-state message and a populated list, then show the empty state on the page.",
    "export function PlantList({names}:{names:string[]}) {return <section/>;}\nexport default function Page(){return <main><PlantList names={[]}/></main>;}",
    "export function PlantList({names}:{names:string[]}){return names.length>0?<ul>{names.map(name=><li key={name}>{name}</li>)}</ul>:<section><h2>No plants yet</h2><p>Add your first plant to begin.</p></section>;}\nexport default function Page(){return <main><h1>Your collection</h1><PlantList names={[]}/></main>;}",
    [
      ["Show a useful empty state", v(["main", "h2"], "No plants yet")],
      ["Provide a next-step explanation", v(["p"], "Add your first plant")],
      [
        "Support populated input too",
        r('__text(exports.PlantList({names:["Fern"]})).includes("Fern")'),
      ],
    ],
  ),
  lab(
    "nextjs",
    13,
    "Controlled fields are state",
    [
      "A controlled input receives its value from React state and updates that state in onChange. The component becomes the source of truth for the field, which makes live previews and validation straightforward.",
      "Initialize text fields with an empty string rather than undefined so they stay controlled. Connect a visible label using htmlFor. Do not mutate the input element behind React's back to clear it; update state instead.",
    ],
    "Create a client component with a labeled name input and a greeting derived from its state, defaulting to gardener.",
    '"use client";\nimport {useState} from "react";\nexport default function Page(){return <main><h1>Hello</h1></main>;}',
    '"use client";\nimport {useState} from "react";\nexport default function Page(){const [name,setName]=useState("");return <main><label htmlFor="name">Your name</label><input id="name" value={name} onChange={(event:{target:{value:string}})=>setName(event.target.value)}/><h1>Hello, {name.trim()||"gardener"}</h1></main>;}',
    [
      ["Render a labeled input", v(["label", "input"])],
      ["Provide the initial greeting", v(["h1"], "Hello, gardener")],
      [
        "Update the controlled field on change",
        r(
          '(()=>{__state=[];let tree=__render();const input=__find(tree,"input");if(typeof input?.props.onChange!=="function")return false;input.props.onChange({target:{value:"Mira"}});tree=__render();return __text(tree).includes("Hello, Mira")})()',
        ),
      ],
    ],
  ),
  lab(
    "nextjs",
    14,
    "Derive values instead of syncing copies",
    [
      "If a value can be calculated from state during rendering, it usually does not need its own state. Storing both a collection and its count creates two values that can drift out of sync.",
      "Use a state update to change the source, then derive the total or filtered view on the next render. Functional updates read the latest prior state. Add memoization only when measurement shows the calculation is expensive.",
    ],
    "Create a client counter with one count state and a derived doubled value; increment both through one button.",
    '"use client";\nimport {useState} from "react";\nexport default function Page(){const [count,setCount]=useState(0);return <main><button>Grow</button></main>;}',
    '"use client";\nimport {useState} from "react";\nexport default function Page(){const [count,setCount]=useState(0);const doubled=count*2;return <main><p>Double: {doubled}</p><button onClick={()=>setCount(value=>value+1)}>Count: {count}</button></main>;}',
    [
      ["Show the initial derived value", v(["p"], "Double: 0")],
      ["Increment the source state", v(["button"], "Count: 1", 1)],
      ["Recalculate after two updates", v(["p"], "Double: 4", 2)],
    ],
  ),
  quiz("nextjs", 15, "Checkpoint · React foundations", [
    q(
      "Which key is most stable for reorderable saved records?",
      [
        "The array index",
        "A new random number on every render",
        "The record's persistent id",
        "The list length",
      ],
      2,
      "A stable record id keeps component identity attached to the correct data.",
    ),
    q(
      "What controls a controlled input?",
      [
        "React state through value and onChange",
        "Only its placeholder",
        "A CSS class",
        "The input's file name",
      ],
      0,
      "Value comes from state and onChange updates that same source of truth.",
    ),
    q(
      "Where should a cheap total derived from state usually live?",
      [
        "In a second synchronized state variable",
        "In the render calculation",
        "In localStorage on every render",
        "In a hidden input",
      ],
      1,
      "Derive it from the source data to avoid synchronization bugs.",
    ),
    q(
      "Why is items.length > 0 safer than items.length && JSX?",
      [
        "It prevents all errors",
        "It changes keys",
        "It is a server directive",
        "It avoids accidentally rendering numeric zero",
      ],
      3,
      "React can render the zero returned by the short-circuit expression.",
    ),
  ]),
  lab(
    "nextjs",
    16,
    "Fetch on the server boundary",
    [
      "An App Router page is a Server Component by default and may be async. It can await data before returning JSX. Keep private database access and service credentials behind that server boundary.",
      "The lesson uses an injected in-memory data source so the sandbox can check the page without making real requests. In a deployed Next.js page, replace that source with a server-side query or fetch and choose caching deliberately for your framework version.",
    ],
    "Export async loadPlants() with Fern and Mint, then await it in an async default page and render the names.",
    "export async function loadPlants():Promise<string[]>{return [];}\nexport default async function Page(){return <main/>;}",
    'export async function loadPlants():Promise<string[]>{return ["Fern","Mint"];}\nexport default async function Page(){const plants=await loadPlants();return <main><h1>Server garden</h1><ul>{plants.map(name=><li key={name}>{name}</li>)}</ul></main>;}',
    [
      [
        "Return server data",
        r('(await exports.loadPlants()).includes("Fern")'),
      ],
      ["Await data in the page", v(["main", "ul"], "Mint")],
      ["Keep a useful page heading", v(["h1"], "Server garden")],
    ],
  ),
  lab(
    "nextjs",
    17,
    "Resolve a dynamic route safely",
    [
      "A dynamic folder such as app/plants/[slug]/page.tsx makes a segment available as params. In the Next.js 15 App Router, params is asynchronous, so await it before reading the slug. A route parameter is still user-controlled input.",
      "Look up the record and handle a missing slug deliberately. A real page can call notFound() to render its route's not-found UI. This exercise tests the lookup helper with promise-based params so it stays runnable in isolation.",
    ],
    "Implement async resolvePlant(params) returning a known plant title or null for an unknown slug.",
    'const catalog:Record<string,string>={basil:"Basil",mint:"Mint"};\nexport async function resolvePlant(params:Promise<{slug:string}>):Promise<string|null>{return null;}\nexport default function Page(){return <main><h1>Dynamic routes</h1></main>;}',
    'const catalog:Record<string,string>={basil:"Basil",mint:"Mint"};\nexport async function resolvePlant(params:Promise<{slug:string}>):Promise<string|null>{const {slug}=await params;return Object.prototype.hasOwnProperty.call(catalog,slug)?catalog[slug]!:null;}\nexport default function Page(){return <main><h1>Dynamic routes</h1><p>Try basil, mint, and an unknown slug in the checks.</p></main>;}',
    [
      [
        "Resolve a known route",
        r(
          '(await exports.resolvePlant(Promise.resolve({slug:"basil"})))==="Basil"',
        ),
      ],
      [
        "Handle a missing route",
        r(
          '(await exports.resolvePlant(Promise.resolve({slug:"missing"})))===null',
        ),
      ],
      [
        "Reject inherited property names",
        r(
          '(await exports.resolvePlant(Promise.resolve({slug:"toString"})))===null',
        ),
      ],
    ],
    { filename: "app/plants/[slug]/page.tsx" },
  ),
  lab(
    "nextjs",
    18,
    "A route handler is an HTTP boundary",
    [
      "A route.ts file exports methods such as GET and POST. It returns a Response rather than JSX. HTTP status codes communicate whether the request succeeded, failed validation, or lacked permission.",
      "Parse inputs at the boundary and keep domain logic in a testable helper. The sandbox checks a plain response description instead of starting an HTTP server. The worked example shows how that description maps to Response.json in a real route handler.",
    ],
    "Export readLimit(raw) returning {status:200,limit} for integers 1–50, and {status:400,error} otherwise.",
    'type LimitResult={status:200;limit:number}|{status:400;error:string};\nexport function readLimit(raw:string):LimitResult{return {status:400,error:"TODO"};}\nexport default function Page(){return <main>Route handler workshop</main>;}',
    'type LimitResult={status:200;limit:number}|{status:400;error:string};\nexport function readLimit(raw:string):LimitResult{const limit=Number(raw);return Number.isInteger(limit)&&limit>=1&&limit<=50?{status:200,limit}:{status:400,error:"Limit must be 1–50"};}\n// In app/api/plants/route.ts: return Response.json(body, {status: body.status});\nexport default function Page(){return <main><h1>HTTP boundary</h1><p>Validate before querying.</p></main>;}',
    [
      [
        "Accept a valid page size",
        r(
          'exports.readLimit("20").status===200&&exports.readLimit("20").limit===20',
        ),
      ],
      [
        "Reject excessive or fractional limits",
        r(
          'exports.readLimit("51").status===400&&exports.readLimit("1.5").status===400',
        ),
      ],
      [
        "Reject empty and malformed limits",
        r(
          'exports.readLimit("").status===400&&exports.readLimit("many").status===400',
        ),
      ],
    ],
  ),
  lab(
    "nextjs",
    19,
    "Validate mutations before changing state",
    [
      "A Server Action or route mutation must validate submitted values on the server. A TypeScript annotation is not a runtime check. Return field-specific feedback for expected errors and only continue to persistence after validation succeeds.",
      "Treat form input as unknown at the validation boundary, normalize text, and enforce a sensible length. In a real Server Action, authenticate and authorize before writing; a hidden button is not an access-control rule.",
    ],
    "Export validateTitle(value:unknown) returning {ok:true,title} for trimmed 2–60 character strings or {ok:false,error}.",
    'type TitleResult={ok:true;title:string}|{ok:false;error:string};\nexport function validateTitle(value:unknown):TitleResult{return {ok:false,error:"TODO"};}\nexport default function Page(){return <main/>;}',
    'type TitleResult={ok:true;title:string}|{ok:false;error:string};\nexport function validateTitle(value:unknown):TitleResult{if(typeof value!=="string")return {ok:false,error:"Title is required"};const title=value.trim();return title.length>=2&&title.length<=60?{ok:true,title}:{ok:false,error:"Use 2–60 characters"};}\nexport default function Page(){return <main><h1>Safe mutations</h1><p>Validate, authorize, then persist.</p></main>;}',
    [
      [
        "Normalize a valid title",
        r('exports.validateTitle(" Fern ").title==="Fern"'),
      ],
      [
        "Reject invalid types",
        r("!exports.validateTitle(null).ok&&!exports.validateTitle(42).ok"),
      ],
      [
        "Enforce length boundaries",
        r(
          '!exports.validateTitle("x").ok&&!exports.validateTitle("x".repeat(61)).ok',
        ),
      ],
    ],
  ),
  quiz("nextjs", 20, "Checkpoint · server boundaries", [
    q(
      "Where should a private database credential be used?",
      [
        "In a NEXT_PUBLIC variable",
        "In a Client Component",
        "In a hidden input",
        "Only in server-side code",
      ],
      3,
      "Public client bundles and browser state must not contain private service credentials.",
    ),
    q(
      "How should Next.js 15 App Router params be read in an async page?",
      [
        "Await params before reading its values",
        "Read it from localStorage",
        "Parse the file name in the browser",
        "Use useState for the whole URL",
      ],
      0,
      "Promise-based params need awaiting. The route values still require domain validation.",
    ),
    q(
      "What does a route.ts GET handler return?",
      ["Only a React component", "A Response", "A CSS rule", "A Clerk key"],
      1,
      "Route handlers implement HTTP methods and return web responses.",
    ),
    q(
      "What must happen before a server mutation writes a user's data?",
      [
        "The button becomes green",
        "A client-side flag is checked",
        "Server validation and authorization",
        "The page title changes",
      ],
      2,
      "The server must establish both valid input and permission to change the target resource.",
    ),
  ]),
  lab(
    "nextjs",
    21,
    "Authorization belongs beside the data",
    [
      "Authentication establishes identity; authorization decides what that identity can do to a particular resource. Put the ownership or role check beside the server query or mutation so another route cannot accidentally bypass it.",
      "Never accept the acting user's id from a hidden form field as proof of identity. Use the server session, then check the resource owner. Tests should include unauthenticated, wrong-owner, and valid-owner cases.",
    ],
    "Export canEdit(userId,ownerId) and requireOwner(userId,ownerId), rejecting absent and mismatched users.",
    "export function canEdit(userId:string|null,ownerId:string):boolean{return false;}\nexport function requireOwner(userId:string|null,ownerId:string):void{}\nexport default function Page(){return <main/>;}",
    'export function canEdit(userId:string|null,ownerId:string):boolean{return !!userId&&userId===ownerId;}\nexport function requireOwner(userId:string|null,ownerId:string):void{if(!canEdit(userId,ownerId))throw Error("Forbidden");}\nexport default function Page(){return <main><h1>Ownership checks</h1><p>Derive identity from the server session.</p></main>;}',
    [
      ["Allow the owner", r('exports.canEdit("mira","mira")')],
      [
        "Reject absent or different users",
        r('!exports.canEdit(null,"mira")&&!exports.canEdit("other","mira")'),
      ],
      [
        "Enforce the rejection",
        r(
          '(()=>{try{exports.requireOwner("other","mira");return false}catch{return true}})()',
        ),
      ],
    ],
  ),
  lab(
    "nextjs",
    22,
    "Choose freshness deliberately",
    [
      "Caching depends on the framework version and configuration. In a Next.js 15 fetch call, you can explicitly request cache:no-store for fresh data or next:{revalidate:seconds} for time-based revalidation. Do not rely on a remembered default from another version.",
      "Personalized data needs particular care. A public cache key must not accidentally serve one person's private record to another. This exercise models the decision in a pure helper instead of pretending the simulator runs Next.js caching.",
    ],
    "Export fetchPolicy(privateData): use {cache:'no-store'} for private data and {next:{revalidate:300}} for public catalog data.",
    'export function fetchPolicy(privateData:boolean):{cache?:"no-store";next?:{revalidate:number}}{return {};}\nexport default function Page(){return <main/>;}',
    'export function fetchPolicy(privateData:boolean):{cache?:"no-store";next?:{revalidate:number}}{return privateData?{cache:"no-store"}:{next:{revalidate:300}};}\nexport default function Page(){return <main><h1>Freshness policy</h1><p>Explicit options for a Next.js 15 fetch call.</p></main>;}',
    [
      [
        "Keep private requests uncached",
        r('exports.fetchPolicy(true).cache==="no-store"'),
      ],
      [
        "Revalidate the public catalog",
        r("exports.fetchPolicy(false).next.revalidate===300"),
      ],
      [
        "Avoid conflicting policies",
        r("!exports.fetchPolicy(true).next&&!exports.fetchPolicy(false).cache"),
      ],
    ],
  ),
  lab(
    "nextjs",
    23,
    "Shareable pagination in the URL",
    [
      "Search and pagination belong in the URL when people should be able to share or revisit that state. A server page can parse searchParams, validate its values, and query only the requested slice of data.",
      "Normalize missing, malformed, and negative page values before querying. A client UI should preserve unrelated filters when changing page. This lab focuses on the parser and link builder so their behavior is deterministic in the sandbox.",
    ],
    "Export pageNumber(raw) with a positive-integer fallback of 1 and pageHref(page,query) with an encoded query.",
    'export function pageNumber(raw:string|undefined):number{return 1;}\nexport function pageHref(page:number,query:string):string{return "";}\nexport default function Page(){return <main/>;}',
    'export function pageNumber(raw:string|undefined):number{const n=Number(raw);return Number.isInteger(n)&&n>0?n:1;}\nexport function pageHref(page:number,query:string):string{return `/plants?page=${page}&q=${encodeURIComponent(query)}`;}\nexport default function Page(){return <main><h1>Shareable catalog</h1><a href={pageHref(2,"fern")}>Next page</a></main>;}',
    [
      ["Parse a valid page", r('exports.pageNumber("3")===3')],
      [
        "Normalize invalid values",
        r(
          'exports.pageNumber(undefined)===1&&exports.pageNumber("-2")===1&&exports.pageNumber("2.5")===1',
        ),
      ],
      [
        "Encode query values",
        r(
          'exports.pageHref(2,"fern & mint")==="/plants?page=2&q=fern%20%26%20mint"',
        ),
      ],
    ],
  ),
  lab(
    "nextjs",
    24,
    "Recover from an error",
    [
      "An error.tsx boundary is a Client Component that can offer a retry through its reset prop. Keep the visible message useful without exposing internal database errors or sensitive stack traces.",
      "Loading, empty, not-found, and unexpected-error screens solve different problems. A retry action belongs on a transient failure, while a missing record may need a route-level not-found page. This simulator exercises the retry UI, not the framework's error propagation.",
    ],
    "Build a client retry screen showing a useful error message and a button that changes the display to Retrying.",
    '"use client";\nimport {useState} from "react";\nexport default function Page(){return <main><h1>Something went wrong</h1></main>;}',
    '"use client";\nimport {useState} from "react";\nexport default function Page(){const [retrying,setRetrying]=useState(false);return <main><h1>{retrying?"Retrying":"Could not load your plants"}</h1><p>Your changes have not been discarded.</p><button onClick={()=>setRetrying(true)}>Try again</button></main>;}',
    [
      ["Explain the failure", v(["h1"], "Could not load your plants")],
      ["Provide a retry control", v(["button"], "Try again")],
      ["Respond to retry", v(["h1"], "Retrying", 1)],
    ],
    { kind: "project", duration: 22 },
  ),
  quiz("nextjs", 25, "Checkpoint · production thinking", [
    q(
      "What is authorization?",
      [
        "Choosing a username",
        "Deciding whether an identity may access a resource",
        "Adding a login button",
        "Setting a font",
      ],
      1,
      "A signed-in user is not automatically allowed to edit every resource.",
    ),
    q(
      "Where should a private resource's owner check happen?",
      [
        "Only in a disabled button",
        "Only after rendering",
        "Beside the server-side data operation",
        "Inside CSS",
      ],
      2,
      "The server data boundary must enforce permission regardless of which UI initiated the request.",
    ),
    q(
      "What makes URL-based filters useful?",
      [
        "They are shareable and restorable",
        "They prevent all API errors",
        "They replace a database",
        "They never need validation",
      ],
      0,
      "A URL can reproduce a view, but the server still validates its values.",
    ),
    q(
      "Should the simulator claim to test real Next.js caching or routing?",
      [
        "Yes",
        "Only for small arrays",
        "Only when the code compiles",
        "No, those need a running framework app",
      ],
      3,
      "The sandbox checks logic and JSX. Production routing, middleware, caching, and deployment need framework integration checks.",
    ),
  ]),
  lab(
    "nextjs",
    26,
    "Optimistic UI needs a rollback plan",
    [
      "An optimistic update shows the expected result before a request finishes. Keep a prior snapshot or a reversible operation so a failure can restore the UI. A pending flag should prevent an accidental duplicate submission.",
      "A pure transition helper makes the optimistic change testable. A real app still needs server validation, conflict handling, and a message if rollback occurs. Do not treat a fast animation as proof that the server accepted the write.",
    ],
    "Export optimisticAdd(items,title) and rollback(previous), returning a new list and restoring a copied previous list.",
    "export function optimisticAdd(items:string[],title:string):string[]{return items;}\nexport function rollback(previous:string[]):string[]{return [];}\nexport default function Page(){return <main/>;}",
    "export function optimisticAdd(items:string[],title:string):string[]{return title.trim()?[...items,title.trim()]:[...items];}\nexport function rollback(previous:string[]):string[]{return [...previous];}\nexport default function Page(){return <main><h1>Optimistic updates</h1><p>Keep a snapshot before the request.</p></main>;}",
    [
      [
        "Show the pending change immediately",
        r('exports.optimisticAdd(["Fern"]," Mint ")[1]==="Mint"'),
      ],
      [
        "Do not mutate earlier state",
        r(
          '(()=>{const a=["Fern"];exports.optimisticAdd(a,"Mint");return a.length===1})()',
        ),
      ],
      [
        "Restore a separate snapshot",
        r(
          '(()=>{const a=["Fern"];const b=exports.rollback(a);return b!==a&&b[0]==="Fern"})()',
        ),
      ],
    ],
  ),
  lab(
    "nextjs",
    27,
    "Generate metadata from the same model",
    [
      "A page's metadata should identify its actual content. A dynamic page can export generateMetadata and derive its title and description from the same server-side model used by the page. Avoid showing one title in the page and another in the browser tab.",
      "generateStaticParams lists known route params for pre-rendering, but it is not an authorization allowlist. Unknown paths and access checks still need deliberate handling. This lab tests the returned data shapes without starting a build.",
    ],
    "Export async generateMetadata with a specific title and description, plus generateStaticParams for basil and mint.",
    'export async function generateMetadata(){return {title:""};}\nexport function generateStaticParams(){return [];}\nexport default function Page(){return <main/>;}',
    'export async function generateMetadata(){return {title:"Field Notes — Herb Guide",description:"Practical care notes for kitchen herbs."};}\nexport function generateStaticParams(){return [{slug:"basil"},{slug:"mint"}];}\nexport default function Page(){return <main><h1>Field Notes</h1></main>;}',
    [
      [
        "Identify the page",
        r('(await exports.generateMetadata()).title.includes("Field Notes")'),
      ],
      [
        "Describe its content",
        r("(await exports.generateMetadata()).description.length>15"),
      ],
      [
        "Return the known route params",
        r(
          'exports.generateStaticParams().some(p=>p.slug==="basil")&&exports.generateStaticParams().some(p=>p.slug==="mint")',
        ),
      ],
    ],
  ),
  lab(
    "nextjs",
    28,
    "Test the rules below the component",
    [
      "A component can be difficult to exercise if its domain logic is buried inside event handlers. Export a pure helper for the rule and let the component translate clicks into calls to that helper.",
      "Test boundaries and repeated actions, not just the first happy path. A task toggle should be reversible, preserve unrelated items, and avoid mutating the input. UI tests then concentrate on whether the controls call the rule correctly.",
    ],
    "Export toggleTask(tasks,id), preserving other items and allowing two toggles to restore the original completion state.",
    "type Task={id:number;done:boolean};\nexport function toggleTask(tasks:Task[],id:number):Task[]{return tasks;}\nexport default function Page(){return <main/>;}",
    "type Task={id:number;done:boolean};\nexport function toggleTask(tasks:Task[],id:number):Task[]{return tasks.map(task=>task.id===id?{...task,done:!task.done}:task);}\nexport default function Page(){return <main><h1>Testable tasks</h1></main>;}",
    [
      [
        "Toggle the target",
        r("exports.toggleTask([{id:1,done:false}],1)[0].done"),
      ],
      [
        "Support a reversible action",
        r(
          "!exports.toggleTask(exports.toggleTask([{id:1,done:false}],1),1)[0].done",
        ),
      ],
      [
        "Preserve earlier state",
        r(
          "(()=>{const a=[{id:1,done:false}];exports.toggleTask(a,1);return !a[0].done})()",
        ),
      ],
    ],
  ),
  lab(
    "nextjs",
    29,
    "Compose small components",
    [
      "A component's props describe its reusable contract. Split repeated cards from the page that chooses the data and layout. A children slot can accept content without forcing the wrapper to know every detail of the nested UI.",
      "Keep client boundaries as narrow as practical: a server page can pass serializable data to an interactive child. Do not pass arbitrary server functions across that boundary. The final projects use separate model and component files.",
    ],
    "Create a typed StatCard and render two instances inside the page.",
    "function StatCard({label,value}:{label:string;value:number}){return <article/>;}\nexport default function Page(){return <main/>;}",
    'function StatCard({label,value}:{label:string;value:number}){return <article><h2>{label}</h2><p>{value}</p></article>;}\nexport default function Page(){return <main><h1>Garden overview</h1><StatCard label="Plants" value={12}/><StatCard label="Ready to harvest" value={3}/></main>;}',
    [
      ["Render composed articles", v(["main", "article"])],
      ["Pass the Plants label", v(["h2"], "Plants")],
      ["Render the second card", v(["p"], "Ready to harvest")],
    ],
  ),
  quiz("nextjs", 30, "Checkpoint · ready for a full app", [
    q(
      "What must an optimistic flow handle?",
      [
        "Only the first successful request",
        "Rollback or reconciliation when the request fails",
        "Only CSS transitions",
        "Never showing pending state",
      ],
      1,
      "The UI is provisional until the server confirms the mutation.",
    ),
    q(
      "Is generateStaticParams an authorization rule?",
      ["Yes", "Only for admin pages", "No", "Only when the route is dynamic"],
      2,
      "Pre-rendering decisions do not replace server-side access checks.",
    ),
    q(
      "What is a good unit-test target beneath a task component?",
      [
        "Its pure state transition helper",
        "The exact indentation",
        "The random id generated at runtime",
        "The CSS class order",
      ],
      0,
      "Behavioral input/output checks survive harmless UI refactors and catch rule errors.",
    ),
    q(
      "What should cross a server-to-client component boundary?",
      [
        "Database connection objects",
        "Private service tokens",
        "Arbitrary server closures",
        "Serializable props or explicitly supported framework references",
      ],
      3,
      "Use the framework's supported boundary values and keep private resources on the server.",
    ),
  ]),
  lab(
    "nextjs",
    31,
    "Capstone · a complete project board",
    [
      "Build a multi-file Next.js app with an App Router page, root layout, stylesheet, and reusable typed model. The page is a Client Component because it owns interaction; the model contains pure rules that are easy to test separately.",
      "The complete board adds, completes, removes, and filters tasks. Derive the remaining count instead of storing a duplicate. Stable task ids keep list identity aligned with the records, and accessible labels make the form useful with a keyboard.",
      "Run previews the component and Submit checks its model and state transitions. Download the project ZIP to run the full Next.js app locally. The simulator does not host Next.js routing or a database; authenticated persistence is an extension project.",
    ],
    "Finish Project Board across app/page.tsx, lib/tasks.ts, and app/globals.css. Complete tasks, add/remove tasks, switch filters, and show a live remaining count.",
    '"use client";\nimport {useState} from "react";\nimport {toggle,remaining,type Task} from "../lib/tasks";\nexport default function Board(){\n  const [tasks,setTasks]=useState<Task[]>([{id:1,title:"Plan the app",done:false},{id:2,title:"Build the UI",done:false},{id:3,title:"Test the edge cases",done:false}]);\n  return <main><h1>Project Board</h1><p>{remaining(tasks)} tasks left</p>{/* Build the board controls */}</main>;\n}',
    boardApp,
    [
      [
        "Render the complete board",
        v(["main", "h1", "ul", "form", "input", "select"]),
      ],
      ["Derive the initial count", v(["p"], "3 tasks left")],
      [
        "Complete a task through a real state handler",
        v(["p"], "2 tasks left", 1),
      ],
      ["Keep toggling reversible", v(["p"], "3 tasks left", 2)],
    ],
    {
      kind: "project",
      filename: "app/page.tsx",
      files: { ...projectConfig, "lib/tasks.ts": boardModel },
      projectBrief: [
        "Use the simulator to complete and undo a task.",
        "Download the ZIP, run npm install and npm run dev, and test adding, filtering, and deleting.",
        "Add Clerk ownership, Drizzle persistence, and server-side authorization as a further full-stack project.",
      ],
    },
  ),
  lab(
    "nextjs",
    32,
    "Capstone · a complete budget app",
    [
      "Build Small Budget as a multi-file application with a typed expense model, a live total, quick-add controls, form validation, and removal. Use integer cents in the model and format euro values at the UI boundary.",
      "Keep invalid input out of state and reject duplicate ids in the model. The form needs useful success and error feedback. A production expense app should persist records under an authenticated owner and validate every write on the server.",
      "Your project includes the layout, CSS, package manifest, TypeScript configuration, page, and model files. The in-app simulator checks rendering and button-driven state; download and run the project to exercise browser form entry and Next.js integration.",
    ],
    "Ship Small Budget: a working expense list with total, €3 quick-add action, custom expense form, removal, and validation.",
    '"use client";\nimport {useState} from "react";\nimport {total,addExpense,type Expense} from "../lib/budget";\nexport default function Budget(){const [expenses,setExpenses]=useState<Expense[]>([{id:1,title:"Seeds",cents:450}]);return <main><h1>Small Budget</h1><p>Total: €{(total(expenses)/100).toFixed(2)}</p>{/* Build the controls */}</main>;}',
    budgetApp,
    [
      [
        "Render the expense app and form",
        v(["main", "h1", "form", "input", "ul"]),
      ],
      ["Show the initial total", v(["p"], "€4.50")],
      ["Add an expense through state", v(["p"], "€7.50", 1)],
      ["Render the new expense", v(["li"], "Plant pot", 1)],
    ],
    {
      kind: "project",
      filename: "app/page.tsx",
      files: { ...projectConfig, "lib/budget.ts": budgetModel },
      projectBrief: [
        "Use the quick-add action and verify the new total.",
        "Download the ZIP and test custom expenses, invalid amounts, and removal in the running app.",
        "Extend the app with authenticated persistence, category budgets, and an exported monthly report.",
      ],
    },
  ),
];
