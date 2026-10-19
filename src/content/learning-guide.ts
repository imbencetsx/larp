import type { Lesson, LessonCheck } from "./curriculum";
import { getCodeHelp } from "./code-help";
import { getCodeHelpExamples, trackIntroductions } from "./code-help-examples";

export type GuideStep = {
  title: string;
  action: string;
  explanation: string[];
  example?: { code: string; explanation: string; practice: string };
  checkpoint: string;
  requirementIndex?: number;
};
export type LearningGuide = { introduction: string; steps: GuideStep[] };

// These actions teach construction, rather than presenting the finished page.
const htmlActions: Record<string, string[]> = {
  "html-1": [
    "On the first line, type <!DOCTYPE html>. This declaration comes before the html element and tells the browser to use modern HTML. Keep it at the top as you build the rest of the page.",
    "Inside head, create a title element. Write your own page name between its opening and closing tags. The title belongs to the browser tab, so it will not appear in the preview’s body.",
    "Inside body, create an h1 element. Type Hello, LARP! between the tags, including the comma and exclamation mark. Run your page and check that the greeting appears as a main heading.",
  ],
  "html-2": [
    "Inside body, write the journal’s main title in h1. Below it, add an h2 for your first journal entry or section. Heading levels describe the relationship between topics; they are not just different text sizes.",
    "Below your section heading, add a p element and write a sentence about your journal. Keep the sentence between the p tags, rather than placing loose text directly under the heading.",
    "Add an a element after the paragraph. Set href to https://developer.mozilla.org and use descriptive link text such as Explore web documentation. The destination goes inside the opening tag; the clickable words go between the tags.",
  ],
  "html-3": [
    'Inside body, create header and put nav inside it. Set aria-label="Main navigation" on nav. Add descriptive links so the navigation has a clear purpose and name.',
    "Below header, create main for the portfolio’s unique content. Keep it outside nav: navigation moves around the site, while main contains the work visitors came to see.",
    "Inside main, add section with an h2 naming the featured work. Add an article beneath that heading for a self-contained project, with its own heading and description. Close article, section, and main in that order.",
  ],
  "html-4": [
    "Create figure inside body and add img inside it. Set src to the project image and write meaningful alt text in the opening tag. Describe what matters about the image, not just that it is a photo. img has no closing tag.",
    "Add width and height to the same img element using the image dimensions. These numbers reserve its shape before it loads. Keep the src and alt attributes you added in the previous step.",
    "Add figcaption after img, still inside figure. Write a visible description of the project. The caption provides context for everyone; it does not replace alternative text.",
  ],
  "html-5": [
    "Create ul for the supplies and put each supply in its own li. Do not type bullet characters yourself: the list element supplies the list structure.",
    "Write compost in the first supply item and basil seeds in the second. Keep both li elements inside ul. The order is not essential for supplies, but these two items must be present.",
    "Below ul, create ol for the planting instructions. Add three li elements, each describing one action in order. The browser supplies the numbers; do not type them into the item text.",
  ],
  "html-6": [
    'Create form. Add label with for="name", immediately followed by input with id="name", name="name", and required. The matching for and id let somebody click the label to focus the field.',
    'Add a second label and input for the email, again connecting for and id. Set type="email", name="email", and required. Try an empty or invalid address in the preview to see browser validation.',
    'Add label with for="note" immediately followed by textarea with id="note" and a submission name. Finish with a clearly named submit button. Test that every label focuses its control before submitting.',
  ],
  "html-7": [
    "Create table and add caption as a child. Write a short description of the seed information so the table makes sense before somebody reads its cells.",
    'Create thead containing tr. Put two th elements in the row, titled Variety and Sow month, and give each scope="col". These headings identify the columns below.',
    'Create tbody with a row for Basil. Use th with scope="row" for Basil, then td for its sowing month. Keep the cells in the same order as the column headings.',
  ],
  "html-8": [
    "Create details and make summary its first child. Write a short label such as Project reflection between the summary tags. Activate it in the preview to open and close the disclosure.",
    "After summary, add blockquote inside details. Write the quotation between its tags and set cite to its source URL. cite stores source information but does not display a visible attribution.",
    "After blockquote, add a paragraph inside details naming the source. Add a useful source link if appropriate. Run the page and check that the quotation and attribution appear when you expand the disclosure.",
  ],
  "html-9": [
    'Set lang="en" on your document’s opening html tag. The language helps browsers and assistive technology interpret the page. Keep the declaration on the root element, not on head or body.',
    "Inside head, add title and give it a page-specific name. This is the browser-tab title; build the visible page heading separately inside body.",
    'Inside head, add meta name="description" with a useful content value, then meta name="viewport" with content="width=device-width, initial-scale=1.0". Keep this information separate from visible page content.',
  ],
  "html-10": [
    "Plan the studio page as header, main, and footer. Put the main heading and navigation in header, and use ids on the sections so the navigation has real destinations.",
    "Build the project collection inside main. Give each project its own article, heading, description, and meaningful image text. Keep repeated project structures consistent.",
    "Add the contact section and its form or contact link as requested. Connect each form label and control, then test the navigation and contact action in the preview before submitting.",
  ],
  "html-11": [
    "Create a form containing a fieldset. Add legend as the fieldset’s first child and use it to name the delivery choice. This groups the controls for someone navigating with assistive technology.",
    "Add pickup and post inputs with type=radio. Give both name=delivery but different value attributes. Give each radio its own id and matching label. Selecting one should clear the other.",
    "Outside that radio group, add an independent updates checkbox with its own id and matching label. Finish with a save button, then test that updates can be selected independently of delivery.",
  ],
  "html-12": [
    "Inside a form, add a labeled email field with type=email, a name, and required. Try an empty value and an invalid address to see the browser’s feedback.",
    "Add a labeled seats field with type=number. Set min=1, max=6, and required. Try values just below and above the permitted range, not only a valid value.",
    "Add a booking-code input with pattern=[A-Z]{3}. Write visible help explaining the three uppercase letters, give that help an id, and point the input’s aria-describedby to it. Add the submit button and test all fields together.",
  ],
  "html-13": [
    "Create a video element with controls. Inside it, add a source pointing to workshop.webm and identify its format with type=video/webm. Controls let the visitor decide when playback starts.",
    "Add a track inside video for captions.vtt. Set kind=captions, srclang=en, and a useful label. Captions must describe speech and meaningful sounds, not just the video title.",
    "Outside video, add a transcript section with its own id and a link whose href points to that id. Write ordinary text in the transcript so the information is available without playing the recording.",
  ],
  "html-14": [
    "Create a figure containing picture. Inside picture, put a source with the requested media condition and a srcset pointing to the wide version of your image.",
    "After source, add the fallback img. Give it the small image source, meaningful alt text, width, height, and loading=lazy. The fallback remains essential even when the browser chooses a source.",
    "Add figcaption after picture, still inside figure. Describe the scene, then resize the preview and inspect the structure. Image selection depends on the browser and on the files existing at their URLs.",
  ],
  "html-16": [
    "Create a dialog with open so it is visible in this exercise. Add a heading with a unique id, and connect dialog to that heading using aria-labelledby with the same id.",
    "Inside dialog, create a form with method=dialog. This special method closes the containing dialog rather than making a network submission.",
    "Add a button inside that form with the requested value and clear closing text. Run the preview and activate it. To show the initial open state again, rerun your page.",
  ],
  "html-17": [
    'Add label with for="setup" and descriptive text such as Setup progress. Immediately after it, create progress with id="setup". The shared identifier connects the label to the indicator.',
    'On that progress element, set value="3" and max="5". This describes three completed steps out of five. A progress element needs a closing tag even if it contains no visible fallback text.',
    'Add a separate label and meter with id="moisture", min="0", max="100", and value="40". Moisture is a measurement in a range, not a task advancing toward completion. Compare the two meanings in the preview.',
  ],
  "html-18": [
    'Create separate article elements for Basil and Mint. Set data-product-id="basil" on the Basil article and give each card a heading. Stable product ids let later JavaScript find the correct item.',
    'Inside the Mint article, add an a element with href="/products/mint" and descriptive text. A link navigates to another page. It should remain separate from the button that changes the cart.',
    'Add an action button to each card. For Basil, set type="button" and data-add="basil". Write clear action text. Matching product identities will let a future click handler update the right record without submitting a form.',
  ],
  "html-19": [
    'At the start of body, add a link with href="#content" and text that includes Skip. This gives keyboard users a way to bypass repeated navigation.',
    'Create main with id="content" so the skip link has a destination. Add tabindex="-1" so main can receive focus without becoming another stop in the normal Tab sequence.',
    'Add label with for="query" immediately before input with id="query", type="search", and a submission name. Run the page and test both the skip link and the search label without a mouse.',
  ],
  "html-21": [
    'Create article with itemscope and itemtype="https://schema.org/Event". You are identifying this article as an event described by the properties inside it.',
    'Inside the article, add a heading containing Seed swap and set itemprop="name" on it. The visible heading and structured property should describe the same event.',
    'Add time with itemprop="startDate" and datetime="2027-04-12". Write a readable date between its tags. Finish the organizer contact described in the task without removing the machine-readable date.',
  ],
  "html-22": [
    "Create pre containing code for the HTML example. Type &lt;h1&gt; to display the literal characters <h1> instead of creating a heading. Preserve the sample’s indentation inside pre.",
    "Write the shortcut instruction using kbd for the keys, including Ctrl. kbd identifies something the reader enters, whereas code identifies program text.",
    "Create dl for the terminology. Add dt for a term followed immediately by dd explaining it. Keep each term and its definition adjacent so their relationship is clear.",
  ],
  "html-23": [
    'Add a standalone svg with an appropriate viewBox, role="img", and aria-labelledby="sprout-title". Draw the sprout inside the viewBox so the coordinates fit its visible area.',
    'Inside that svg, add title with id="sprout-title" and a useful description of the icon. The identifier must exactly match aria-labelledby. This names a meaningful image for someone who cannot see it.',
    'Create a Save button with visible Save text and a second, decorative SVG. Put aria-hidden="true" on that second SVG because the button text already supplies the name. Keep the standalone meaningful SVG accessible.',
  ],
  "html-24": [
    "Inside main, create an ordered schedule. Put each session in li and its start time in time with a datetime attribute. Write readable session text alongside the machine-readable time.",
    'Create the booking form with a labeled required email input. Add a labeled select with name="session" and an option whose value="containers". The option’s visible text should describe the session, not its internal identifier.',
    "Add the FAQ using details with summary as its first child and the answer after it. Run the page and test the session picker, empty-email validation, and expanding the FAQ.",
  ],
  "html-26": [
    "Create the search form using method=get and the requested action. GET puts the search in the URL so somebody can share or revisit it.",
    "Add a labeled search input with the requested name. The name becomes the URL parameter, so use the exact name specified in the task rather than the visible label text.",
    "Add the remaining filter controls and a submit button. Run the page and inspect the generated destination. A static form describes a request; a real endpoint is needed to return search results.",
  ],
  "html-27": [
    'Create a delivery form with a label and full-name input. Connect their for and id, add a submission name, and set autocomplete="name" so the browser understands the field’s meaning.',
    'Add the postal-code input with type="text", autocomplete="postal-code", and aria-describedby="postal-help". Write visible help in an element with id="postal-help". Postal codes can have letters or leading zeroes, so do not treat them as ordinary numbers.',
    'Add a labeled telephone input with type="tel" and inputmode="tel". These hints help the browser choose a suitable keyboard; they do not validate every possible telephone number. Test labels and keyboard order.',
  ],
  "html-28": [
    "Write the purchase date inside time and put its machine-readable value in datetime. The visible text can be a friendly date while the attribute uses a consistent date format.",
    'Create the receipt table with caption, scoped column headings, and tbody for the line items. Use th scope="row" for an item name, then td cells for its quantity and price.',
    'Add tfoot with a row containing th scope="row" whose text includes Total. Put the total value in the corresponding cell. Review the receipt as a whole so the date, item data, and total are all understandable.',
  ],
  "html-29": [
    'Create template with id="product-card" and build the reusable article fragment inside it. The browser keeps template contents inert, so the unfinished card should not appear in the visible page yet.',
    'Outside template, add an empty section with id="results" and aria-label="Products". This is where a later script will place copies of your template; do not manually prefill it with finished product cards.',
    'Add a paragraph with id="result-status" and role="status". Give it a helpful starting message. Future result-count updates can be announced here without moving focus away from the search controls.',
  ],
  "html-31": [
    "Build a skip link pointing to #content and main with that id. Add the field guide’s heading and table of contents, using links that match the ids of your plant entries.",
    "Inside main, create three plant articles with unique ids and the same information structure. In each article, add a details element whose first child is summary for the expandable care notes.",
    "Build the plant comparison table with a caption, a thead, and column headers using scope=col. Add one consistent row per plant so somebody can compare the same properties.",
    "Finish with footer containing address and a useful mailto link. Test skip navigation, entry links, all care disclosures, and the contact action. Use the project review below before downloading your site.",
  ],
  "html-32": [
    'Create a section with id="schedule" and build a table with caption, scoped headings, and tbody. Add at least two workshop session rows with consistent columns and readable session details.',
    'Create the booking form with method="post". Add a labeled input with type="email", name="email", and required. Connect its label and id and test an invalid address.',
    'Add a labeled seats input with name="seats", type="number", min="1", and max="6". Keep it in the booking form. Test one seat, six seats, and values outside the permitted range.',
    'Create a section with id="faq" containing details with summary as its first child and helpful content after it. Add the agreement wording near the form so visitors can read it before agreeing.',
    'Add the agreement checkbox to the form with name="terms", type="checkbox", and required. Connect a visible label to it. Finish the contact footer from the project brief, then test that submission requires agreement and valid form values.',
  ],
};

