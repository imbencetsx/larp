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
    example:
      '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>My first page</title>\n  </head>\n  <body>\n    <h1>Hello, world!</h1>\n  </body>\n</html>',
    exampleNote:
      "The title appears in the browser tab. The h1 appears on the page.",
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
      "A title uses <title>Your title</title> inside the head element.",
      "Inside body, add <h1>Hello, LARP!</h1>.",
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
    example:
      '<h1>A small garden</h1>\n<h2>What is growing?</h2>\n<p>One little idea, every day.</p>\n<a href="https://developer.mozilla.org">Explore web docs</a>',
    exampleNote: "Attributes such as href add information to an element.",
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
      "Try <h2>Day one</h2> followed by a p element.",
      'Use <a href="https://developer.mozilla.org">Explore web documentation</a>.',
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
    example: ".plant {\n  color: green;\n  background-color: #eef4e8;\n}",
    exampleNote:
      "A semicolon separates declarations. The dot belongs in CSS, not in the HTML class name.",
    task: "Style the .plant card. Make its text green and its background #eef4e8. The preview already contains the HTML.",
    requirements: [
      "Select .plant",
      "Set color to green or #008000",
      "Set background-color to #eef4e8",
    ],
    starter: ".plant {\n  /* Give this plant its colors */\n}",
    solution: ".plant {\n  color: green;\n  background-color: #eef4e8;\n}",
    hints: [
      "Write declarations inside the .plant rule.",
      "Add color: green; and background-color: #eef4e8;",
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
      ".plant {\n  box-sizing: border-box;\n  width: 240px;\n  padding: 24px;\n  margin: 16px;\n  border: 2px solid #52734d;\n}",
    exampleNote: "Padding is inside the border. Margin is outside it.",
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
      "Use padding for space inside, and margin for space outside.",
      "Add box-sizing: border-box; width: 240px; padding: 24px; margin: 16px; border: 2px solid green;",
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
      'const plant = "Fern";\nlet leaves = 3;\nleaves = leaves + 1;\nconsole.log(`${plant} has ${leaves} leaves.`);',
    exampleNote: "The console prints: Fern has 4 leaves.",
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
      'Start with const plant = "Fern"; and const leaves = 4;',
      "Use console.log(`${plant} has ${leaves} leaves.`);",
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
      'function lightAdvice(hours) {\n  if (hours < 4) {\n    return "More sunshine";\n  }\n  return "Looking bright";\n}\nconsole.log(lightAdvice(2));',
    exampleNote:
      "Calling a function runs its instructions with the supplied input.",
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
      'Use if (moisture < 30) and return "Water me" inside it.',
      'After the if block, return "I am happy". Remember the boundary value 30.',
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
      'const plantName: string = "Fern";\nconst leafCount: number = 4;\nconst isHealthy: boolean = true;\nconsole.log(plantName, leafCount, isHealthy);',
    exampleNote: 'Assigning "four" to a number variable produces a diagnostic.',
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
      'A string value needs quotes: "Fern". A number does not: 4.',
      "Use the boolean true without quotes. Keep the explicit type annotations.",
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
      'type Seed = { name: string; days: number };\n\nfunction describe(seed: Seed): string {\n  return `${seed.name}: ${seed.days} days`;\n}\n\nconsole.log(describe({ name: "Basil", days: 7 }));',
    exampleNote:
      "TypeScript will flag a missing property or an incorrect property type.",
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
      "Start with type Plant = { name: string; leaves: number };",
      "Annotate the function as describePlant(plant: Plant): string, then use a template literal.",
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
      "export default function GardenPage() {\n  return (\n    <main>\n      <h1>My garden</h1>\n      <p>A place for growing ideas.</p>\n    </main>\n  );\n}",
    exampleNote:
      "Saved as app/garden/page.tsx, this component is the /garden route.",
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
      "Keep export default on the function declaration.",
      "Replace the comment with <h1>My garden</h1>.",
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
      '"use client";\n\nimport { useState } from "react";\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>\n    {count} visits\n  </button>;\n}',
    exampleNote:
      "The directive marks a client boundary; it is not needed on every file in an app.",
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
      'Start with "use client"; and import { useState } from "react";',
      "Add const [drops, setDrops] = useState(0); then onClick={() => setDrops(d => d + 1)} on your button. Display {drops}.",
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
export const lessons: Lesson[] = [
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
export function getTrack(id: string) {
  return tracks.find((t) => t.id === id);
}
export function getLesson(id: string) {
  return lessons.find((l) => l.id === id);
}
export function trackLessons(track: string) {
  return lessons.filter((l) => l.track === track);
}
