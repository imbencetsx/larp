import type { Lesson } from "./curriculum";

export type CodeHelpBlock = readonly [name: string, purpose: string];

// Name the tools and explain their jobs. Keep implementations in the editor.
const help: Record<string, readonly CodeHelpBlock[]> = {
  "html-1": [
    [
      "doctype and html",
      "Declare a modern HTML document and its root element.",
    ],
    [
      "head and title",
      "Keep page information here. The title names the browser tab.",
    ],
    [
      "body and h1",
      "Put visible content in the body and use a main heading for the greeting.",
    ],
  ],
  "html-2": [
    [
      "h1 and h2",
      "Use a main heading for the journal and a lower-level heading for its section.",
    ],
    ["p", "Group a paragraph of journal text."],
    [
      "a and href",
      "Create a descriptive link; the href attribute holds its destination.",
    ],
  ],
  "html-3": [
    [
      "header, nav, main, footer",
      "Separate the introduction, navigation, unique content, and closing information.",
    ],
    [
      "section and article",
      "Group featured work in a section and each self-contained project in an article.",
    ],
    [
      "Headings and aria-label",
      "Give sections a heading and give the navigation an accessible name.",
    ],
  ],
  "html-4": [
    [
      "figure and figcaption",
      "Group the project image with a visible caption.",
    ],
    [
      "img, src, and alt",
      "Identify the image source and describe its useful meaning for someone who cannot see it.",
    ],
    ["width and height", "Reserve the image’s space before it loads."],
  ],
  "html-5": [
    [
      "ul and li",
      "Use an unordered list for supplies that have no required order.",
    ],
    ["ol and li", "Use an ordered list for steps whose sequence matters."],
  ],
  "html-6": [
    [
      "form, label, and input",
      "Group the controls and associate each label with a matching input id.",
    ],
    [
      "type and required",
      "Choose a suitable input type and mark fields that must be filled in.",
    ],
    [
      "textarea and button",
      "Allow a longer project note and provide a clear submission action.",
    ],
  ],
  "html-7": [
    [
      "table and caption",
      "Create the data table and explain what it contains.",
    ],
    [
      "thead, tbody, and tr",
      "Separate the header from the data and group cells into rows.",
    ],
    [
      "th, td, and scope",
      "Distinguish headings from values and identify which rows or columns they describe.",
    ],
  ],
  "html-8": [
    [
      "details and summary",
      "Create a native disclosure with a short, clickable label.",
    ],
    [
      "blockquote and cite",
      "Mark up the quotation and identify its source visibly.",
    ],
  ],
  "html-9": [
    [
      "html and lang",
      "Identify the document’s language for browsers and assistive technology.",
    ],
    [
      "head, title, and meta",
      "Name the page and provide description and viewport metadata outside the visible body.",
    ],
  ],
  "html-10": [
    [
      "Semantic landmarks",
      "Plan the page with header, nav, main, and footer before adding details.",
    ],
    [
      "section, article, and headings",
      "Give featured projects a clear content hierarchy.",
    ],
    [
      "figure, lists, and form controls",
      "Combine described images, supplies, and a labeled contact form.",
    ],
  ],
  "html-11": [
    ["fieldset and legend", "Group related choices and name the group."],
    [
      "Radio inputs",
      "Use a shared name for mutually exclusive choices, with a distinct value for each option.",
    ],
    [
      "Checkbox and label",
      "Provide an independent optional choice with an associated label.",
    ],
  ],
  "html-12": [
    [
      "Input types and validation attributes",
      "Use email, required, min, max, and pattern where each constraint belongs.",
    ],
    [
      "label, id, and aria-describedby",
      "Connect controls to their names and to separate help text.",
    ],
  ],
  "html-13": [
    [
      "video, controls, and source",
      "Provide a playable video and identify the media format.",
    ],
    [
      "track and a",
      "Supply captions with language information and a separate transcript link.",
    ],
  ],
  "html-14": [
    [
      "picture and source",
      "Offer a different image for a matching media condition.",
    ],
    [
      "img",
      "Provide the fallback image, useful alt text, dimensions, and a loading strategy.",
    ],
  ],
  "html-16": [
    [
      "dialog and accessible naming",
      "Give the confirmation a dialog container and associate it with its heading.",
    ],
    [
      "form method and button",
      "Use the native dialog form method to close it without a custom script.",
    ],
  ],
  "html-17": [
    [
      "progress",
      "Represent how much of a task has been completed using a value and maximum.",
    ],
    [
      "meter",
      "Represent a measurement within a known range rather than task completion.",
    ],
    ["label and id", "Give both indicators an accessible name."],
  ],
  "html-18": [
    [
      "article and data attributes",
      "Give each product a self-contained card and a stable product identity.",
    ],
    [
      "a and button",
      "Use a link for navigation and a non-submit button for an add action.",
    ],
  ],
  "html-19": [
    [
      "Skip link and main target",
      "Link directly to the content and make the target programmatically focusable.",
    ],
    [
      "Search input and accessible label",
      "Make the search field’s purpose available to keyboard and screen-reader users.",
    ],
  ],
  "html-21": [
    [
      "itemscope, itemtype, and itemprop",
      "Describe an event and identify the roles of its individual fields.",
    ],
    [
      "time and address",
      "Pair a readable date with a machine-readable value and provide organizer contact information.",
    ],
  ],
  "html-22": [
    [
      "code, pre, and HTML entities",
      "Show literal markup as text rather than having the browser interpret it.",
    ],
    ["kbd", "Identify a keyboard shortcut."],
    ["dl, dt, and dd", "Pair technical terms with their definitions."],
  ],
  "html-23": [
    [
      "svg, title, and aria-labelledby",
      "Give a standalone graphic a text alternative linked to its title.",
    ],
    [
      "button and decorative SVG",
      "Let visible button text name the action and hide its redundant graphic from assistive technology.",
    ],
  ],
  "html-24": [
    [
      "Schedule table",
      "Use caption, header cells, rows, and data cells to explain the workshop schedule.",
    ],
    [
      "Labeled form controls",
      "Use a select for session choices and an email input for attendee details.",
    ],
    ["details and summary", "Let readers expand individual FAQ answers."],
  ],
  "html-26": [
    [
      "form action and GET method",
      "Send search criteria through the URL so the result can be shared.",
    ],
    [
      "name attributes and select",
      "Give the query and category controls names that become URL parameters.",
    ],
  ],
  "html-27": [
    [
      "autocomplete and inputmode",
      "Help browsers fill known information and choose a suitable keyboard.",
    ],
    [
      "label and aria-describedby",
      "Connect every field to its name and any extra help.",
    ],
  ],
  "html-28": [
    [
      "table sections and scoped headers",
      "Organize line items and totals while preserving row and column relationships.",
    ],
    [
      "time and data",
      "Keep dates and monetary values readable to people and interpretable by machines.",
    ],
  ],
  "html-29": [
    [
      "template",
      "Store an inert product-card structure that a script can clone later.",
    ],
    [
      "Results container and live status",
      "Leave room for rendered results and announce updates accessibly.",
    ],
  ],
  "html-31": [
    [
      "Landmarks and fragment navigation",
      "Connect a skip link and entry links to clear content targets.",
    ],
    [
      "article, headings, and details",
      "Give each guide entry its own structure and expandable care information.",
    ],
    [
      "table and contact link",
      "Compare entries and make it easy to contact the guide’s author.",
    ],
  ],
  "html-32": [
    [
      "Page landmarks and schedule table",
      "Organize the event page and expose schedule relationships clearly.",
    ],
    [
      "Labeled booking controls",
      "Combine session selection, validated attendee fields, and an agreement checkbox.",
    ],
    [
      "details and address",
      "Provide expandable FAQ answers and organizer contact information.",
    ],
  ],
  "css-1": [
    [
      "Class selector",
      "Target the card by the class used in the preview HTML.",
    ],
    [
      "color and background-color",
      "Set the text and surface separately, using the values in the task.",
    ],
  ],
  "css-2": [
    [
      "box-sizing and width",
      "Choose whether the declared width includes padding and borders.",
    ],
    [
      "padding and margin",
      "Control the space inside the card and the space around it.",
    ],
    ["border", "Give the card edge a width, a line style, and a color."],
  ],
  "css-3": [
    [
      "Class selectors and specificity",
      "Target the featured title precisely without forcing a rule with !important.",
    ],
    ["color and border", "Style the title’s ink and the featured card’s edge."],
  ],
  "css-4": [
    [
      "font-family and font-size",
      "Choose a readable stack with a fallback and a relative text size.",
    ],
    [
      "line-height and max-width",
      "Keep lines comfortably spaced and limit the reading measure with character units.",
    ],
  ],
  "css-5": [
    [
      "display and align-items",
      "Make the parent a flex container and align its children across the row.",
    ],
    [
      "gap and flex",
      "Space the children and let the copy column use the remaining room.",
    ],
  ],
  "css-6": [
    [
      "Grid and grid-template-columns",
      "Define the gallery’s columns on the parent container.",
    ],
    [
      "repeat, auto-fit, and minmax",
      "Allow the column count to adapt while keeping cards above a minimum width.",
    ],
    ["gap", "Set the space between grid items."],
  ],
  "css-7": [
    [
      "Responsive width and inline margins",
      "Cap the wrapper while leaving breathing room at narrow widths.",
    ],
    [
      "Media query and flex-direction",
      "Change the card arrangement when the screen crosses the task’s breakpoint.",
    ],
  ],
  "css-8": [
    [
      "hover and focus-visible",
      "Give pointer and keyboard users visible interaction feedback.",
    ],
    [
      "transform, transition, and reduced motion",
      "Add a subtle lift and remove unnecessary motion for people who request it.",
    ],
  ],
  "css-9": [
    [
      "Custom properties",
      "Name reusable surface and text colors in a shared scope.",
    ],
    [
      "var",
      "Read the named tokens in component declarations instead of repeating literal colors.",
    ],
  ],
  "css-10": [
    [
      "Wrapper sizing and Grid",
      "Center the studio and let project cards adapt to available space.",
    ],
    [
      "Surface tokens and focus-visible",
      "Keep card colors consistent and preserve an obvious keyboard focus state.",
    ],
  ],
  "css-11": [
    [
      "Relative and absolute positioning",
      "Make the card the containing block for its badge.",
    ],
    [
      "Inset properties",
      "Place the badge against the requested card edges without moving the surrounding content.",
    ],
  ],
  "css-12": [
    [
      "clamp and relative units",
      "Let headings scale fluidly between sensible minimum and maximum sizes.",
    ],
    [
      "Character measure and line-height",
      "Keep body copy readable as the layout changes.",
    ],
  ],
  "css-13": [
    [
      "repeat, auto-fit, and minmax",
      "Let the gallery choose a column count from the available space.",
    ],
    [
      "min and gap",
      "Prevent the minimum track size from overflowing a narrow container and space the cards consistently.",
    ],
  ],
  "css-14": [
    [
      "container-type",
      "Make the gallery’s inline size available to its descendants.",
    ],
    [
      "Container query and Grid",
      "Change the card’s internal columns based on its container rather than the viewport.",
    ],
  ],
  "css-16": [
    [
      "Logical padding",
      "Use inline and block directions so spacing follows the writing direction.",
    ],
    [
      "border-inline-start",
      "Place the accent on the start edge without assuming it is always the left edge.",
    ],
  ],
  "css-17": [
    [
      "aspect-ratio",
      "Reserve a predictable artwork shape before the image loads.",
    ],
    [
      "object-fit and width constraints",
      "Crop the image inside its frame while preventing horizontal overflow.",
    ],
  ],
  "css-18": [
    [
      "Sticky positioning and inset",
      "Keep the toolbar attached to the scrolling workspace.",
    ],
    [
      "Flexible tracks and min-width",
      "Let the gallery and cards shrink without their content forcing overflow.",
    ],
  ],
  "css-19": [
    [
      "Cascade layers",
      "Declare an intentional ordering for component and utility rules.",
    ],
    [
      "Component rule and compact override",
      "Keep base styling separate from the later rule that changes its spacing.",
    ],
  ],
  "css-21": [
    [
      ":has and :invalid",
      "Select a form based on the validation state of a control inside it.",
    ],
    [
      ":focus-within",
      "Highlight a card while one of its descendants has keyboard focus.",
    ],
  ],
  "css-22": [
    [
      "Keyframes and animation",
      "Describe the entrance states and connect them to the cards.",
    ],
    [
      "prefers-reduced-motion",
      "Turn the entrance off when a user requests less motion.",
    ],
  ],
  "css-23": [
    [
      "Horizontal layout and overflow",
      "Arrange cards in a scrollable rail without shrinking them all into view.",
    ],
    [
      "Scroll snapping",
      "Set the rail’s snap behavior and the stopping alignment of each card.",
    ],
  ],
  "css-24": [
    [
      "Form layout and control sizing",
      "Keep labels readable and inputs within the available width.",
    ],
    [
      "focus-visible",
      "Give keyboard users a clear outline on the active control.",
    ],
  ],
  "css-26": [
    [
      "Custom properties and var",
      "Define palette tokens once and consume them in plant cards.",
    ],
    [
      "Surface and text contrast",
      "Choose distinct dark surfaces and readable ink colors.",
    ],
  ],
  "css-27": [
    [
      "Print media query",
      "Apply a separate presentation when the guide is printed.",
    ],
    [
      "Visibility, colors, and break-inside",
      "Remove interactive chrome, use printable colors, and keep cards together.",
    ],
  ],
  "css-28": [
    [
      "minmax and min-width",
      "Allow grid columns and their children to shrink below their content’s preferred width.",
    ],
    [
      "overflow-wrap",
      "Break long text when needed rather than pushing the layout wider.",
    ],
  ],
  "css-29": [
    [
      "Baseline block layout",
      "Start with a usable presentation that needs no enhancement.",
    ],
    [
      "@supports and Grid",
      "Add the gallery layout only when the browser supports the feature.",
    ],
  ],
  "css-31": [
    [
      "Theme tokens and responsive Grid",
      "Build a consistent dark palette and an adaptive planning layout.",
    ],
    [
      "Form controls and focus states",
      "Keep inputs usable and keyboard navigation visible across the dashboard.",
    ],
  ],
  "css-32": [
    [
      "Responsive Grid and artwork sizing",
      "Fit product cards to the container and reserve square image frames.",
    ],
    [
      "Sticky toolbar and interaction states",
      "Keep useful controls available and make their focus visible.",
    ],
    [
      "Print media query",
      "Adapt the storefront to paper by removing controls and simplifying colors.",
    ],
  ],
  "javascript-1": [
    [
      "Variables, strings, and numbers",
      "Give each value a name and choose the appropriate kind of data.",
    ],
    [
      "Template literals and console.log",
      "Combine the values into a message and print it to the console.",
    ],
  ],
  "javascript-2": [
    [
      "Function and parameter",
      "Accept the moisture reading as input to reusable behavior.",
    ],
    [
      "Condition and return",
      "Compare the input with the threshold and return a result for either outcome.",
    ],
  ],
  "javascript-3": [
    [
      "Array of objects",
      "Represent each seedling as a record in a collection.",
    ],
    [
      "filter and predicate",
      "Keep items whose leaf count meets the readiness rule.",
    ],
  ],
  "javascript-4": [
    [
      "Object properties",
      "Read the plant’s name and leaf count from the input object.",
    ],
    [
      "Function and template literal",
      "Build and return a description that works with different plant records.",
    ],
  ],
  "javascript-5": [
    [
      "Copying and filtering",
      "Choose qualifying seedlings without changing the source collection.",
    ],
    [
      "map, sort, and localeCompare",
      "Transform records into names and compare the names alphabetically.",
    ],
  ],
  "javascript-6": [
    [
      "Ordered conditions",
      "Check the highest-priority weather rule before less urgent rules.",
    ],
    [
      "Early returns and fallback",
      "Return as soon as a rule matches and cover the case where none match.",
    ],
  ],
  "javascript-7": [
    [
      "String normalization",
      "Remove unwanted whitespace before examining user input.",
    ],
    [
      "String checks and booleans",
      "Check the expected email features and report whether they are present.",
    ],
  ],
  "javascript-8": [
    [
      "reduce and accumulator",
      "Carry a summary through the collection one plant at a time.",
    ],
    [
      "Initial summary and object properties",
      "Choose a starting state that also works for an empty collection.",
    ],
  ],
  "javascript-9": [
    [
      "Closure and local state",
      "Keep the count in a binding that survives through the returned functions.",
    ],
    [
      "Object methods",
      "Expose separate operations for changing the count and reading it.",
    ],
  ],
  "javascript-10": [
    [
      "Iteration and createElement",
      "Create a card and its child elements for each plant record.",
    ],
    [
      "textContent and append",
      "Fill the elements safely with text and attach them to the live document.",
    ],
  ],
  "javascript-11": [
    [
      "Object destructuring",
      "Pull the fields you need out of a function’s input.",
    ],
    [
      "Default parameter values",
      "Provide a default when an optional field is absent.",
    ],
  ],
  "javascript-12": [
    [
      "map and identity checks",
      "Choose which record changes while preserving the other records.",
    ],
    [
      "Object and array copies",
      "Return updated data without mutating the input collection or its objects.",
    ],
  ],
  "javascript-13": [
    ["Map", "Associate each tag with a running count."],
    [
      "Set and iteration order",
      "Keep unique tags in the order they first appeared.",
    ],
  ],
  "javascript-14": [
    [
      "JSON.parse and try/catch",
      "Treat malformed input as a recoverable parsing failure.",
    ],
    [
      "Array checks and result objects",
      "Validate each record before returning a success or an error result.",
    ],
  ],
  "javascript-16": [
    [
      "async and await",
      "Wait for the loader’s result before reading its data.",
    ],
    [
      "try/catch",
      "Translate a rejected operation into the task’s fallback result.",
    ],
  ],
  "javascript-17": [
    [
      "Promises and concurrent work",
      "Start independent loaders without making one wait for the other.",
    ],
    [
      "Promise.all",
      "Collect their results in input order even when completion order differs.",
    ],
  ],
  "javascript-18": [
    [
      "Injected request function",
      "Keep the HTTP boundary replaceable so it can be tested.",
    ],
    [
      "Response checks and JSON parsing",
      "Check request success and validate the body’s shape before returning data.",
    ],
  ],
  "javascript-19": [
    ["Closure and Map", "Give each memoized function its own private cache."],
    [
      "Cache membership",
      "Distinguish a missing entry from a cached value that happens to be falsy.",
    ],
  ],
  "javascript-21": [
    [
      "Listener collection and closure",
      "Store subscribers privately for each emitter instance.",
    ],
    [
      "Callbacks and unsubscribe",
      "Notify current listeners and provide a way to remove a subscription.",
    ],
  ],
  "javascript-22": [
    [
      "Storage interface and JSON serialization",
      "Pass storage in and convert between records and stored text.",
    ],
    [
      "try/catch and shape validation",
      "Handle missing, malformed, or unexpected stored data with a safe fallback.",
    ],
  ],
  "javascript-23": [
    [
      "Reducer and action branches",
      "Choose a cart update from the action type and product identity.",
    ],
    [
      "Immutable updates and quantity boundaries",
      "Return new data and remove products that no longer have a positive quantity.",
    ],
  ],
  "javascript-24": [
    [
      "Input validation and normalization",
      "Check the payload’s shape, trim fields, and normalize suitable values.",
    ],
    [
      "Field errors and result objects",
      "Collect useful errors or return validated data through a clear success branch.",
    ],
  ],
  "javascript-26": [
    [
      "Numeric validation and page boundaries",
      "Reject invalid page sizes and normalize the page number.",
    ],
    [
      "slice and offsets",
      "Select a page without mutating the original array or skipping records.",
    ],
  ],
  "javascript-27": [
    [
      "Normalization and filter",
      "Compare names with a trimmed, case-insensitive search term.",
    ],
    [
      "Sorting and immutability",
      "Return alphabetical results while keeping the original collection unchanged.",
    ],
  ],
  "javascript-28": [
    [
      "History object and array copies",
      "Keep previous states separate from the current state.",
    ],
    [
      "Commit and undo operations",
      "Move between the present and the most recent past state, including empty history.",
    ],
  ],
  "javascript-29": [
    [
      "Iteration and function calls",
      "Run every named case instead of stopping after the first one.",
    ],
    [
      "try/catch and result counts",
      "Treat thrown errors and unsuccessful results as failures and summarize the outcomes.",
    ],
  ],
  "javascript-31": [
    [
      "Immutable task updates and filtering",
      "Keep adding, toggling, removing, and selecting tasks separate from rendering.",
    ],
    [
      "DOM events and rendering",
      "Connect form and button actions to state changes, then refresh the visible list and count.",
    ],
  ],
  "javascript-32": [
    [
      "Cart updates and derived totals",
      "Validate products, update quantities, and calculate money using integer cents.",
    ],
    [
      "Search and DOM events",
      "Connect search, basket actions, and clearing to a fresh rendering of the current state.",
    ],
  ],
  "typescript-1": [
    [
      "Primitive type annotations",
      "Use string, number, and boolean to describe the kind of value each variable accepts.",
    ],
    [
      "Value and type agreement",
      "Compare each assigned value with its annotation; quotes change a value’s type.",
    ],
  ],
  "typescript-2": [
    [
      "Object type alias",
      "Describe the named properties and their types in a reusable contract.",
    ],
    [
      "Parameter and return annotations",
      "Use the contract for the function input and declare the kind of result it returns.",
    ],
  ],
  "typescript-3": [
    [
      "Literal union",
      "Restrict the status to a small set of meaningful choices.",
    ],
    [
      "Narrowing and conditional branches",
      "Choose the appropriate action after identifying the current status.",
    ],
  ],
  "typescript-4": [
    [
      "Interface, readonly, and optional properties",
      "Describe which fields are required, which can be absent, and which should not change.",
    ],
    [
      "Optional-value narrowing",
      "Check that the note exists before including it in the label.",
    ],
  ],
  "typescript-5": [
    [
      "Generic type parameter",
      "Keep the array items and fallback connected to the same reusable type.",
    ],
    [
      "Array access and fallback",
      "Account for an empty collection while preserving the return type.",
    ],
  ],
  "typescript-6": [
    [
      "unknown and runtime checks",
      "Establish that a value is a non-null object before examining its fields.",
    ],
    [
      "Type predicate",
      "Tell TypeScript when the validated value satisfies the record contract.",
    ],
  ],
  "typescript-7": [
    [
      "Discriminated union",
      "Give each event variant a shared identifying field and its own payload.",
    ],
    [
      "Control-flow narrowing",
      "Check the identifier before reading fields belonging to a specific variant.",
    ],
  ],
  "typescript-8": [
    [
      "keyof and generic constraints",
      "Limit the accepted key to properties that exist on the object type.",
    ],
    [
      "Indexed access type",
      "Connect the return type to the particular key supplied by the caller.",
    ],
  ],
  "typescript-9": [
    [
      "Readonly input array",
      "Accept the collection without promising to modify it.",
    ],
    [
      "Typed reduce accumulator",
      "Describe the summary’s shape and keep every update consistent with that type.",
    ],
  ],
  "typescript-10": [
    [
      "Plant contract and runtime guard",
      "Separate the intended data shape from the checks needed for unknown input.",
    ],
    [
      "Typed collection operations",
      "Filter valid records, select ready names, and reduce records into a summary.",
    ],
  ],
  "typescript-11": [
    [
      "Pick and Partial",
      "Derive an optional update shape from the fields callers are allowed to change.",
    ],
    [
      "Immutable merge",
      "Apply allowed updates while preserving the record’s identity.",
    ],
  ],
  "typescript-12": [
    [
      "Readonly parameter",
      "Express that the function must leave the caller’s collection unchanged.",
    ],
    [
      "Mapping and sorting a copy",
      "Produce an ordered name list without reordering the original records.",
    ],
  ],
  "typescript-13": [
    [
      "Generic object and key parameters",
      "Keep the chosen key constrained to the supplied object’s properties.",
    ],
    [
      "Indexed return type",
      "Preserve the selected property’s specific value type across different object shapes.",
    ],
  ],
  "typescript-14": [
    [
      "Mapped type",
      "Derive field-specific error slots from the keys of the form’s type.",
    ],
    [
      "Validation and optional properties",
      "Add errors only for fields that fail their checks.",
    ],
  ],
  "typescript-16": [
    [
      "unknown and type predicate",
      "Validate a value before claiming it is a Plant.",
    ],
    [
      "Object, null, and property checks",
      "Check the container and the types of each required field in a safe order.",
    ],
  ],
  "typescript-17": [
    [
      "Generic discriminated result",
      "Represent successful data and an error as distinct branches.",
    ],
    [
      "Number conversion and integer checks",
      "Validate the parsed quantity instead of assuming conversion makes it acceptable.",
    ],
  ],
  "typescript-18": [
    [
      "Generic async callback",
      "Preserve the type of the value produced by the operation.",
    ],
    [
      "Promise result and caught errors",
      "Wrap success and failure in explicit result branches without losing the error message.",
    ],
  ],
  "typescript-19": [
    [
      "Overload signatures",
      "Describe the separate input and output relationships callers may use.",
    ],
    [
      "Union implementation and narrowing",
      "Handle either accepted input form inside one implementation.",
    ],
  ],
  "typescript-21": [
    [
      "Discriminated events and switch",
      "Choose a counter update after narrowing to an event variant.",
    ],
    [
      "never and exhaustiveness",
      "Make an unhandled event a type error rather than a silent fallback.",
    ],
  ],
  "typescript-22": [
    [
      "Class, private field, and getter",
      "Keep stock state encapsulated and expose a controlled read operation.",
    ],
    [
      "Methods and numeric validation",
      "Validate amounts before changing stock and handle insufficient stock explicitly.",
    ],
  ],
  "typescript-23": [
    [
      "Constrained generic",
      "Accept different record types while requiring a stable identity field.",
    ],
    [
      "Map and repository methods",
      "Keep typed storage private and expose operations for storing, retrieving, and listing records.",
    ],
  ],
  "typescript-24": [
    [
      "Discriminated loading state",
      "Describe idle, pending, successful, and failed states with the data each needs.",
    ],
    [
      "Narrowed branches",
      "Read data or error fields only after identifying the state that contains them.",
    ],
  ],
  "typescript-26": [
    [
      "Record and satisfies",
      "Check that configuration contains the expected keys and suitable values.",
    ],
    [
      "Key union and lookup",
      "Restrict callers to known route names when selecting a path.",
    ],
  ],
  "typescript-27": [
    [
      "Literal unions and template literal type",
      "Derive valid event names from the allowed entities and actions.",
    ],
    [
      "Typed parameters and string composition",
      "Keep runtime name construction consistent with the event-name contract.",
    ],
  ],
  "typescript-28": [
    [
      "Optional chaining",
      "Read a nested value even when its parent may be absent.",
    ],
    [
      "Nullish fallback",
      "Use a default only for missing values, preserving a legitimate zero.",
    ],
  ],
  "typescript-29": [
    [
      "JSON parsing and unknown data",
      "Treat parsed text as untrusted until its shape is checked.",
    ],
    [
      "Version narrowing and nullable result",
      "Accept only the supported document version and return a clear failure for invalid input.",
    ],
  ],
  "typescript-31": [
    [
      "Typed inventory and immutable updates",
      "Model records and stock actions while preserving record identity.",
    ],
    [
      "Validation, selectors, and UI events",
      "Reject invalid stock changes and derive search results and totals from current data.",
    ],
  ],
  "typescript-32": [
    [
      "Session types and result union",
      "Represent availability and make reservation success or failure explicit.",
    ],
    [
      "Validation and immutable state",
      "Check seat counts and remaining capacity before applying a reservation.",
    ],
    [
      "DOM events and derived availability",
      "Connect form actions to the model and refresh the displayed session information.",
    ],
  ],
  "nextjs-1": [
    [
      "page.tsx and default export",
      "Connect a function component to a route in the app directory.",
    ],
    [
      "main and h1",
      "Give the page a semantic content region and a main heading.",
    ],
  ],
  "nextjs-2": [
    [
      "Client boundary and useState",
      "Enable interactivity and store a value between component renders.",
    ],
    [
      "button, onClick, and functional update",
      "Connect a click to the latest state and render the current value in the button.",
    ],
  ],
  "nextjs-3": [
    [
      "Route folders and page.tsx",
      "Use the file’s location to define the page’s URL.",
    ],
    [
      "Default component, main, heading, and paragraph",
      "Build the route’s visible content with a clear semantic hierarchy.",
    ],
  ],
  "nextjs-4": [
    ["Props type", "Describe the data a project card needs from its parent."],
    [
      "Component composition",
      "Read the props in the card and pass values when rendering it from the page.",
    ],
  ],
  "nextjs-5": [
    [
      "Layout and children",
      "Keep the shared frame while allowing each route to supply its own content.",
    ],
    [
      "ReactNode and navigation",
      "Type the child content and include a route map in the shared frame.",
    ],
  ],
  "nextjs-6": [
    [
      "Metadata export",
      "Describe the route’s browser title and search description separately from its visible content.",
    ],
    [
      "Page component and semantic heading",
      "Keep the page body inside a main landmark with a clear heading.",
    ],
  ],
  "nextjs-7": [
    [
      "Server Component",
      "Use the default server boundary when the page needs no state or browser events.",
    ],
    [
      "Semantic JSX",
      "Render the project’s content in an appropriate heading and paragraph inside main.",
    ],
  ],
  "nextjs-8": [
    [
      "Client directive and state hook",
      "Place interactive state inside a client component.",
    ],
    [
      "Functional state setter",
      "Base the next count on the most recent value when handling a click.",
    ],
  ],
  "nextjs-9": [
    [
      "Loading component and main",
      "Provide useful content while the route is waiting.",
    ],
    [
      "aria-busy and status role",
      "Expose the pending state and its message to assistive technology.",
    ],
  ],
  "nextjs-10": [
    [
      "Typed project props and article",
      "Represent project data with a contract and render it in a self-contained content block.",
    ],
    [
      "Client state and button event",
      "Keep the interactive count in state and update it through a handler.",
    ],
  ],
  "nextjs-11": [
    ["Data array and map", "Turn records into repeated list items."],
    [
      "Stable keys, ul, and li",
      "Give each rendered record a persistent identity inside semantic list markup.",
    ],
  ],
  "nextjs-12": [
    [
      "List component and props",
      "Accept the collection from a parent rather than hardcoding one populated result.",
    ],
    [
      "Conditional rendering",
      "Choose between a useful empty message and a populated list.",
    ],
  ],
  "nextjs-13": [
    [
      "Controlled input and label",
      "Connect the field’s displayed value to state and give it an accessible name.",
    ],
    [
      "Change handler and derived greeting",
      "Update state from user input and calculate the greeting during rendering.",
    ],
  ],
  "nextjs-14": [
    [
      "Single source of state",
      "Store only the count that changes through user interaction.",
    ],
    [
      "Derived values",
      "Calculate the doubled value from the current count instead of synchronizing another state variable.",
    ],
  ],
  "nextjs-16": [
    [
      "Async data loader",
      "Keep obtaining the records separate from the page’s markup.",
    ],
    [
      "Async Server Component and await",
      "Wait for the records at the server boundary, then render their names.",
    ],
  ],
  "nextjs-17": [
    [
      "Dynamic route parameters",
      "Resolve the route’s input before looking up a record.",
    ],
    [
      "Lookup and missing-record branch",
      "Return the known record’s information or an explicit missing result.",
    ],
  ],
  "nextjs-18": [
    [
      "Boundary parsing and integer validation",
      "Check a raw request value before domain logic uses it.",
    ],
    [
      "Status and response description",
      "Describe a successful response or a useful client error for the sandbox’s HTTP boundary.",
    ],
  ],
  "nextjs-19": [
    [
      "unknown, narrowing, and normalization",
      "Check the input type before trimming and validating it.",
    ],
    [
      "Success and error result",
      "Return usable validated data or a clear reason the mutation should not proceed.",
    ],
  ],
  "nextjs-21": [
    [
      "Authentication and ownership",
      "Check both the presence of a user identity and its relationship to the record.",
    ],
    [
      "Guard beside the data",
      "Reject an unauthorized operation where the data is accessed, rather than relying on hidden UI.",
    ],
  ],
  "nextjs-22": [
    [
      "Request cache policy",
      "Choose a freshness strategy based on whether the response contains private or public data.",
    ],
    [
      "Revalidation",
      "Allow public data to refresh after a deliberate interval rather than treating every response the same.",
    ],
  ],
  "nextjs-23": [
    [
      "Search parameters and numeric validation",
      "Read a valid page number from the URL and fall back when it is unsuitable.",
    ],
    [
      "URL encoding",
      "Build shareable links without letting query text break the parameter structure.",
    ],
  ],
  "nextjs-24": [
    [
      "Client error UI",
      "Explain the failure in visible content and provide a clear retry action.",
    ],
    [
      "State and click handler",
      "Let the retry button change what the user sees while recovery is attempted.",
    ],
  ],
  "nextjs-26": [
    [
      "Optimistic update and immutable list",
      "Prepare the visible next state without modifying the previous snapshot.",
    ],
    [
      "Rollback snapshot",
      "Keep a copy that can restore the previous state if the operation fails.",
    ],
  ],
  "nextjs-27": [
    [
      "generateMetadata",
      "Derive the route’s title and description from the same model used for its content.",
    ],
    [
      "generateStaticParams",
      "Describe the route parameter combinations that can be prepared ahead of time.",
    ],
  ],
  "nextjs-28": [
    [
      "Pure update function",
      "Move the task rule below the component so it can be tested independently.",
    ],
    [
      "Identity and immutability",
      "Change only the chosen record and verify that repeated toggles behave predictably.",
    ],
  ],
  "nextjs-29": [
    [
      "Typed component props",
      "Describe the data needed by a reusable statistics card.",
    ],
    [
      "Composition",
      "Render multiple instances with different data instead of duplicating the card’s markup.",
    ],
  ],
  "nextjs-31": [
    [
      "Domain helpers and immutable task updates",
      "Keep task rules in the shared module and derive filtered lists and remaining counts.",
    ],
    [
      "Client state, forms, and handlers",
      "Connect the page’s add, remove, complete, and filter actions to those helpers.",
    ],
    [
      "Component composition and CSS",
      "Organize the board into clear pieces and style them across the provided files.",
    ],
  ],
  "nextjs-32": [
    [
      "Expense model and validation",
      "Check custom entries before adding them to the list.",
    ],
    [
      "State, events, and derived total",
      "Connect quick-add, form submission, and removal to one expense collection.",
    ],
    [
      "Lists and stable keys",
      "Render expenses with persistent identities so updates affect the correct row.",
    ],
  ],
};

export function getCodeHelp(
  lesson: Pick<Lesson, "id">,
): readonly CodeHelpBlock[] {
  return help[lesson.id] ?? [];
}
