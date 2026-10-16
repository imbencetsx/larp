import { lab, run as r, q, quiz } from "./helpers";
const inventoryApp = `type Product = { id: string; name: string; price: number; stock: number };
type Change = { id: string; delta: number };
function adjustStock(items: readonly Product[], change: Change): Product[] {
  return items.map(item => item.id === change.id ? { ...item, stock: Math.max(0, item.stock + change.delta) } : item);
}
function inventoryValue(items: readonly Product[]): number {
  return items.reduce((sum, item) => sum + item.price * item.stock, 0);
}
function findProducts(items: readonly Product[], query: string): Product[] {
  return items.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase()));
}
if (typeof document !== "undefined") {
  let items: Product[] = [{id:"basil",name:"Basil",price:450,stock:3},{id:"mint",name:"Mint",price:350,stock:2}];
  const list = document.getElementById("inventory")!;
  const query = document.getElementById("query") as HTMLInputElement;
  function render(): void {
    list.replaceChildren();
    for (const item of findProducts(items, query.value)) {
      const row = document.createElement("article");
      const name = document.createElement("h2"); name.textContent = item.name;
      const count = document.createElement("p"); count.textContent = item.stock + " in stock · €" + (item.price / 100).toFixed(2);
      const add = document.createElement("button"); add.textContent = "Receive one " + item.name;
      add.onclick = () => { items = adjustStock(items, {id:item.id,delta:1}); render(); };
      const sell = document.createElement("button"); sell.textContent = "Sell one " + item.name; sell.disabled = item.stock === 0;
      sell.onclick = () => { items = adjustStock(items, {id:item.id,delta:-1}); render(); };
      row.append(name,count,add,sell); list.append(row);
    }
    document.getElementById("value")!.textContent = "Inventory value: €" + (inventoryValue(items)/100).toFixed(2);
  }
  query.oninput = render;
  render();
}
console.log(inventoryValue([{id:"basil",name:"Basil",price:450,stock:3}]));`;
const bookingApp = `type Session = { id: string; title: string; capacity: number; booked: number };
type BookingResult = { ok: true; sessions: Session[] } | { ok: false; error: string };
function reserve(sessions: readonly Session[], id: string, seats: number): BookingResult {
  const session = sessions.find(item => item.id === id);
  if (!session) return {ok:false,error:"Unknown session"};
  if (!Number.isInteger(seats) || seats < 1) return {ok:false,error:"Choose a positive whole number"};
  if (session.booked + seats > session.capacity) return {ok:false,error:"Not enough seats"};
  return {ok:true,sessions:sessions.map(item=>item.id===id?{...item,booked:item.booked+seats}:item)};
}
function seatsLeft(session: Session): number { return Math.max(0, session.capacity - session.booked); }
if (typeof document !== "undefined") {
  let sessions: Session[] = [{id:"seeds",title:"Seed starting",capacity:6,booked:0},{id:"pots",title:"Container gardens",capacity:4,booked:0}];
  const list = document.getElementById("sessions")!;
  const form = document.getElementById("booking") as HTMLFormElement;
  const choice = document.getElementById("session") as HTMLSelectElement;
  const seats = document.getElementById("seats") as HTMLInputElement;
  const status = document.getElementById("status")!;
  function render(): void {
    list.replaceChildren();
    for (const session of sessions) {
      const row=document.createElement("article");
      const heading=document.createElement("h2"); heading.textContent=session.title;
      const count=document.createElement("p"); count.textContent=seatsLeft(session)+" seats available";
      row.append(heading,count);list.append(row);
    }
  }
  form.onsubmit = event => { event.preventDefault(); const result=reserve(sessions,choice.value,Number(seats.value)); if(result.ok){sessions=result.sessions;status.textContent="Booking confirmed";render();}else status.textContent=result.error; };
  render();
}
console.log(reserve([{id:"seeds",title:"Seeds",capacity:6,booked:1}],"seeds",2));`;

