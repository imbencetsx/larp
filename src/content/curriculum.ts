export type TrackId = "html" | "css" | "javascript" | "typescript" | "nextjs";
export type LessonCheck =
  | {
      kind: "html";
      selector: string;
      text?: string;
      attribute?: string;
      value?: string;
    }
  | { kind: "css"; selector: string; property: string; value: string }
  | { kind: "runtime"; expression: string }
  | {
      kind: "next";
      tags?: string[];
      text?: string;
      directive?: string;
      clicks?: number;
      button?: string;
    };
export type QuizQuestion = {
  prompt: string;
  code?: string;
  choices: string[];
  answer: number;
  explanation: string;
};
export type Lesson = {
  id: string;
  track: TrackId;
  number: number;
  title: string;
  duration: number;
  objective: string;
  paragraphs: string[];
  example: string;
  exampleNote: string;
  task: string;
  requirements: string[];
  starter: string;
  solution: string;
  hints: string[];
  recap: string;
  filename: string;
  checks?: LessonCheck[];
  kind?: "exercise" | "quiz" | "project";
  chapter?: string;
  quiz?: QuizQuestion[];
  fixture?: string;
  projectBrief?: string[];
  files?: Record<string, string>;
};
export type Track = {
  id: TrackId;
  name: string;
  short: string;
  description: string;
  color: string;
  level: string;
  prerequisite: string;
  plant: string;
};
export const tracks: Track[] = [
  {
    id: "html",
    name: "HTML",
    short: "</>",
    description: "Give your ideas a home on the web.",
    color: "peach",
    level: "Start here",
    prerequisite: "No experience needed",
    plant: "Daisy",
  },
  {
    id: "css",
    name: "CSS",
    short: "#",
    description: "A little style. A lot of possibility.",
    color: "lavender",
    level: "Beginner",
    prerequisite: "HTML basics",
    plant: "Lavender",
  },
  {
    id: "javascript",
    name: "JavaScript",
    short: "JS",
    description: "Bring your creations to life.",
    color: "yellow",
    level: "Beginner",
    prerequisite: "HTML and CSS basics",
    plant: "Sunflower",
  },
  {
    id: "typescript",
    name: "TypeScript",
    short: "TS",
    description: "Write code with a little more confidence.",
    color: "blue",
    level: "Intermediate",
    prerequisite: "JavaScript basics",
    plant: "Bluebell",
  },
  {
    id: "nextjs",
    name: "Next.js",
    short: "N",
    description: "Turn small ideas into real applications.",
    color: "stone",
    level: "Intermediate",
    prerequisite: "JavaScript, TypeScript, and React basics",
    plant: "Rose",
  },
];
const firstLessons: Lesson[] = [
  {
    id: "html-1",
    track: "html",
    number: 1,
    title: "Hello, little web",
    duration: 6,
    objective: "Create your first HTML document and put a heading on the page.",
    paragraphs: [
      "Every website begins with a little structure. HTML (HyperText Markup Language) describes what is on a page: headings, paragraphs, images, and more.",
      "Tags wrap content in angle brackets. Most have an opening tag and a closing tag. The head holds information about the page; the body holds what your visitors see.",
      "Start with <!DOCTYPE html> so the browser uses modern HTML. Give your page a title inside head, then add a heading inside body.",
    ],
    example: "<p>A short note.</p>",
    exampleNote:
      "An opening tag starts an element; the matching closing tag ends it. Apply that pattern to the elements requested in the task.",
    task: "Plant your first idea. Create an HTML document with a page title and a visible main heading that says Hello, LARP!",
    requirements: [
      "Declare the HTML doctype",
      "Add a non-empty title inside head",
      "Put an h1 saying Hello, LARP! inside body",
    ],
    starter:
      '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <!-- Give your page a title -->\n  </head>\n  <body>\n    <!-- Say hello with an h1 -->\n  </body>\n</html>',
    solution:
      '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>My LARP garden</title>\n  </head>\n  <body>\n    <h1>Hello, LARP!</h1>\n  </body>\n</html>',
    hints: [
      "The browser-tab title belongs in the document’s head; visible page content belongs in its body.",
      "Use the main-heading element for the greeting. Check its text against the task, including punctuation.",
    ],
    recap:
      "HTML gives a page structure. The head describes it, and the body contains its visible content.",
    filename: "index.html",
  },
  {
    id: "html-2",
    track: "html",
    number: 2,
    title: "Words that go places",
    duration: 7,
    objective:
      "Build a readable page with a heading, a paragraph, and a useful link.",
    paragraphs: [
      "Headings give your content a hierarchy. Use h1 for the main heading and h2 for a section. Paragraphs belong inside p elements.",
      "An anchor element, a, creates a link. Its href attribute is the destination; the text between its tags tells people where it goes.",
      "Useful link text describes the destination. ‘Explore the garden’ is more helpful than ‘Click here’.",
    ],
    example: '<a href="https://example.com">Visit the library</a>',
    exampleNote:
      "The href is the destination, and the text between the tags describes the link. Build the rest of the journal yourself.",
    task: "Make a tiny garden journal with a main heading, a section heading, a paragraph, and a link to MDN at https://developer.mozilla.org.",
    requirements: [
      "Add a non-empty h1 and h2",
      "Write a paragraph",
      "Add a descriptive link to https://developer.mozilla.org",
    ],
    starter:
      "<h1>My garden journal</h1>\n<!-- Add a section heading, a paragraph, and a link -->",
    solution:
      '<h1>My garden journal</h1>\n<h2>Day one</h2>\n<p>Today I planted my first seed of code.</p>\n<a href="https://developer.mozilla.org">Explore web documentation</a>',
    hints: [
      "Choose heading levels that show the journal’s main topic and its section.",
      "An anchor needs a destination attribute and meaningful link text. Use the destination from the task.",
    ],
    recap:
      "Headings organize ideas, paragraphs explain them, and anchors connect them to the wider web.",
    filename: "journal.html",
  },
  {
    id: "css-1",
    track: "css",
    number: 1,
    title: "A splash of green",
    duration: 6,
    objective:
      "Use a CSS selector to change the appearance of an HTML element.",
    paragraphs: [
      "HTML is the structure. CSS (Cascading Style Sheets) is the presentation. A CSS rule selects elements and sets properties on them.",
      "A rule has a selector followed by curly braces. Inside, each declaration pairs a property with a value, separated by a colon.",
      'A class selector starts with a dot. The selector .plant matches an element with class="plant". Let’s give our plant a little color.',
    ],
    example:
      ".notice {\n  color: navy;\n  /* Add another declaration here. */\n}",
    exampleNote:
      "A declaration pairs a property with a value. Choose the selector, properties, and values from your task.",
    task: "Style the .plant card. Make its text green and its background #eef4e8. The preview already contains the HTML.",
    requirements: [
      "Select .plant",
      "Set color to green or #008000",
      "Set background-color to #eef4e8",
    ],
    starter: ".plant {\n  /* Give this plant its colors */\n}",
    solution: ".plant {\n  color: green;\n  background-color: #eef4e8;\n}",
    hints: [
      "Find the class used by the preview card and write declarations inside its rule.",
      "Text color and background color use separate properties. Match their values to the requirements.",
    ],
    recap:
      "Selectors choose elements. Declarations describe how those elements should look.",
    filename: "styles.css",
  },
  {
    id: "css-2",
    track: "css",
    number: 2,
    title: "Room to grow",
    duration: 8,
    objective: "Use the box model to add space inside and outside a card.",
    paragraphs: [
      "Every HTML element is a box. From the inside out, it has content, padding, a border, and margin.",
      "Padding creates breathing room between the content and border. Margin separates the element from its neighbors.",
      "With box-sizing: border-box, a declared width includes padding and borders. This makes layouts much easier to predict.",
    ],
    example:
      ".note {\n  padding: 8px;\n  /* Which property creates space outside the box? */\n}",
    exampleNote:
      "Padding creates inner space. Work out the remaining box-model properties and sizes from the requirements.",
    task: "Give .plant a 240px total width, 24px of padding, 16px of margin, and a 2px solid border. Use border-box sizing.",
    requirements: [
      "Set box-sizing to border-box and width to 240px",
      "Set padding to 24px and margin to 16px",
      "Add a 2px solid border",
    ],
    starter:
      ".plant {\n  background: #eef4e8;\n  /* Make room for your plant */\n}",
    solution:
      ".plant {\n  background: #eef4e8;\n  box-sizing: border-box;\n  width: 240px;\n  padding: 24px;\n  margin: 16px;\n  border: 2px solid #52734d;\n}",
    hints: [
      "Padding adds space inside a box; margin adds space outside it.",
      "Check which sizing mode includes padding and borders in the declared width. A border needs a width, a style, and a color.",
    ],
    recap:
      "The box model controls space. Border-box keeps an element’s total width predictable.",
    filename: "styles.css",
  },
  {
    id: "javascript-1",
    track: "javascript",
    number: 1,
    title: "Meet your variables",
    duration: 7,
    objective: "Store values in variables and print a message to the console.",
    paragraphs: [
      "JavaScript adds behavior to your pages. Let’s begin with values: a string is text, and a number is a numeric value.",
      "A variable gives a value a name. Use const when you will not reassign the variable, and let when the value needs to change.",
      "console.log() prints values to the console. Template literals use backticks and ${...} to put values inside a string.",
    ],
    example:
      'const city = "Oslo";\n// How would you print a message using this value?',
    exampleNote:
      "Text values use quotes. Store the lesson’s values in your own variables, then build the requested message.",
    task: "Create a variable called plant with the value Fern and a variable called leaves with the number 4. Print Fern has 4 leaves. to the console.",
    requirements: [
      "plant equals the string Fern",
      "leaves equals the number 4",
      "Log exactly: Fern has 4 leaves.",
    ],
    starter: "// Create your variables here\n\n// Print your plant’s update\n",
    solution:
      'const plant = "Fern";\nconst leaves = 4;\nconsole.log(`${plant} has ${leaves} leaves.`);',
    hints: [
      "Declare one variable for the plant’s text name and another for its numeric leaf count.",
      "Build the message from those variables, then send it to the console. Check spaces and punctuation.",
    ],
    recap:
      "Variables name values. Strings hold text, numbers hold quantities, and console.log helps you see results.",
    filename: "garden.js",
  },
  {
    id: "javascript-2",
    track: "javascript",
    number: 2,
    title: "A little plant logic",
    duration: 9,
    objective: "Write a reusable function that makes a decision.",
    paragraphs: [
      "A function is a reusable set of instructions. Parameters are inputs, and return sends a result back to the caller.",
      "An if statement chooses a path based on a condition. The < operator means ‘less than’.",
      "Try your function with different values. Checking both sides of a condition catches mistakes that one example might miss.",
    ],
    example:
      "function greet(name) {\n  return `Hi, ${name}`;\n}\n// Where would a condition go if the result depended on the input?",
    exampleNote:
      "A parameter supplies the input and return supplies the result. Decide how your function should handle each side of the boundary.",
    task: 'Write a function called waterPlant(moisture). Return "Water me" when moisture is less than 30; otherwise return "I am happy". Log a sample call.',
    requirements: [
      "waterPlant is callable",
      'Returns "Water me" for moisture below 30',
      'Returns "I am happy" for moisture of 30 or more',
    ],
    starter:
      "function waterPlant(moisture) {\n  // What does your plant need?\n}\n\nconsole.log(waterPlant(15));",
    solution:
      'function waterPlant(moisture) {\n  if (moisture < 30) {\n    return "Water me";\n  }\n  return "I am happy";\n}\n\nconsole.log(waterPlant(15));',
    hints: [
      "Compare the function’s input with the task’s threshold and choose a return value for each outcome.",
      "Test a value below the threshold, the threshold itself, and a value above it. Every path should return a result.",
    ],
    recap:
      "Functions make behavior reusable. Conditions let the same function respond to different inputs.",
    filename: "watering.js",
  },
  {
    id: "typescript-1",
    track: "typescript",
    number: 1,
    title: "Give values a type",
    duration: 8,
    objective: "Add type annotations and catch a mistake before code runs.",
    paragraphs: [
      "TypeScript builds on JavaScript with a type system. It checks whether values are used consistently before your program runs.",
      "A type annotation follows a name and a colon. string means text, number means a numeric value, and boolean means true or false.",
      "Types disappear when TypeScript compiles to JavaScript. They help you while writing code without changing how values work at runtime.",
    ],
    example:
      "const distance: number = 12;\n// A value must match the type written after the colon.",
    exampleNote:
      "Inspect each annotation in the editor, then choose the right kind of value. Keep numbers and booleans distinct from strings.",
    task: "Fix the types below. Use explicit string, number, and boolean annotations. Set plantName to Fern, leafCount to 4, and isHealthy to true.",
    requirements: [
      "plantName is explicitly typed string and equals Fern",
      "leafCount is explicitly typed number and equals 4",
      "isHealthy is explicitly typed boolean and equals true",
    ],
    starter:
      'const plantName: string = 42;\nconst leafCount: number = "four";\nconst isHealthy: boolean = "yes";\n\nconsole.log(plantName, leafCount, isHealthy);',
    solution:
      'const plantName: string = "Fern";\nconst leafCount: number = 4;\nconst isHealthy: boolean = true;\n\nconsole.log(plantName, leafCount, isHealthy);',
    hints: [
      "Compare the kind of each value with its annotation. Quoted digits are still text.",
      "A boolean has two possible values and uses neither quotes nor a numeric substitute.",
    ],
    recap:
      "TypeScript checks your values before execution. Type annotations communicate intent and catch mismatches.",
    filename: "plant.ts",
  },
  {
    id: "typescript-2",
    track: "typescript",
    number: 2,
    title: "A blueprint for plants",
    duration: 10,
    objective: "Describe an object with a type and use it in a typed function.",
    paragraphs: [
      "Object types describe the shape of a value: which properties it has, and what types those properties hold.",
      "A type alias gives that shape a reusable name. You can then annotate objects and function parameters with it.",
      "A function’s return type appears after its parameter list. Together, parameter and return types make its contract clear.",
    ],
    example:
      "type Address = {\n  street: string;\n  postcode: string;\n};\n// How would a function accept an Address as its parameter?",
    exampleNote:
      "A type alias describes an object’s properties. Apply that idea to your own type and function signature.",
    task: 'Define a Plant type with name: string and leaves: number. Write describePlant(plant: Plant): string to return "Fern has 4 leaves" for { name: "Fern", leaves: 4 }.',
    requirements: [
      "Define a Plant object type with name and leaves",
      "Type the describePlant parameter and return value",
      "Return the correct description for different plants",
    ],
    starter:
      '// Define the Plant type\n\nfunction describePlant(plant) {\n  // Return a description\n}\n\nconsole.log(describePlant({ name: "Fern", leaves: 4 }));',
    solution:
      'type Plant = {\n  name: string;\n  leaves: number;\n};\n\nfunction describePlant(plant: Plant): string {\n  return `${plant.name} has ${plant.leaves} leaves`;\n}\n\nconsole.log(describePlant({ name: "Fern", leaves: 4 }));',
    hints: [
      "Describe each property in an object type, then use that type on the function’s parameter.",
      "Build the returned sentence from the parameter’s properties and give the function an explicit return type.",
    ],
    recap:
      "Object types model data. Typed functions document which data they accept and which results they return.",
    filename: "plants.ts",
  },
  {
    id: "nextjs-1",
    track: "nextjs",
    number: 1,
    title: "A page of your own",
    duration: 9,
    objective: "Understand file-based routing and export a page component.",
    paragraphs: [
      "Next.js is a React framework. This track assumes you understand React components and JSX, the HTML-like syntax used inside JavaScript.",
      "In the App Router, a page.tsx file defines a route. app/page.tsx is the home page; app/garden/page.tsx becomes /garden.",
      "A page exports its component as default. A layout wraps pages and stays shared across routes. The root layout contains the html and body elements.",
    ],
    example:
      "export default function NotesPage() {\n  return (\n    <section>\n      {/* Add content for this route here. */}\n    </section>\n  );\n}",
    exampleNote:
      "A page file exports its route component. Choose the semantic elements and heading required for your garden page.",
    task: "In app/garden/page.tsx, default-export a function component that returns a main element containing an h1 with the text My garden.",
    requirements: [
      "Default-export a function component",
      "Return a main element",
      "Include an h1 that says My garden",
    ],
    starter:
      "export default function GardenPage() {\n  return (\n    <main>\n      {/* Add your page heading */}\n    </main>\n  );\n}",
    solution:
      "export default function GardenPage() {\n  return (\n    <main>\n      <h1>My garden</h1>\n    </main>\n  );\n}",
    hints: [
      "Keep the default export so the router can find the page component.",
      "Inside the page’s main region, add the main-heading element and use the heading text requested by the task.",
    ],
    recap:
      "Folders define routes, page files define route content, and layouts provide a shared wrapper.",
    filename: "app/garden/page.tsx",
  },
  {
    id: "nextjs-2",
    track: "nextjs",
    number: 2,
    title: "Make it interactive",
    duration: 10,
    objective: "Create a client component with state and an event handler.",
    paragraphs: [
      "App Router components are Server Components by default. They can render content without sending their component code to the browser.",
      'Interactive components need a client boundary. Put the "use client" directive at the top of the file when you need state or browser event handlers.',
      "useState holds a value between renders. Its setter schedules an update. A functional update like setDrops(d => d + 1) uses the latest state.",
    ],
    example:
      '"use client";\n\nimport { useState } from "react";\n\n// Inside your component, what value needs to survive a re-render?\n// What event should change that value?',
    exampleNote:
      "A client boundary enables interactivity. You still need to create the state, render its value, and connect an event handler.",
    task: "Create a client WaterButton component. Import useState, start drops at 0, and render a button that adds 1 drop on each click. Display the current drops inside the button.",
    requirements: [
      'Begin with "use client"',
      "Import useState and initialize drops to 0",
      "Default-export a button component with a working increment handler",
    ],
    starter:
      "// Add the client directive and import\n\nexport default function WaterButton() {\n  // Add state for drops\n  return <button>Water plant</button>;\n}",
    solution:
      '"use client";\n\nimport { useState } from "react";\n\nexport default function WaterButton() {\n  const [drops, setDrops] = useState(0);\n  return (\n    <button onClick={() => setDrops(d => d + 1)}>\n      Water plant: {drops} drops\n    </button>\n  );\n}',
    hints: [
      "State and event handlers need a client boundary. Import the state hook before using it in your component.",
      "Store the drop count in state. Connect the button click to a functional state update, and render the current count in the button.",
    ],
    recap:
      "Server Components handle server-side rendering and data. Client Components add state and event-driven interaction.",
    filename: "app/garden/water-button.tsx",
  },
];
import { continuationLessons } from "~/content/continuation";
import { advancedLessons } from "~/content/advanced";
const chapters = [
  "First steps",
  "Build the pieces",
  "Beyond the basics",
  "Application patterns",
  "Make it reliable",
  "Go deeper",
  "Ship complete projects",
];
export const rawLessons: Lesson[] = [
  ...firstLessons,
  ...continuationLessons,
  ...advancedLessons,
]
  .map((lesson) => ({
    ...lesson,
    kind: lesson.kind ?? "exercise",
    chapter:
      lesson.chapter ??
      chapters[Math.min(6, Math.floor((lesson.number - 1) / 5))]!,
  }))
  .sort(
    (a, b) =>
      tracks.findIndex((t) => t.id === a.track) -
        tracks.findIndex((t) => t.id === b.track) || a.number - b.number,
  );
import formattedCode from "./formatted-code.json" with { type: "json" };
// Refreshed from the authored lessons by scripts/format-content.mjs before dev/build/tests.
const formatted = formattedCode as Record<string, Partial<Lesson>>;
export const lessons: Lesson[] = rawLessons.map((lesson) => ({
  ...lesson,
  ...formatted[lesson.id],
}));
export function getTrack(id: string) {
  return tracks.find((t) => t.id === id);
}
export function getLesson(id: string) {
  return lessons.find((l) => l.id === id);
}
export function trackLessons(track: string) {
  return lessons.filter((l) => l.track === track);
}
