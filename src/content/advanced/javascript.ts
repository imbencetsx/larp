import { lab, run as r, q, quiz } from "./helpers";

const todoApp = `function updateTasks(tasks, action) {
  if (action.type === "add") {
    const title = action.title.trim();
    if (!title || tasks.some(task => task.id === action.id)) return tasks;
    return [...tasks, { id: action.id, title, done: false }];
  }
  if (action.type === "toggle") return tasks.map(task => task.id === action.id ? { ...task, done: !task.done } : task);
  if (action.type === "remove") return tasks.filter(task => task.id !== action.id);
  return tasks;
}
function visibleTasks(tasks, filter) {
  return tasks.filter(task => filter === "all" || (filter === "done" ? task.done : !task.done));
}
if (typeof document !== "undefined" && document.getElementById) {
  let tasks = [];
  let filter = "all";
  let nextId = 1;
  const list = document.getElementById("tasks");
  const form = document.getElementById("new-task");
  const title = document.getElementById("title");
  function render() {
    list.replaceChildren();
    for (const task of visibleTasks(tasks, filter)) {
      const row = document.createElement("li");
      const toggle = document.createElement("button");
      toggle.textContent = (task.done ? "✓ " : "○ ") + task.title;
      toggle.setAttribute("aria-pressed", String(task.done));
      toggle.onclick = () => { tasks = updateTasks(tasks, { type: "toggle", id: task.id }); render(); };
      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", "Remove " + task.title);
      remove.onclick = () => { tasks = updateTasks(tasks, { type: "remove", id: task.id }); render(); };
      row.append(toggle, remove);
      list.append(row);
    }
    document.getElementById("status").textContent = tasks.filter(task => task.done).length + " / " + tasks.length + " complete";
  }
  form.onsubmit = event => { event.preventDefault(); tasks = updateTasks(tasks, { type: "add", id: nextId++, title: title.value }); title.value = ""; render(); };
  document.getElementById("filter").onchange = event => { filter = event.target.value; render(); };
  render();
}
console.log(visibleTasks(updateTasks([], { type: "add", id: 1, title: "Ship my app" }), "active"));`;
const shopApp = `const products = [
  { id: "basil", name: "Basil", price: 450 },
  { id: "mint", name: "Mint", price: 350 },
  { id: "fern", name: "Fern", price: 1200 }
];
function changeCart(cart, id, delta) {
  if (!products.some(product => product.id === id)) return cart;
  const quantity = Math.max(0, (cart[id] || 0) + delta);
  const next = { ...cart };
  if (quantity === 0) delete next[id]; else next[id] = quantity;
  return next;
}
function cartTotal(cart) {
  return products.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0);
}
function searchProducts(query) {
  return products.filter(product => product.name.toLowerCase().includes(query.trim().toLowerCase()));
}
if (typeof document !== "undefined" && document.getElementById) {
  let cart = {};
  let query = "";
  const catalog = document.getElementById("catalog");
  const basket = document.getElementById("basket");
  function render() {
    catalog.replaceChildren(); basket.replaceChildren();
    for (const product of searchProducts(query)) {
      const card = document.createElement("article");
      const name = document.createElement("h2"); name.textContent = product.name;
      const price = document.createElement("p"); price.textContent = "€" + (product.price / 100).toFixed(2);
      const add = document.createElement("button"); add.textContent = "Add " + product.name;
      add.onclick = () => { cart = changeCart(cart, product.id, 1); render(); };
      card.append(name, price, add); catalog.append(card);
    }
    for (const product of products.filter(product => cart[product.id])) {
      const row = document.createElement("li"); row.textContent = product.name + " × " + cart[product.id];
      const remove = document.createElement("button"); remove.textContent = "Remove one " + product.name;
      remove.onclick = () => { cart = changeCart(cart, product.id, -1); render(); };
      row.append(remove); basket.append(row);
    }
    document.getElementById("total").textContent = "Total: €" + (cartTotal(cart) / 100).toFixed(2);
  }
  document.getElementById("search").oninput = event => { query = event.target.value; render(); };
  document.getElementById("clear").onclick = () => { cart = {}; render(); };
  render();
}
console.log(cartTotal(changeCart({}, "basil", 2)));`;