export const typescriptLessons = [
  lab(
    "typescript",
    11,
    "Derive shapes with utility types",
    [
      "Pick selects a set of properties, Omit removes some, and Partial makes properties optional. These utility types preserve relationships to the original model so a renamed field cannot silently diverge across several hand-written copies.",
      "Optional updates need deliberate merge rules. Do not accept an id change just because you used Partial on the whole entity. Define a patch from only editable fields, and return a copied entity after applying it.",
    ],
    "Define Plant and PlantPatch = Partial<Pick<Plant,'name'|'zone'>>, then implement patchPlant while preserving the id.",
    "type Plant = { id: string; name: string; zone: string };\n// Define PlantPatch\nfunction patchPlant(plant: Plant, patch: PlantPatch): Plant {\n  return plant;\n}",
    'type Plant = { id: string; name: string; zone: string };\ntype PlantPatch = Partial<Pick<Plant, "name" | "zone">>;\nfunction patchPlant(plant: Plant, patch: PlantPatch): Plant { return {...plant,...patch}; }',
    [
      [
        "Apply a partial edit",
        r(
          'patchPlant({id:"a",name:"Fern",zone:"in"},{name:"Mint"}).name==="Mint"',
        ),
      ],
      [
        "Preserve omitted properties",
        r(
          'patchPlant({id:"a",name:"Fern",zone:"in"},{name:"Mint"}).zone==="in"',
        ),
      ],
      [
        "Do not mutate the entity",
        r(
          '(()=>{const p={id:"a",name:"Fern",zone:"in"};patchPlant(p,{name:"Mint"});return p.name==="Fern"})()',
        ),
      ],
    ],
  ),
  lab(
    "typescript",
    12,
    "Readonly is a design tool",
    [
      "readonly stops assignment through a typed reference; it does not freeze the runtime value or deeply protect every nested object. A readonly array can be read, filtered, and mapped, but it cannot be pushed into through that reference.",
      "Accepting readonly input communicates that the helper does not need to mutate its caller's collection. Return a new array when changing order. This gives callers more flexibility than demanding a mutable array.",
    ],
    "Write sortedNames(plants: readonly {name:string}[]): string[] without changing the source order.",
    "function sortedNames(plants: readonly {name:string}[]): string[] {\n  return [];\n}",
    "function sortedNames(plants: readonly {name:string}[]): string[] { return plants.map(p=>p.name).sort((a,b)=>a.localeCompare(b)); }",
    [
      [
        "Sort derived names",
        r(
          'JSON.stringify(sortedNames([{name:"Mint"},{name:"Basil"}]))===\'["Basil","Mint"]\'',
        ),
      ],
      [
        "Preserve input order",
        r(
          '(()=>{const p=[{name:"Mint"},{name:"Basil"}];sortedNames(p);return p[0].name==="Mint"})()',
        ),
      ],
      ["Handle an empty collection", r("sortedNames([]).length===0")],
    ],
  ),
  lab(
    "typescript",
    13,
    "Connect keys to their value types",
    [
      "keyof T is the union of keys in T. An indexed access T[K] describes the value at one of those keys. Together with K extends keyof T, a generic getter preserves the relationship between the chosen key and its result.",
      "Returning unknown or a broad union loses useful information. A typed getter should infer string for a name property and number for a stock property. It should reject a misspelled key before execution.",
    ],
    "Implement getField<T,K extends keyof T>(object:T,key:K):T[K] and use it with two different shapes.",
    'function getField<T, K extends keyof T>(object:T,key:K):T[K] {\n  throw Error("Implement the getter");\n}',
    'function getField<T,K extends keyof T>(object:T,key:K):T[K] { return object[key]; }\nconst stock:number=getField({stock:4},"stock");\nconst plantName:string=getField({name:"Fern"},"name");\nconsole.log(stock,plantName);',
    [
      ["Return a numeric field", r('getField({stock:4},"stock")===4')],
      ["Return a text field", r('getField({name:"Fern"},"name")==="Fern"')],
      [
        "Handle false without fallback coercion",
        r('getField({active:false},"active")===false'),
      ],
    ],
  ),
  lab(
    "typescript",
    14,
    "Mapped types for a form",
    [
      "A mapped type transforms each key of an existing type. { [K in keyof T]?: string } creates an optional string error for every field. Adding a field to the source model automatically makes its error key available.",
      "Use a real validation function to produce those errors. The type describes allowed keys but does not know whether a user's email is valid. Keep runtime checks and type-level modeling working together.",
    ],
    "Define Errors<T> and validateProfile({name,email}), returning field-specific errors for a blank name or email missing @.",
    "type Profile={name:string;email:string};\n// Define Errors<T>\nfunction validateProfile(profile:Profile):Errors<Profile> { return {}; }",
    'type Profile={name:string;email:string};\ntype Errors<T>={[K in keyof T]?:string};\nfunction validateProfile(profile:Profile):Errors<Profile>{const errors:Errors<Profile>={};if(!profile.name.trim())errors.name="Required";if(!profile.email.includes("@"))errors.email="Invalid email";return errors;}',
    [
      [
        "Report a missing name",
        r('!!validateProfile({name:" ",email:"a@b.com"}).name'),
      ],
      [
        "Report an invalid email",
        r('!!validateProfile({name:"Mira",email:"bad"}).email'),
      ],
      [
        "Accept valid fields",
        r(
          'Object.keys(validateProfile({name:"Mira",email:"a@b.com"})).length===0',
        ),
      ],
    ],
  ),
  quiz("typescript", 15, "Checkpoint · types from types", [
    q(
      "What does Partial<T> change?",
      [
        "Every property becomes readonly",
        "Every property becomes optional",
        "All values become strings",
        "The runtime object is copied",
      ],
      1,
      "Partial is a type transformation. It does not perform a runtime update.",
    ),
    q(
      "Does readonly freeze an object at runtime?",
      ["Always", "Only arrays", "No", "Only after compilation"],
      2,
      "Readonly restricts typed access. Use a runtime strategy if actual freezing is required.",
    ),
    q(
      "What does K extends keyof T constrain?",
      [
        "K must be a key of T",
        "T must be a number",
        "Every value must be K",
        "All keys must be optional",
      ],
      0,
      "The constraint links the key argument to actual properties of the object.",
    ),
    q(
      "Can a mapped error type validate an email at runtime?",
      [
        "Yes automatically",
        "Only with keyof",
        "Only in strict mode",
        "No, runtime logic is still required",
      ],
      3,
      "Types describe allowed structures. They are erased and cannot inspect external input by themselves.",
    ),
  ]),
  lab(
    "typescript",
    16,
    "Validate unknown data with a guard",
    [
      "unknown requires a check before use. A user-defined type predicate such as value is Plant communicates that a successful runtime check establishes the shape. The predicate is only as sound as its implementation.",
      "Check that the value is a non-null object before reading fields, then check each required field's type. Avoid asserting external data with as Plant: an assertion tells the compiler to trust you without verifying anything.",
    ],
    "Implement isPlant(value:unknown):value is Plant for a non-null object with string id/name and numeric stock.",
    "type Plant={id:string;name:string;stock:number};\nfunction isPlant(value:unknown):value is Plant { return false; }",
    'type Plant={id:string;name:string;stock:number};\nfunction isPlant(value:unknown):value is Plant { if(typeof value!=="object"||value===null)return false; const p=value as Record<string,unknown>;return typeof p.id==="string"&&typeof p.name==="string"&&typeof p.stock==="number"; }',
    [
      ["Recognize a valid plant", r('isPlant({id:"a",name:"Fern",stock:4})')],
      ["Reject null and primitives", r('!isPlant(null)&&!isPlant("Fern")')],
      [
        "Reject missing or mistyped fields",
        r('!isPlant({id:"a",name:"Fern",stock:"4"})&&!isPlant({name:"Fern"})'),
      ],
    ],
  ),
  lab(
    "typescript",
    17,
    "Return an explicit result union",
    [
      "A discriminated union models success and failure as different states. A shared literal property such as ok lets TypeScript narrow the result, making data available only on success and error available only on failure.",
      "Use the result to express expected business failures, such as an invalid quantity, instead of throwing for every user mistake. Keep exceptions for unexpected failures or choose one consistent policy at a boundary.",
    ],
    "Define Result<T> and parseQuantity(text), accepting only positive whole numbers and returning a descriptive error otherwise.",
    'type Result<T> = {ok:true;data:T}|{ok:false;error:string};\nfunction parseQuantity(text:string):Result<number> { return {ok:false,error:"Implement me"}; }',
    'type Result<T>={ok:true;data:T}|{ok:false;error:string};\nfunction parseQuantity(text:string):Result<number>{const n=Number(text);return Number.isInteger(n)&&n>0?{ok:true,data:n}:{ok:false,error:"Use a positive whole number"};}',
    [
      [
        "Parse a positive quantity",
        r('(()=>{const v=parseQuantity("4");return v.ok&&v.data===4})()'),
      ],
      [
        "Reject zero and fractions",
        r('!parseQuantity("0").ok&&!parseQuantity("1.5").ok'),
      ],
      [
        "Reject malformed input with a message",
        r(
          '(()=>{const v=parseQuantity("many");return !v.ok&&v.error.length>0})()',
        ),
      ],
    ],
  ),
  lab(
    "typescript",
    18,
    "A generic asynchronous boundary",
    [
      "Promise<T> describes a future value of T. A generic wrapper can preserve the result type while translating a rejected operation into a Result<T>. The catch value is unknown under strict checking.",
      "Narrow an error with instanceof Error before reading message. This wrapper accepts a function rather than an already-started promise so it also catches a synchronous throw when starting the operation.",
    ],
    "Write attempt<T>(operation:()=>Promise<T>):Promise<Result<T>> and preserve successful values and error messages.",
    'type Result<T>={ok:true;data:T}|{ok:false;error:string};\nasync function attempt<T>(operation:()=>Promise<T>):Promise<Result<T>> { return {ok:false,error:"TODO"}; }',
    'type Result<T>={ok:true;data:T}|{ok:false;error:string};\nasync function attempt<T>(operation:()=>Promise<T>):Promise<Result<T>>{try{return {ok:true,data:await operation()};}catch(error){return {ok:false,error:error instanceof Error?error.message:"Unknown failure"};}}',
    [
      [
        "Preserve a successful value",
        r(
          "await (async()=>{const x=await attempt(async()=>42);return x.ok&&x.data===42})()",
        ),
      ],
      [
        "Translate an Error rejection",
        r(
          'await (async()=>{const x=await attempt(async()=>{throw Error("offline")});return !x.ok&&x.error==="offline"})()',
        ),
      ],
      [
        "Handle non-Error throws",
        r(
          'await (async()=>{const x=await attempt(async()=>{throw "oops"});return !x.ok&&x.error.length>0})()',
        ),
      ],
    ],
  ),
  lab(
    "typescript",
    19,
    "Overloads that preserve call intent",
    [
      "Function overloads describe different valid call shapes while sharing one implementation. Callers see the overload signatures rather than the broad implementation signature. They are useful when input and output types are related in distinct ways.",
      "Prefer a simple union when all callers receive the same result type. Here a string id returns one label while an array of ids returns an array, so overloads retain the useful result distinction.",
    ],
    "Overload label for a string or string[], returning Plant: id labels of the corresponding shape.",
    'function label(value:string):string;\nfunction label(value:string[]):string[];\nfunction label(value:string|string[]):string|string[] { return ""; }',
    "function label(value:string):string;\nfunction label(value:string[]):string[];\nfunction label(value:string|string[]):string|string[]{return Array.isArray(value)?value.map(id=>`Plant: ${id}`):`Plant: ${value}`;}",
    [
      ["Label a single id", r('label("fern")==="Plant: fern"')],
      [
        "Label a list",
        r(
          'JSON.stringify(label(["fern","mint"]))===\'["Plant: fern","Plant: mint"]\'',
        ),
      ],
      ["Preserve empty arrays", r("label([]).length===0")],
    ],
  ),
  quiz("typescript", 20, "Checkpoint · safe boundaries", [
    q(
      "Which is safest for raw external data?",
      [
        "any",
        "unknown followed by runtime checks",
        "as Plant without checks",
        "A comment",
      ],
      1,
      "Unknown prevents using the value before you establish its shape.",
    ),
    q(
      "What makes a type predicate trustworthy?",
      [
        "Its name",
        "Using as twice",
        "A complete runtime check of its claimed shape",
        "A longer return type",
      ],
      2,
      "The compiler trusts the predicate. Its implementation must actually establish the promised facts.",
    ),
    q(
      "How does a Result union expose its successful data safely?",
      [
        "By narrowing on its discriminator",
        "By ignoring failures",
        "By replacing all errors with null",
        "By removing strict mode",
      ],
      0,
      "Checking ok distinguishes the success member from the failure member.",
    ),
    q(
      "When are overloads useful here?",
      [
        "For every function",
        "To skip implementation",
        "To prevent promises",
        "When distinct input shapes imply distinct result types",
      ],
      3,
      "Overloads preserve the relation callers need; a plain union is simpler when the result shape is the same.",
    ),
  ]),
  lab(
    "typescript",
    21,
    "Exhaustiveness with never",
    [
      "After handling every member of a discriminated union, the remaining value should be never. A helper accepting never makes a missing branch a compile-time error when a new event is added later.",
      "Model each event with only the data it needs. An increment carries an amount, while reset does not. A switch can narrow each event and return the appropriate next state without optional fields and defensive guesses.",
    ],
    "Implement counter(state,event) for increment, decrement, and reset using an exhaustive never helper.",
    'type CounterEvent={type:"increment";amount:number}|{type:"decrement";amount:number}|{type:"reset"};\nfunction assertNever(value:never):never { throw Error("Unhandled event"); }\nfunction counter(state:number,event:CounterEvent):number { return state; }',
    'type CounterEvent={type:"increment";amount:number}|{type:"decrement";amount:number}|{type:"reset"};\nfunction assertNever(value:never):never{throw Error("Unhandled event");}\nfunction counter(state:number,event:CounterEvent):number{switch(event.type){case "increment":return state+event.amount;case "decrement":return state-event.amount;case "reset":return 0;default:return assertNever(event);}}',
    [
      [
        "Increment by the event amount",
        r('counter(3,{type:"increment",amount:2})===5'),
      ],
      [
        "Decrement by the event amount",
        r('counter(3,{type:"decrement",amount:2})===1'),
      ],
      [
        "Reset independent of earlier state",
        r('counter(99,{type:"reset"})===0'),
      ],
    ],
  ),
  lab(
    "typescript",
    22,
    "Encapsulate a small domain object",
    [
      "A class combines state and behavior when the product has an object with meaningful invariants. Private state should only change through methods that enforce those invariants. Do not expose a setter that bypasses the rules you just defined.",
      "A stock counter cannot go negative. Check quantities before changing state and return whether a sale succeeded. Use a getter to expose the current stock without giving callers a direct mutation point.",
    ],
    "Implement Stock with a private quantity, current getter, receive(amount), and sell(amount):boolean; reject nonpositive or fractional amounts.",
    "class Stock {\n  private quantity = 0;\n  get current():number { return this.quantity; }\n  receive(amount:number):void { }\n  sell(amount:number):boolean { return false; }\n}",
    "class Stock{private quantity=0;get current():number{return this.quantity;}receive(amount:number):void{if(Number.isInteger(amount)&&amount>0)this.quantity+=amount;}sell(amount:number):boolean{if(!Number.isInteger(amount)||amount<=0||amount>this.quantity)return false;this.quantity-=amount;return true;}}",
    [
      [
        "Receive valid units",
        r("(()=>{const s=new Stock();s.receive(5);return s.current===5})()"),
      ],
      [
        "Prevent overselling",
        r(
          "(()=>{const s=new Stock();s.receive(2);return !s.sell(3)&&s.current===2})()",
        ),
      ],
      [
        "Reject invalid amounts",
        r(
          "(()=>{const s=new Stock();s.receive(-1);s.receive(1.5);return !s.sell(-1)&&s.current===0})()",
        ),
      ],
    ],
  ),
  lab(
    "typescript",
    23,
    "A typed repository contract",
    [
      "An interface can express the small part of a dependency your code needs. A repository contract might expose get(id), list(), and put(entity). The application can use an in-memory implementation in tests and a database-backed implementation in production.",
      "Use a generic constraint for entities that have a string id. Return undefined when an id is absent rather than inventing a record. Make list return a fresh array so callers cannot modify the repository's own collection structure.",
    ],
    "Implement createRepository<T extends {id:string}> with put, get, and list using a Map.",
    "function createRepository<T extends {id:string}>() {\n  // Return a typed repository\n  return { put(value:T):void {}, get(id:string):T|undefined { return undefined; }, list():T[] { return []; } };\n}",
    "function createRepository<T extends {id:string}>(){const items=new Map<string,T>();return {put(value:T):void{items.set(value.id,value);},get(id:string):T|undefined{return items.get(id);},list():T[]{return [...items.values()];}};}",
    [
      [
        "Store and retrieve an entity",
        r(
          '(()=>{const repo=createRepository();repo.put({id:"a",name:"Fern"});return repo.get("a").name==="Fern"})()',
        ),
      ],
      [
        "Replace an existing id",
        r(
          '(()=>{const repo=createRepository();repo.put({id:"a"});repo.put({id:"a",name:"Mint"});return repo.list().length===1})()',
        ),
      ],
      [
        "Represent a missing id",
        r('createRepository().get("missing")===undefined'),
      ],
    ],
  ),
  lab(
    "typescript",
    24,
    "A state machine for loading",
    [
      "An application cannot be loading, successful, and failed all at once. A state union makes those combinations explicit: idle, loading, success with data, or error with a message. This removes ambiguous collections of unrelated booleans.",
      "Render from the state rather than checking if data happens to be truthy. An empty successful list is still a success and deserves an intentional empty message. A pending state must not show an earlier error by accident.",
    ],
    "Define LoadState and statusText(state) for idle, loading, success with string[] data, and error with a message.",
    'type LoadState={status:"idle"}|{status:"loading"}|{status:"success";data:string[]}|{status:"error";message:string};\nfunction statusText(state:LoadState):string { return ""; }',
    'type LoadState={status:"idle"}|{status:"loading"}|{status:"success";data:string[]}|{status:"error";message:string};\nfunction statusText(state:LoadState):string{switch(state.status){case "idle":return "Ready";case "loading":return "Loading";case "success":return state.data.length?`${state.data.length} plants`:"No plants yet";case "error":return state.message;}}',
    [
      [
        "Describe pending and idle states",
        r(
          'statusText({status:"idle"})==="Ready"&&statusText({status:"loading"})==="Loading"',
        ),
      ],
      [
        "Distinguish empty success",
        r('statusText({status:"success",data:[]})==="No plants yet"'),
      ],
      [
        "Show a useful error",
        r('statusText({status:"error",message:"Offline"})==="Offline"'),
      ],
    ],
  ),
  quiz("typescript", 25, "Checkpoint · domain modeling", [
    q(
      "Why pass an unhandled union member to a never parameter?",
      [
        "To suppress errors",
        "To check exhaustiveness as the union grows",
        "To mutate it",
        "To compile it as a string",
      ],
      1,
      "A missing branch leaves a non-never type and produces a diagnostic.",
    ),
    q(
      "Where should a stock class enforce its nonnegative invariant?",
      [
        "In every caller only",
        "In CSS",
        "In its state-changing methods",
        "In a comment",
      ],
      2,
      "Encapsulation is useful when its own methods preserve the object's rules.",
    ),
    q(
      "What does a small repository interface enable?",
      [
        "Swappable test and production implementations",
        "Automatic database backups",
        "Unlimited memory",
        "Runtime type erasure prevention",
      ],
      0,
      "Code depends on a contract rather than one storage implementation.",
    ),
    q(
      "Why is a state union clearer than loading/error/data booleans?",
      [
        "It is shorter in every case",
        "It removes every runtime bug",
        "It avoids async code",
        "It rules out impossible combinations structurally",
      ],
      3,
      "Each member carries only the fields valid for that state.",
    ),
  ]),
  lab(
    "typescript",
    26,
    "Validate a configuration with satisfies",
    [
      "The satisfies operator checks that a value conforms to a type while retaining a useful inferred type for the expression. It is different from an annotation that can widen the entire value to the annotated type.",
      "Use a union of route names as the key set of a Record so a missing or extra route is visible during editing. Values should remain ordinary runtime data; satisfies performs no runtime validation on a downloaded configuration.",
    ],
    "Create routes satisfying Record<'home'|'catalog'|'account',string> and routeFor(name) returning the correct paths.",
    'type RouteName="home"|"catalog"|"account";\n// Define routes with satisfies\nfunction routeFor(name:RouteName):string { return ""; }',
    'type RouteName="home"|"catalog"|"account";\nconst routes={home:"/",catalog:"/plants",account:"/account"} satisfies Record<RouteName,string>;\nfunction routeFor(name:RouteName):string{return routes[name];}',
    [
      ["Resolve home", r('routeFor("home")==="/"')],
      ["Resolve catalog", r('routeFor("catalog")==="/plants"')],
      ["Resolve account", r('routeFor("account")==="/account"')],
    ],
  ),
  lab(
    "typescript",
    27,
    "Template literal types for events",
    [
      "Template literal types combine string literals at the type level. A union such as `${Entity}:${Action}` creates a controlled family of event names. The runtime still needs to construct the correct string.",
      "Use the pattern for compact conventions like event names, translation keys, or CSS tokens. Avoid building an enormous type-level language when a plain object model would communicate the same intent more clearly.",
    ],
    "Define EventName from plant/cart and created/updated, then implement eventName(entity,action).",
    'type Entity="plant"|"cart";\ntype Action="created"|"updated";\n// Define EventName\nfunction eventName(entity:Entity,action:Action):EventName { throw Error("TODO"); }',
    'type Entity="plant"|"cart";\ntype Action="created"|"updated";\ntype EventName=`${Entity}:${Action}`;\nfunction eventName(entity:Entity,action:Action):EventName{return `${entity}:${action}`;}',
    [
      [
        "Build a creation event",
        r('eventName("plant","created")==="plant:created"'),
      ],
      [
        "Build a cart update event",
        r('eventName("cart","updated")==="cart:updated"'),
      ],
      [
        "Keep both dimensions",
        r('eventName("plant","updated")==="plant:updated"'),
      ],
    ],
  ),
  lab(
    "typescript",
    28,
    "Narrow optional values deliberately",
    [
      "An optional property may be undefined. Optional chaining stops when the receiver is nullish, and nullish coalescing supplies a fallback only for null or undefined. Unlike ||, it preserves meaningful zeroes and empty strings.",
      "Design the fallback around your domain. A user with zero credits should still show zero, while a missing credit field can show the product's default. Do not use a non-null assertion just to avoid deciding what missing data means.",
    ],
    "Implement creditsFor(profile?) preserving zero credits and defaulting a missing value to 10.",
    "type Profile={wallet?:{credits?:number}};\nfunction creditsFor(profile?:Profile):number { return 10; }",
    "type Profile={wallet?:{credits?:number}};\nfunction creditsFor(profile?:Profile):number{return profile?.wallet?.credits ?? 10;}",
    [
      ["Preserve zero", r("creditsFor({wallet:{credits:0}})===0")],
      ["Read a supplied balance", r("creditsFor({wallet:{credits:25}})===25")],
      [
        "Handle missing nested values",
        r("creditsFor()===10&&creditsFor({})===10"),
      ],
    ],
  ),
  lab(
    "typescript",
    29,
    "Parse a versioned saved document",
    [
      "Saved data is an external boundary even if your own app wrote it earlier. A version field gives future readers a way to migrate older documents or reject unsupported formats explicitly.",
      "Parse into unknown, verify the version and payload shape, and only then return a typed document. Catch malformed JSON separately from unsupported versions if the product needs distinct recovery guidance. Never let a type assertion stand in for validation.",
    ],
    "Implement readDocument(text) returning {version:1,title:string} or null for malformed, unsupported, or invalid data.",
    "type DocumentV1={version:1;title:string};\nfunction readDocument(text:string):DocumentV1|null { return null; }",
    'type DocumentV1={version:1;title:string};\nfunction readDocument(text:string):DocumentV1|null{try{const value:unknown=JSON.parse(text);if(typeof value!=="object"||value===null)return null;const d=value as Record<string,unknown>;return d.version===1&&typeof d.title==="string"?{version:1,title:d.title}:null;}catch{return null;}}',
    [
      [
        "Accept a supported document",
        r(
          'readDocument(\'{"version":1,"title":"Field notes"}\').title==="Field notes"',
        ),
      ],
      [
        "Reject a future version",
        r('readDocument(\'{"version":2,"title":"Future"}\')===null'),
      ],
      [
        "Reject malformed and mistyped data",
        r(
          'readDocument("{")===null&&readDocument(\'{"version":1,"title":3}\')===null',
        ),
      ],
    ],
  ),
  quiz("typescript", 30, "Checkpoint · maintainable TypeScript", [
    q(
      "Does satisfies transform data at runtime?",
      ["Yes", "Only in production", "No", "Only for arrays"],
      2,
      "It checks compatibility during type checking. It does not validate external runtime values.",
    ),
    q(
      "What does 0 ?? 10 evaluate to?",
      ["10", "0", "undefined", "An error"],
      1,
      "Nullish coalescing preserves zero because zero is not null or undefined.",
    ),
    q(
      "What is the main purpose of a saved document's version?",
      [
        "Guide migration and compatibility handling",
        "Encrypt the document",
        "Make JSON valid",
        "Force every app to update",
      ],
      0,
      "A version lets readers recognize a format and choose a deliberate migration or rejection path.",
    ),
    q(
      "Which TypeScript habit is most useful at a JSON boundary?",
      [
        "Use any everywhere",
        "Add ! to every property",
        "Assume your app wrote valid data",
        "Parse as unknown and validate",
      ],
      3,
      "Types disappear at runtime. Validation establishes that the incoming value matches the model.",
    ),
  ]),
  lab(
    "typescript",
    31,
    "Capstone · typed inventory studio",
    [
      "Build a complete inventory app with typed product data, immutable stock changes, a search view, and a derived stock value. The business model stays independent of the DOM so it can be checked with several product sets.",
      "The browser layer uses explicit DOM element types and renders all labels as text. Receiving and selling update one source of truth, and sold-out controls become disabled. Keep money in integer cents until formatting the visible total.",
      "The preview runs the compiled TypeScript against the HTML and CSS companion files. The sandbox checks the model without a browser. Production stock adjustments need a server transaction so two buyers cannot both consume the last item.",
    ],
    "Ship Inventory Studio with receive/sell controls, search, no negative stock, immutable updates, and a derived inventory value.",
    "type Product={id:string;name:string;price:number;stock:number};\ntype Change={id:string;delta:number};\nfunction adjustStock(items:readonly Product[],change:Change):Product[]{return [];}\nfunction inventoryValue(items:readonly Product[]):number{return 0;}\nfunction findProducts(items:readonly Product[],query:string):Product[]{return [];}\n// Add the typed browser controls.",
    inventoryApp,
    [
      [
        "Receive stock",
        r(
          'adjustStock([{id:"a",name:"A",price:100,stock:2}],{id:"a",delta:3})[0].stock===5',
        ),
      ],
      [
        "Clamp stock at zero",
        r(
          'adjustStock([{id:"a",name:"A",price:100,stock:1}],{id:"a",delta:-4})[0].stock===0',
        ),
      ],
      [
        "Derive cents-based value",
        r('inventoryValue([{id:"a",name:"A",price:450,stock:3}])===1350'),
      ],
      [
        "Search without mutating data",
        r(
          'findProducts([{id:"a",name:"Basil",price:1,stock:1}]," BASIL ").length===1',
        ),
      ],
    ],
    {
      kind: "project",
      filename: "inventory.ts",
      fixture:
        '<main><h1>Inventory Studio</h1><label for="query">Find a product</label><input id="query" type="search"><section id="inventory" aria-label="Inventory"></section><p id="value" role="status"></p></main>',
      projectBrief: [
        "Sell stock down to zero and inspect the disabled control.",
        "Search while changing a product's stock.",
        "Extend the repository lesson into a persistence layer outside the preview.",
      ],
    },
  ),
  lab(
    "typescript",
    32,
    "Capstone · a typed reservation app",
    [
      "A reservation app combines a typed catalog, domain constraints, explicit error states, a form, and a changing availability view. Model a reservation as a Result so the UI must handle both confirmation and a useful failure message.",
      "Validate whole positive seat counts and reject requests over capacity before returning a copied session list. The UI derives remaining seats from capacity minus booked. An unknown session must fail instead of silently creating one.",
      "This complete local prototype runs in the preview. A real booking backend must apply capacity checks and updates atomically in a database transaction, authorize the request, and decide how cancellation works.",
    ],
    "Ship Workshop Desk: choose a session, reserve seats, show live availability, reject invalid counts and overbooking, and display typed success/error results.",
    'type Session={id:string;title:string;capacity:number;booked:number};\ntype BookingResult={ok:true;sessions:Session[]}|{ok:false;error:string};\nfunction reserve(sessions:readonly Session[],id:string,seats:number):BookingResult{return {ok:false,error:"TODO"};}\nfunction seatsLeft(session:Session):number{return 0;}\n// Connect the form using typed DOM elements.',
    bookingApp,
    [
      [
        "Reserve available capacity",
        r(
          '(()=>{const x=reserve([{id:"a",title:"A",capacity:6,booked:1}],"a",2);return x.ok&&x.sessions[0].booked===3})()',
        ),
      ],
      [
        "Reject overbooking",
        r('!reserve([{id:"a",title:"A",capacity:2,booked:1}],"a",2).ok'),
      ],
      [
        "Reject unknown ids and fractional counts",
        r(
          '!reserve([],"x",1).ok&&!reserve([{id:"a",title:"A",capacity:6,booked:0}],"a",1.5).ok',
        ),
      ],
      [
        "Calculate remaining seats",
        r('seatsLeft({id:"a",title:"A",capacity:6,booked:2})===4'),
      ],
    ],
    {
      kind: "project",
      filename: "reservations.ts",
      fixture:
        '<main><h1>Workshop Desk</h1><section id="sessions" aria-label="Available sessions"></section><form id="booking"><label for="session">Session</label><select id="session"><option value="seeds">Seed starting</option><option value="pots">Container gardens</option></select><label for="seats">Seats</label><input id="seats" type="number" min="1" step="1" value="1" required><button>Reserve seats</button></form><p id="status" role="status"></p></main>',
      projectBrief: [
        "Reserve the last seats and attempt one more reservation.",
        "Try an invalid count and verify that capacity stays unchanged.",
        "Add cancellation and test it as a new discriminated action.",
      ],
    },
  ),
];