const projectActions: Record<string, string[]> = {
  "nextjs-31": [
    'Create a Client Component in app/page.tsx: put "use client" first, import useState and your task helpers, then default-export Board. Return main containing h1, a task list, an add-task form with a labeled input, and a labeled all/active/done select. Wire the form to trim and add a new uniquely identified task, and add a remove button to each row.',
    'Create tasks state with three records: id 1, title Plan the app, done false; id 2, title Build the UI, done false; and id 3, title Test the edge cases, done false. Call remaining(tasks) during rendering and display the result in a paragraph with role="status", followed by tasks left. It should initially read 3 tasks left; do not hardcode a separate counter.',
    "Render each task as a list item with its id as the React key. Put the completion button before the remove action, and connect its onClick to a functional state update using toggle(items, task.id). Render aria-pressed from task.done. Run the app and activate the first completion button: the derived status should change from 3 tasks left to 2 tasks left.",
    "Make the same completion button undo its action when clicked again. toggle should invert the matched record’s done value rather than always assigning true. Activate the button twice and confirm the count returns to 3 tasks left. Then test adding, removing, and changing the view filter without changing the original task records in place.",
  ],
  "nextjs-32": [
    "Create a Client Component in app/page.tsx. Import useState plus your expense model helpers and default-export Budget. Render main, a useful h1, an expense ul, and a form with labeled title and amount inputs. Keep text field state separate from the accepted expense collection, validate before adding, show feedback, and provide a remove button for each expense.",
    'Initialize the expense collection with one record: id 1, title Seeds, and cents 450. Derive the sum with total(expenses), divide cents by 100 only for display, and format it with two decimal places. Render it in a paragraph with role="status". The initial visible total should include €4.50.',
    "Add a quick-add button before the other row actions. On click, create a uniquely identified expense titled Plant pot with cents 300 and update expenses through your addExpense helper using a functional setter. The status should change from €4.50 to €7.50. Do not edit the displayed total directly: derive it from the new collection.",
    "Map the expense collection into li elements with stable id keys, meaningful titles, and formatted amounts. After the quick-add action, Plant pot should appear as a real new row. Check that removal changes both the list and total, and test that blank titles, invalid amounts, and duplicate ids are rejected without changing the prior collection.",
  ],
};