export const javascriptLessons = [
  lab(
    "javascript",
    11,
    "Destructure and supply defaults",
    [
      "Destructuring names the fields a function uses while defaults describe what to do when a property is undefined. A default does not replace null or an empty string. The rest operator collects remaining fields or items into a new object or array.",
      "Build a small display adapter instead of making every caller remember formatting rules. Test an explicit value, a missing optional value, and a different name. Keep the original object unchanged.",
    ],
    "Write labelPlant({ name, zone = 'indoor' }) returning name · zone.",
    "function labelPlant(plant) {\n  // Destructure the fields and apply the default\n}",
    'function labelPlant({ name, zone = "indoor" }) { return `${name} · ${zone}`; }\nconsole.log(labelPlant({ name: "Fern" }));',
    [
      [
        "Use the default zone",
        r('labelPlant({name:"Fern"}) === "Fern · indoor"'),
      ],
      [
        "Respect a supplied zone",
        r('labelPlant({name:"Basil",zone:"outdoor"}) === "Basil · outdoor"'),
      ],
      [
        "Keep the input intact",
        r(
          '(()=>{const p={name:"Mint"};labelPlant(p);return !Object.hasOwn(p,"zone")})()',
        ),
      ],
    ],
  ),
  lab(
    "javascript",
    12,
    "Update nested data without mutation",
    [
      "Spread makes a shallow copy. Updating a nested object requires copying each level you change; otherwise two versions still share the modified object. map is useful when only one array item changes.",
      "Immutable updates preserve earlier snapshots, making undo, debugging, and UI state easier. Return a new array, copy the matched plant, and preserve unrelated plant references. Test both a found id and an absent id.",
    ],
    "Write renamePlant(plants, id, name) without mutating the array or its objects.",
    "function renamePlant(plants, id, name) {\n  // Return updated copies\n}",
    "function renamePlant(plants, id, name) { return plants.map(plant => plant.id === id ? { ...plant, name } : plant); }",
    [
      [
        "Rename the matching record",
        r('renamePlant([{id:1,name:"Fern"}],1,"Mint")[0].name === "Mint"'),
      ],
      [
        "Preserve the original record",
        r(
          '(()=>{const p=[{id:1,name:"Fern"}];renamePlant(p,1,"Mint");return p[0].name==="Fern"})()',
        ),
      ],
      [
        "Keep unrelated object identity",
        r(
          '(()=>{const p={id:2,name:"Basil"};return renamePlant([p],1,"Mint")[0]===p})()',
        ),
      ],
    ],
  ),
  lab(
    "javascript",
    13,
    "Count with Map and deduplicate with Set",
    [
      "Map associates keys with values without treating names like __proto__ as object properties. Set stores unique values. Both preserve insertion order, which can make a predictable first-seen list easy to build.",
      "Use a Map for category counts and a Set for unique tags. Avoid quadratic repeated filtering when a single pass can count the collection. An empty input should produce an empty collection, not a missing result.",
    ],
    "Implement countTags(tags) returning a Map of counts and uniqueTags(tags) returning first-seen unique tags.",
    "function countTags(tags) { }\nfunction uniqueTags(tags) { }",
    "function countTags(tags) { const counts = new Map(); for (const tag of tags) counts.set(tag, (counts.get(tag) || 0) + 1); return counts; }\nfunction uniqueTags(tags) { return [...new Set(tags)]; }",
    [
      [
        "Count repeated tags",
        r('countTags(["sun","shade","sun"]).get("sun") === 2'),
      ],
      [
        "Deduplicate in insertion order",
        r(
          'JSON.stringify(uniqueTags(["sun","shade","sun"])) === JSON.stringify(["sun","shade"])',
        ),
      ],
      [
        "Handle empty input",
        r("countTags([]).size === 0 && uniqueTags([]).length === 0"),
      ],
    ],
  ),
  lab(
    "javascript",
    14,
    "Turn failures into useful results",
    [
      "JSON.parse throws when text is not valid JSON. Catch expected failures at the boundary and return a clear result shape. Catching every error and silently returning empty data can make real bugs invisible.",
      "Parsing is not validation: valid JSON can still contain the wrong shape. A plant list must be an array whose items have a string name. Return {ok:false,error} for malformed or invalid data and {ok:true,data} for valid data.",
    ],
    "Implement parsePlants(text) with a discriminated success/error result and validate every item's name.",
    "function parsePlants(text) {\n  // Parse, validate, and return a useful result\n}",
    'function parsePlants(text) { try { const data = JSON.parse(text); if (!Array.isArray(data) || !data.every(p => p && typeof p.name === "string")) return {ok:false,error:"Expected plants with names"}; return {ok:true,data}; } catch { return {ok:false,error:"Invalid JSON"}; } }',
    [
      [
        "Accept valid named plants",
        r('parsePlants(\'[ {"name":"Fern"} ]\').data[0].name === "Fern"'),
      ],
      ["Handle malformed JSON", r('parsePlants("{").ok === false')],
      [
        "Reject the wrong data shape",
        r(
          'parsePlants(\'[ {"name":42} ]\').ok === false && parsePlants("null").ok === false',
        ),
      ],
    ],
  ),
  quiz("javascript", 15, "Checkpoint · modern data handling", [
    q(
      "Does {...plant} deeply copy nested objects?",
      [
        "Always",
        "Only arrays",
        "No, it makes a shallow copy",
        "Only when frozen",
      ],
      2,
      "Nested references remain shared. Copy every level you change.",
    ),
    q(
      "Which preserves unique values in first-seen order?",
      ["Set", "JSON.parse", "Math.random", "Object.freeze"],
      0,
      "Set eliminates duplicate values and iterates in insertion order.",
    ),
    q(
      "What happens here?",
      [
        "zone becomes indoor",
        "zone stays null",
        "The function cannot run",
        "name becomes null",
      ],
      1,
      "A destructuring default applies to undefined, not null.",
      'const { zone = "indoor" } = { zone: null };',
    ),
    q(
      "What does successful JSON.parse guarantee?",
      [
        "A Plant object",
        "Safe HTML",
        "A non-empty array",
        "Only syntactically valid JSON",
      ],
      3,
      "You must still validate the shape and values required by your app.",
    ),
  ]),
  lab(
    "javascript",
    16,
    "Await a value and preserve errors",
    [
      "An async function always returns a promise. await unwraps a fulfilled promise and throws a rejected promise. Put the await inside try when the function must translate a failed dependency into an application result.",
      "Inject a loader function so the same logic can be tested without a network. This lab uses immediately settled promises in the sandbox; browser networking is intentionally unavailable there. Keep the successful value intact and return a fallback only on rejection.",
    ],
    "Write async loadName(loader) returning the loaded name or 'Unavailable' on rejection.",
    "async function loadName(loader) {\n  // Await the dependency and handle rejection\n}",
    'async function loadName(loader) { try { const plant = await loader(); return plant.name; } catch { return "Unavailable"; } }',
    [
      [
        "Await a successful loader",
        r('(await loadName(async()=>({name:"Fern"}))) === "Fern"'),
      ],
      [
        "Handle a rejected loader",
        r(
          '(await loadName(async()=>{throw Error("offline")})) === "Unavailable"',
        ),
      ],
      [
        "Use the dependency's current value",
        r('(await loadName(async()=>({name:"Basil"}))) === "Basil"'),
      ],
    ],
  ),
  lab(
    "javascript",
    17,
    "Coordinate independent requests",
    [
      "Promise.all starts from promises you create and fulfills with results in input order. If any input rejects, the combined promise rejects. For independent panels that should survive partial failure, Promise.allSettled reports every outcome instead.",
      "Avoid awaiting one independent operation before starting the next. Invoke both loaders, then await the pair. Tests can verify that both started and that the returned names still follow the requested order.",
    ],
    "Write async loadPair(loadFirst, loadSecond) to start both loaders and return their names in input order.",
    "async function loadPair(loadFirst, loadSecond) { }",
    "async function loadPair(loadFirst, loadSecond) { const [first, second] = await Promise.all([loadFirst(), loadSecond()]); return [first.name, second.name]; }",
    [
      [
        "Return both names in order",
        r(
          'JSON.stringify(await loadPair(async()=>({name:"Fern"}),async()=>({name:"Mint"})))===JSON.stringify(["Fern","Mint"])',
        ),
      ],
      [
        "Start both independent loaders before waiting",
        r(
          'await (async()=>{let secondStarted=false;await loadPair(()=>Promise.resolve().then(()=>{if(!secondStarted)throw Error("serial");return {name:"A"}}),()=>{secondStarted=true;return Promise.resolve({name:"B"})});return true})()',
        ),
      ],
      [
        "Propagate a dependency failure",
        r(
          'await (async()=>{try{await loadPair(async()=>{throw Error("failed")},async()=>({name:"B"}));return false}catch{return true}})()',
        ),
      ],
    ],
  ),
  lab(
    "javascript",
    18,
    "An API client you can test",
    [
      "A fetch promise can fulfill for HTTP errors such as 404. Check response.ok before treating the body as a successful result. JSON parsing is asynchronous, and the returned data still needs shape validation.",
      "Accept a request function as a dependency instead of reaching for a hidden global. The tests supply fake responses, so you can exercise success, HTTP failure, and bad data without network access or flaky timing.",
    ],
    "Write async getPlants(request): call /api/plants, reject failed responses, and require an array body.",
    "async function getPlants(request) { }",
    'async function getPlants(request) { const response = await request("/api/plants"); if (!response.ok) throw Error("Request failed"); const data = await response.json(); if (!Array.isArray(data)) throw Error("Expected an array"); return data; }',
    [
      [
        "Read the intended endpoint",
        r(
          'await (async()=>{let path="";const p=await getPlants(async(url)=>{path=url;return {ok:true,json:async()=>[{name:"Fern"}]}});return path==="/api/plants"&&p[0].name==="Fern"})()',
        ),
      ],
      [
        "Reject HTTP failure",
        r(
          "await (async()=>{try{await getPlants(async()=>({ok:false}));return false}catch{return true}})()",
        ),
      ],
      [
        "Reject an unexpected body",
        r(
          "await (async()=>{try{await getPlants(async()=>({ok:true,json:async()=>({})}));return false}catch{return true}})()",
        ),
      ],
    ],
  ),
  lab(
    "javascript",
    19,
    "Cache a computation with a closure",
    [
      "A closure retains access to the variables in the environment where it was created. A memoized function can keep a private Map of earlier results and avoid repeating a computation for the same key.",
      "Use cache.has(key), not a truthiness check, because a valid cached value might be 0, false, or an empty string. Cache policy also matters in real apps: unbounded maps grow forever, and stale data may need expiry or invalidation.",
    ],
    "Write memoize(fn) for a one-argument function, caching even falsy results without sharing caches between instances.",
    "function memoize(fn) { }",
    "function memoize(fn) { const cache = new Map(); return key => { if (!cache.has(key)) cache.set(key, fn(key)); return cache.get(key); }; }",
    [
      [
        "Reuse an earlier result",
        r(
          "(()=>{let n=0;const f=memoize(x=>{n++;return x*2});return f(3)===6&&f(3)===6&&n===1})()",
        ),
      ],
      [
        "Cache a zero result",
        r(
          '(()=>{let n=0;const f=memoize(()=>{n++;return 0});f("a");f("a");return n===1})()',
        ),
      ],
      [
        "Keep each cache independent",
        r("memoize(x=>x+1)(2)===3&&memoize(x=>x+2)(2)===4"),
      ],
    ],
  ),
  quiz("javascript", 20, "Checkpoint · async JavaScript", [
    q(
      "What does an async function return?",
      ["Always undefined", "A promise", "A thread", "Only strings"],
      1,
      "Returned values are wrapped in a promise; thrown errors become rejections.",
    ),
    q(
      "Does fetch reject automatically for an HTTP 404?",
      [
        "No, check response.ok",
        "Yes, every time",
        "Only if JSON is valid",
        "Only on desktop",
      ],
      0,
      "Network failures reject. HTTP error responses can fulfill and must be checked.",
    ),
    q(
      "What does Promise.all preserve?",
      [
        "Completion order",
        "Alphabetical order",
        "Input result order",
        "The fastest result only",
      ],
      2,
      "The results correspond to input positions even if operations settle in another order.",
    ),
    q(
      "Why test a cache with Map.has rather than if(cache.get(key))?",
      [
        "has sorts the keys",
        "get always throws",
        "Maps cannot store numbers",
        "Cached results can be falsy",
      ],
      3,
      "Falsy results such as 0 are still cached results and should not be recomputed.",
    ),
  ]),
  lab(
    "javascript",
    21,
    "Events without tight coupling",
    [
      "A small event emitter lets one part of an app publish a change without knowing every consumer. Store listeners in a Set and return an unsubscribe function so a screen can clean up its subscription when it leaves.",
      "Use a snapshot of listeners during emission when callbacks might subscribe or unsubscribe. Do not keep abandoned listeners forever. An event system is useful at boundaries, but direct function calls are often clearer inside a small component.",
    ],
    "Write createEmitter() with subscribe(listener), emit(value), and working unsubscribe.",
    "function createEmitter() { }",
    "function createEmitter() { const listeners = new Set(); return { subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }, emit(value) { for (const listener of [...listeners]) listener(value); } }; }",
    [
      [
        "Notify a subscriber",
        r(
          "(()=>{const e=createEmitter();let v=0;e.subscribe(n=>v=n);e.emit(4);return v===4})()",
        ),
      ],
      [
        "Unsubscribe cleanly",
        r(
          "(()=>{const e=createEmitter();let n=0;const off=e.subscribe(()=>n++);off();e.emit(1);return n===0})()",
        ),
      ],
      [
        "Keep emitters independent",
        r(
          "(()=>{const a=createEmitter(),b=createEmitter();let n=0;a.subscribe(()=>n++);b.emit(1);return n===0})()",
        ),
      ],
    ],
  ),
  lab(
    "javascript",
    22,
    "Persist data through a storage boundary",
    [
      "Browser storage stores strings. Serialize data deliberately and treat a stored value as untrusted input when reading it back. Old app versions, manual edits, and incomplete writes can leave unexpected data behind.",
      "Inject a storage object with getItem/setItem to keep the persistence adapter testable. Catch malformed JSON and use a fresh default array. Do not store credentials or assume local storage is a replacement for a server database.",
    ],
    "Implement saveTasks(storage, tasks) and readTasks(storage) using key tasks and an empty-array fallback.",
    "function saveTasks(storage, tasks) { }\nfunction readTasks(storage) { }",
    'function saveTasks(storage, tasks) { storage.setItem("tasks", JSON.stringify(tasks)); }\nfunction readTasks(storage) { try { const value = JSON.parse(storage.getItem("tasks") || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }',
    [
      [
        "Serialize under the tasks key",
        r(
          '(()=>{let key,value;saveTasks({setItem:(k,v)=>{key=k;value=v}},[{id:1}]);return key==="tasks"&&JSON.parse(value)[0].id===1})()',
        ),
      ],
      [
        "Restore a saved list",
        r("readTasks({getItem:()=>'[{\"id\":1}]'})[0].id===1"),
      ],
      [
        "Recover from broken or wrong-shape data",
        r(
          'readTasks({getItem:()=>"{"}).length===0&&readTasks({getItem:()=>"null"}).length===0',
        ),
      ],
    ],
  ),
  lab(
    "javascript",
    23,
    "Model a shopping cart as a reducer",
    [
      "A reducer takes the current state and an action and returns the next state. Keeping the transition pure separates business rules from button handlers and makes sequences of interactions easy to test.",
      "Choose a state shape that matches your operations. An object keyed by product id makes quantity updates straightforward. Clamp counts at zero, remove zero-quantity entries, and copy before changing anything.",
    ],
    "Write cartReducer(cart, action) for add/remove actions, removing a product when its quantity reaches zero.",
    "function cartReducer(cart, action) { }",
    'function cartReducer(cart, action) { if (action.type !== "add" && action.type !== "remove") return cart; const next = {...cart}; const count = Math.max(0,(cart[action.id] || 0) + (action.type === "add" ? 1 : -1)); if (count) next[action.id] = count; else delete next[action.id]; return next; }',
    [
      [
        "Add a unit",
        r('cartReducer({basil:1},{type:"add",id:"basil"}).basil===2'),
      ],
      [
        "Remove a zero-count product",
        r(
          '!Object.hasOwn(cartReducer({basil:1},{type:"remove",id:"basil"}),"basil")',
        ),
      ],
      [
        "Preserve earlier state",
        r(
          '(()=>{const c={basil:1};cartReducer(c,{type:"add",id:"basil"});return c.basil===1})()',
        ),
      ],
    ],
  ),
  lab(
    "javascript",
    24,
    "Validate a real signup payload",
    [
      "Validation converts loose external data into an explicit result. Start by checking types so string methods do not crash. Trim names, normalize email case, and report errors next to the fields that need attention.",
      "Keep normalization separate from acceptance. A non-empty display name is not enough if the product requires at least two characters. A basic email check is useful feedback but not proof of deliverability; production services still need verification.",
    ],
    "Write validateSignup(input) returning {ok,data} or {ok:false,errors}; require a 2+ character name and a basic email containing @ and a dot after it.",
    "function validateSignup(input) { }",
    'function validateSignup(input) { const name = typeof input.name === "string" ? input.name.trim() : ""; const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : ""; const errors={}; if(name.length<2)errors.name="Use at least two characters"; if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))errors.email="Use a valid email"; return Object.keys(errors).length ? {ok:false,errors} : {ok:true,data:{name,email}}; }',
    [
      [
        "Normalize valid data",
        r(
          'validateSignup({name:" Mira ",email:"MIRA@EXAMPLE.COM"}).data.email==="mira@example.com"',
        ),
      ],
      [
        "Report both invalid fields",
        r(
          '(()=>{const v=validateSignup({name:"x",email:"bad"});return !v.ok&&!!v.errors.name&&!!v.errors.email})()',
        ),
      ],
      [
        "Handle wrong input types",
        r("validateSignup({name:5,email:null}).ok===false"),
      ],
    ],
  ),
  quiz("javascript", 25, "Checkpoint · application boundaries", [
    q(
      "What must a subscription API let consumers do?",
      [
        "Modify every listener",
        "Disable errors globally",
        "Unsubscribe when done",
        "Use a global variable",
      ],
      2,
      "Cleanup avoids stale listeners and unexpected duplicate updates.",
    ),
    q(
      "What does localStorage store directly?",
      ["Strings", "Live functions", "DOM nodes", "Database connections"],
      0,
      "Use explicit serialization and validate parsed data when reading it.",
    ),
    q(
      "What makes a reducer easier to test?",
      [
        "Reading random globals",
        "Returning a new state from state and action",
        "Mutating the DOM",
        "Hiding its inputs",
      ],
      1,
      "Pure transitions can be tested as simple input/output sequences.",
    ),
    q(
      "Does a basic email pattern prove an address exists?",
      ["Yes", "Only for lowercase addresses", "Only if required is set", "No"],
      3,
      "Syntax checks improve feedback, while deliverability requires a separate verification flow.",
    ),
  ]),
  lab(
    "javascript",
    26,
    "Paginate without dropping records",
    [
      "Pagination turns a collection into stable windows. For a one-based page, the start index is (page-1)*pageSize and the end is start+pageSize. slice includes the start and excludes the end.",
      "Normalize page numbers to positive integers and reject a nonpositive page size. Do not mutate the input array. Test the first page, the short last page, and a page beyond the end.",
    ],
    "Write paginate(items, page, size), clamping page to at least 1 and throwing for size <= 0.",
    "function paginate(items, page, size) { }",
    'function paginate(items, page, size) { if(size<=0)throw Error("Positive size required"); const start=(Math.max(1,Math.floor(page))-1)*size; return items.slice(start,start+size); }',
    [
      [
        "Return the requested page",
        r('JSON.stringify(paginate([1,2,3,4,5],2,2))==="[3,4]"'),
      ],
      [
        "Handle a short final page and out-of-range page",
        r(
          'JSON.stringify(paginate([1,2,3],2,2))==="[3]"&&paginate([1],4,2).length===0',
        ),
      ],
      [
        "Validate size",
        r("(()=>{try{paginate([],1,0);return false}catch{return true}})()"),
      ],
    ],
  ),
  lab(
    "javascript",
    27,
    "Build a search pipeline",
    [
      "A search pipeline can normalize the query, filter matching records, and sort the resulting copy. Normalize both sides consistently. Keep display labels untouched so searching does not change the original capitalization.",
      "Array.sort mutates the array it receives. Filter creates a new array, so sorting that result is safe. Define behavior for an empty query and use localeCompare for human-facing names rather than numeric subtraction.",
    ],
    "Write searchPlants(plants, query) with trimmed case-insensitive matching and alphabetical results.",
    "function searchPlants(plants, query) { }",
    "function searchPlants(plants, query) { const q=query.trim().toLowerCase(); return plants.filter(p=>p.name.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name)); }",
    [
      [
        "Match without case or surrounding space",
        r(
          'searchPlants([{name:"Fern"},{name:"Mint"}]," FERN ")[0].name==="Fern"',
        ),
      ],
      [
        "Sort results alphabetically",
        r('searchPlants([{name:"Mint"},{name:"Basil"}],"")[0].name==="Basil"'),
      ],
      [
        "Preserve the source order",
        r(
          '(()=>{const p=[{name:"Mint"},{name:"Basil"}];searchPlants(p,"");return p[0].name==="Mint"})()',
        ),
      ],
    ],
  ),
  lab(
    "javascript",
    28,
    "Undo through state history",
    [
      "Undo needs a record of earlier states, not an attempt to reverse arbitrary side effects. A history object can keep past and present. Committing adds the old present to past; undo restores the last snapshot.",
      "Do not mutate the history arrays, and make undo on an empty history a safe no-op. Production editors also need redo, history limits, and a policy for grouping rapid edits into one meaningful user action.",
    ],
    "Implement commit(history, next) and undo(history) for {past:[],present:value}.",
    "function commit(history, next) { }\nfunction undo(history) { }",
    "function commit(history,next){return {past:[...history.past,history.present],present:next};}\nfunction undo(history){if(!history.past.length)return history;return {past:history.past.slice(0,-1),present:history.past[history.past.length-1]};}",
    [
      [
        "Commit a new snapshot",
        r('commit({past:[],present:"A"},"B").past[0]==="A"'),
      ],
      [
        "Undo a snapshot",
        r('undo(commit({past:[],present:"A"},"B")).present==="A"'),
      ],
      [
        "Leave empty history unchanged",
        r("(()=>{const h={past:[],present:1};return undo(h)===h})()"),
      ],
    ],
  ),
  lab(
    "javascript",
    29,
    "Write a small test runner",
    [
      "Useful tests verify behavior through examples and edge cases. A tiny runner can invoke named test functions and collect failures without stopping after the first thrown error. A passing test explicitly returns true in this lab.",
      "Keep production logic separate from the runner. Do not mark a test passed merely because it did not throw when its assertion returned false. The summary should make it clear which cases failed and why.",
    ],
    "Write runTests(cases) returning {passed,failed}; cases are {name,test} and failures include thrown errors or false results.",
    "function runTests(cases) { }",
    "function runTests(cases){let passed=0;const failed=[];for(const item of cases){try{if(item.test()===true)passed++;else failed.push(item.name);}catch{failed.push(item.name);}}return {passed,failed};}",
    [
      [
        "Count passing cases",
        r('runTests([{name:"sum",test:()=>2+2===4}]).passed===1'),
      ],
      [
        "Report false assertions",
        r('runTests([{name:"bad",test:()=>false}]).failed[0]==="bad"'),
      ],
      [
        "Keep running after an exception",
        r(
          'runTests([{name:"throws",test:()=>{throw Error()}},{name:"ok",test:()=>true}]).passed===1',
        ),
      ],
    ],
  ),
  quiz("javascript", 30, "Checkpoint · ship with confidence", [
    q(
      "What is the start index of page 3 with a page size of 10?",
      ["30", "3", "10", "20"],
      3,
      "One-based page 3 begins after two full pages: (3-1)*10=20.",
    ),
    q(
      "Which array method mutates its receiver?",
      ["filter", "sort", "map", "slice"],
      1,
      "Sort mutates. Sort a copy or a newly filtered array if earlier state must remain unchanged.",
    ),
    q(
      "What is a reliable basis for undo?",
      [
        "Saved state snapshots",
        "Re-running random handlers backward",
        "Reloading the page",
        "Deleting all state",
      ],
      0,
      "History restores known previous states instead of guessing how to reverse side effects.",
    ),
    q(
      "A test returns false without throwing. What should this lab's runner report?",
      ["Pass", "Skip", "Fail", "An empty result"],
      2,
      "Both explicit false assertions and thrown exceptions must be recorded as failures.",
    ),
  ]),
  lab(
    "javascript",
    31,
    "Capstone · a working task tracker",
    [
      "Build a complete browser app around a pure state model. The model adds, toggles, and removes tasks; the DOM layer renders that state and wires events. Keeping those layers separate lets the sandbox test the logic while you exercise the actual UI in Preview.",
      "Use textContent for task titles so typed input is displayed as text. Prevent form navigation, reject blank titles, keep stable ids, and announce the completion count through role=status. The filter should derive a view without deleting hidden tasks.",
      "The app is intentionally in-memory so it runs inside the isolated preview. Add a storage adapter when running the downloaded project locally, then test corrupted saved data and reload behavior using the earlier persistence lesson.",
    ],
    "Ship a task tracker with adding, toggling, removing, all/active/done filters, and a live completion count. Implement updateTasks and visibleTasks, then wire the provided HTML.",
    "function updateTasks(tasks, action) {\n  // Implement add, toggle, and remove without mutation\n}\nfunction visibleTasks(tasks, filter) {\n  // Return the selected view\n}\n// Wire the form, filter, and list to your model.",
    todoApp,
    [
      [
        "Add trimmed non-empty tasks",
        r(
          'updateTasks([],{type:"add",id:1,title:" Write "})[0].title==="Write"&&updateTasks([],{type:"add",id:1,title:" "}).length===0',
        ),
      ],
      [
        "Toggle without changing the original",
        r(
          '(()=>{const a=[{id:1,title:"A",done:false}];return updateTasks(a,{type:"toggle",id:1})[0].done&&!a[0].done})()',
        ),
      ],
      [
        "Remove and filter tasks",
        r(
          'updateTasks([{id:1}],{type:"remove",id:1}).length===0&&visibleTasks([{done:false},{done:true}],"active").length===1',
        ),
      ],
      [
        "Prevent duplicate task ids",
        r(
          'updateTasks([{id:1}],{type:"add",id:1,title:"Duplicate"}).length===1',
        ),
      ],
    ],
    {
      kind: "project",
      filename: "tasks.js",
      fixture:
        '<main><h1>Done, slowly.</h1><form id="new-task"><label for="title">New task</label><input id="title" name="title" required><button>Add task</button></form><label for="filter">Show tasks</label><select id="filter"><option value="all">All</option><option value="active">Active</option><option value="done">Done</option></select><p id="status" role="status"></p><ul id="tasks"></ul></main>',
      projectBrief: [
        "Add two tasks, complete one, and test every filter in Preview.",
        "Remove a task and confirm the count updates.",
        "Add persistence and undo as stretch goals in the downloaded project.",
      ],
    },
  ),
  lab(
    "javascript",
    32,
    "Capstone · a real shopping basket",
    [
      "Build a complete mini storefront with searchable products, quantity changes, removal, and a calculated total. Store money in integer cents to avoid common floating-point surprises during addition. The UI formats currency only when displaying it.",
      "Keep cart transitions immutable, reject ids that are not in the catalog, and remove entries when their quantity reaches zero. Derive the total from the trusted product prices rather than accepting a price from a button or user payload.",
      "The preview is a working client-side store demo, not a payment system. A production checkout must verify catalog prices and stock on the server. Your deliverable includes editable HTML, CSS, and JavaScript files.",
    ],
    "Ship Seed Supply with search, add/remove basket controls, a clear button, and a cents-based total. Implement changeCart, cartTotal, and searchProducts.",
    'const products = [{id:"basil",name:"Basil",price:450},{id:"mint",name:"Mint",price:350},{id:"fern",name:"Fern",price:1200}];\nfunction changeCart(cart,id,delta) { }\nfunction cartTotal(cart) { }\nfunction searchProducts(query) { }\n// Connect the catalog and basket UI.',
    shopApp,
    [
      [
        "Add quantities and derive a total in cents",
        r('cartTotal(changeCart({},"basil",2))===900'),
      ],
      [
        "Remove a product at zero",
        r('!Object.hasOwn(changeCart({basil:1},"basil",-1),"basil")'),
      ],
      [
        "Reject unknown catalog ids",
        r('Object.keys(changeCart({},"unknown",1)).length===0'),
      ],
      [
        "Search case-insensitively",
        r(
          'searchProducts(" MINT ").length===1&&searchProducts("mint")[0].id==="mint"',
        ),
      ],
      [
        "Preserve the previous cart",
        r(
          '(()=>{const cart={basil:1};changeCart(cart,"basil",1);return cart.basil===1})()',
        ),
      ],
    ],
    {
      kind: "project",
      filename: "store.js",
      fixture:
        '<main><h1>Seed Supply</h1><label for="search">Search plants</label><input id="search" type="search"><section id="catalog" aria-label="Products"></section><h2>Your basket</h2><ul id="basket"></ul><p id="total" role="status"></p><button id="clear">Clear basket</button></main>',
      projectBrief: [
        "Search, add two products, remove one unit, and clear the basket.",
        "Change the product HTML and stylesheet to make the store yours.",
        "Add stock limits and a server-verified checkout as a future extension.",
      ],
    },
  ),
];