function words(value: string) {
  return new Set(
    (value.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) ?? []).filter(
      (word) =>
        ![
          "the",
          "and",
          "with",
          "your",
          "from",
          "this",
          "that",
          "add",
          "use",
        ].includes(word),
    ),
  );
}
function related<T>(
  items: readonly T[],
  target: string,
  text: (item: T) => string,
): T | undefined {
  const tokens = words(target);
  return items
    .map((item, index) => ({
      item,
      index,
      score: [...words(text(item))].filter((word) => tokens.has(word)).length,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.item;
}
function checkAdvice(check?: LessonCheck) {
  if (check?.kind === "css")
    return `Work in the rule for ${check.selector}. Find ${check.property}, change that declaration, and keep the rule’s other declarations. Use the value described in the step, then run the preview to inspect the result. CSS declarations end with a semicolon.`;
  if (check?.kind === "next")
    return `Build the JSX using ${check.tags?.join(", ") ?? "the elements named in the task"}. Keep elements properly nested and use braces for JavaScript values.${check.clicks ? " Connect the action to state, then test the button more than once; changing a local variable alone will not update the screen." : " Run the component and inspect the visible result before adding the next piece."}`;
  return "Make this change in the editor before moving on. Keep the existing pieces that already work, and test this behavior with a normal input and an edge case. If the result is wrong, follow the value from the input through each operation to the returned or displayed output.";
}
export function getLearningGuide(lesson: Lesson): LearningGuide {
  const tools = getCodeHelp(lesson);
  const examples = getCodeHelpExamples(lesson);
  const usedExamples = new Set<string>();
  const foundation: GuideStep =
    lesson.track === "html"
      ? {
          title: "Start with your own document",
          action: `Open ${lesson.filename}. New work starts empty; if you are returning, keep your saved changes and continue from the step you reached. Create the document outline below first. Put information about the page inside head and the visible project inside body.`,
          explanation: [
            "Indent elements inside their parent so you can see which opening and closing tags belong together. Empty head and body elements are only a starting outline; they are not a finished page.",
          ],
          example: {
            code: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n  </head>\n  <body>\n  </body>\n</html>',
            explanation:
              "The doctype selects modern HTML. html is the root. head contains page information; body contains what visitors see. The slash marks a closing tag.",
            practice:
              "Type the outline yourself. Leave space inside head and body for the project you are about to build.",
          },
          checkpoint:
            "The editor contains your document outline. An empty body should produce a blank preview — that is expected.",
        }
      : {
          title: "Set up your workspace",
          action: `Open ${lesson.filename}. This file starts empty: create the code yourself, one step at a time. ${lesson.track === "css" ? "The companion index.html is only a preview fixture for the stylesheet you are building. Start by writing the selector named in the first step, then add its declaration block." : "Start by declaring the variables, functions, types, or component required by the task. Use the names in the outline below so the checks can call your implementation, then build the behavior in the following steps."}`,
          explanation: [trackIntroductions[lesson.track]],
          ...(lesson.buildFiles?.[lesson.filename]
            ? {
                example: {
                  code: lesson.buildFiles[lesson.filename]!,
                  explanation:
                    "This is an outline of the names and interfaces your code needs, not a working implementation. Create these declarations in the empty file, then replace each placeholder by following the build steps. Imports connect files; type declarations describe the values; function bodies are where you implement the behavior.",
                  practice:
                    "Read each declaration aloud: what input does it accept, what value should it produce, and where will that value be used? Write and test one piece before adding the next.",
                },
              }
            : {}),
          checkpoint:
            "You have created the first declaration or CSS rule yourself. An empty function, missing export, or incomplete rule may report an error until you implement it — use the next steps to build the required behavior.",
        };
  const projectFiles: GuideStep[] = Object.entries(lesson.buildFiles ?? {})
    .filter(([filename]) => filename !== lesson.filename)
    .map(([filename, outline]) => ({
      title: `Create ${filename}`,
      action: filename.endsWith("layout.tsx")
        ? `Open ${filename}, which starts empty. Import ReactNode as a type and the global stylesheet. Create a default-exported RootLayout component that accepts children, wraps them in body inside html, and sets the document language. This shared layout surrounds every page in the app.`
        : filename.endsWith(".css")
          ? `Open ${filename} and write the page styles yourself. Start with body for readable text and spacing, then style the main container and the controls you create. Add a visible focus treatment to buttons and inputs, and test a narrow viewport as well as a wide one.`
          : filename.endsWith("tasks.ts")
            ? `Open ${filename}. Define Task with id, title, and done fields. Export toggle to return a new task array with only the chosen task’s done value reversed. Export remaining to count tasks whose done value is false. Keep the original array and unchanged records intact so repeated updates work correctly.`
            : `Open ${filename}. Define Expense with id, title, and cents fields. Export total to add the integer cents values. Export addExpense to return a new collection only for a non-empty title, positive integer amount, and unused id; trim accepted titles and preserve the original array. These functions are shared by the page’s form and quick-add actions.`,
      explanation: [
        "Create this file before importing it in the page. Exports make a definition available to another file; the import path must point to the file you actually created. Build and check each helper separately before wiring it into an event handler.",
      ],
      ...(outline
        ? {
            example: {
              code: outline,
              explanation:
                "Use these names and parameter types as the contract. The bodies intentionally contain no completed behavior; implement them using the actions above.",
              practice:
                "For a helper, try a normal input and an edge case. For the layout, check that children are rendered once. For styles, confirm that text and focus indicators stay visible.",
            },
          }
        : {}),
      checkpoint: `The code in ${filename} is your own implementation. Check its exports or selectors before using it from ${lesson.filename}.`,
    }));
  const steps = lesson.requirements.map((requirement, index): GuideStep => {
    const tool =
      related(tools, requirement, ([name, purpose]) => `${name} ${purpose}`) ??
      tools[index % tools.length];
    const candidate = related(
      examples.filter((example) => !usedExamples.has(example[0])),
      `${requirement} ${tool?.join(" ") ?? ""}`,
      ([code, explanation]) => `${code} ${explanation}`,
    );
    const example =
      candidate && !usedExamples.has(candidate[0]) ? candidate : undefined;
    if (example) usedExamples.add(example[0]);
    const action =
      (htmlActions[lesson.id] ?? projectActions[lesson.id])?.[index] ??
      `${requirement}. ${checkAdvice(lesson.checks?.[index])}`;
    return {
      title: requirement,
      action,
      explanation: [
        ...new Set(
          [
            lesson.paragraphs[index] ?? "",
            tool ? `${tool[0]}: ${tool[1]}` : "",
          ].filter(Boolean),
        ),
      ],
      ...(example
        ? {
            example: {
              code: example[0],
              explanation: example[1],
              practice: example[2],
            },
          }
        : {}),
      checkpoint: `Check your work against this goal: ${requirement}. Run the current version before moving to the next step.`,
      requirementIndex: index,
    };
  });
  return {
    introduction: lesson.task,
    steps: [
      foundation,
      ...projectFiles,
      ...steps,
      {
        title: "Test the whole thing",
        action:
          "Run your work once more and try the complete flow from beginning to end. When it behaves as intended, choose Submit to check the lesson’s requirements. Run previews your work; it does not complete the lesson.",
        explanation: [lesson.recap, ...lesson.hints],
        checkpoint:
          "If a check fails, return to that step, compare the requested behavior with your code, and change one thing at a time. Completion is awarded only when the submitted work passes the checks.",
      },
    ],
  };
}
