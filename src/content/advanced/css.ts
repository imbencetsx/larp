import { lab, css as c, q, quiz } from "./helpers";
const fixture =
  '<main class="studio"><header class="toolbar"><h1>Field Notes</h1><nav><a href="#plants">Plants</a><button>New entry</button></nav></header><section class="gallery" id="plants"><article class="plant"><span class="badge">New</span><div class="art" role="img" aria-label="Basil illustration">✿</div><h2>Basil</h2><p>A bright spot and a little care.</p><button>View plant</button></article><article class="plant"><div class="art" role="img" aria-label="Mint illustration">✿</div><h2>Mint</h2><p>Fresh leaves for the kitchen.</p><button>View plant</button></article><article class="plant"><div class="art" role="img" aria-label="Fern illustration">✿</div><h2>Fern</h2><p>A little shade goes a long way.</p><button>View plant</button></article></section><form><label for="note">Field note</label><input id="note" required><button>Save note</button></form><aside class="notice">Three plants need a check-in.</aside><footer>Grow at your own pace.</footer></main>';
const cssLab: typeof lab = (
  track,
  n,
  title,
  paragraphs,
  task,
  starter,
  solution,
  goals,
  options,
) =>
  lab(track, n, title, paragraphs, task, starter, solution, goals, {
    fixture,
    ...options,
  });
export const cssLessons = [
  cssLab(
    "css",
    11,
    "Position a badge without breaking flow",
    [
      "An absolutely positioned element leaves normal flow and uses its containing block for offsets. A position:relative card is a convenient containing block for a corner badge while the card itself remains in normal flow.",
      "Prefer logical offsets such as inset-inline-end when the design should follow writing direction. z-index only compares elements within stacking contexts; a huge value cannot escape an ancestor's stacking context.",
    ],
    "Anchor the badge to the top-right of each relative plant card.",
    ".plant { padding: 24px; }\n.badge { }",
    ".plant { position: relative; padding: 24px; border: 1px solid #d5c9b5; }\n.badge { position: absolute; top: 8px; right: 8px; background: #f4d17b; padding: 4px; }",
    [
      [
        "Create the badge containing block",
        c(".plant", "position", "relative"),
      ],
      [
        "Take the badge out of normal flow",
        c(".badge", "position", "absolute"),
      ],
      ["Place it eight pixels from the top", c(".badge", "top", "8px")],
    ],
  ),
  cssLab(
    "css",
    12,
    "Fluid type and comfortable measure",
    [
      "rem follows the root font size and respects the reader's font preferences. A ch width approximates the width of the zero glyph and is useful for keeping paragraphs at a comfortable reading measure.",
      "clamp(min, preferred, max) allows a value to grow within bounds. Combine relative units with a viewport term so headings scale without becoming tiny on phones or huge on wide monitors. Test zoom as well as viewport changes.",
    ],
    "Use a fluid heading, readable paragraph measure, and unitless line height.",
    "h1 { }\np { }",
    "h1 { font-size: clamp(2rem, 5vw, 4rem); line-height: 1.1; }\np { max-width: 60ch; line-height: 1.6; font-size: 1rem; }",
    [
      [
        "Bound heading size with clamp",
        c("h1", "font-size", "clamp(2rem, 5vw, 4rem)"),
      ],
      ["Limit paragraph measure", c("p", "max-width", "60ch")],
      ["Use a unitless paragraph rhythm", c("p", "line-height", "1.6")],
    ],
  ),
  cssLab(
    "css",
    13,
    "A grid that chooses its own columns",
    [
      "repeat(auto-fit, minmax(...)) creates as many tracks as fit and expands them into the available space. auto-fill keeps empty tracks; auto-fit collapses empty ones. minmax sets the lower and upper size of each track.",
      "A minimum that is wider than the viewport still overflows. min(100%, 180px) lets the track shrink on especially narrow screens. Set gap on the grid rather than distributing margins across children.",
    ],
    "Make a self-fitting gallery with a narrow-screen-safe minimum and a 16px gap.",
    ".gallery { }",
    ".gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); gap: 16px; }\n.plant { padding: 16px; background: #eee8d9; }",
    [
      ["Enable grid", c(".gallery", "display", "grid")],
      [
        "Use adaptive tracks",
        c(
          ".gallery",
          "grid-template-columns",
          "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
        ),
      ],
      ["Space tracks with gap", c(".gallery", "gap", "16px")],
    ],
  ),
  cssLab(
    "css",
    14,
    "Components that respond to their container",
    [
      "A media query responds to the viewport. A container query responds to an ancestor that establishes containment. That makes a reusable card work in a narrow sidebar and a wide main region without knowing the page layout.",
      "Set container-type:inline-size on the parent, then query its inline size. A container cannot use its own size query to style itself; target its descendants. Here the gallery is the container and its plant cards change layout.",
    ],
    "Make the gallery an inline-size container and turn plant cards into a two-column grid above 420px.",
    ".gallery { }\n.plant { padding: 16px; }",
    ".gallery { container-type: inline-size; }\n.plant { padding: 16px; background: #eee8d9; }\n@container (min-width: 420px) {\n  .plant { display: grid; grid-template-columns: 1fr 2fr; }\n}",
    [
      [
        "Establish a query container",
        c(".gallery", "container-type", "inline-size"),
      ],
      [
        "Change card layout inside the container query",
        c("@container (min-width: 420px) .plant", "display", "grid"),
      ],
      [
        "Give the expanded card two tracks",
        c(
          "@container (min-width: 420px) .plant",
          "grid-template-columns",
          "1fr 2fr",
        ),
      ],
    ],
  ),
  quiz("css", 15, "Checkpoint · responsive layout", [
    q(
      "What establishes a nearby containing block for an absolute badge?",
      [
        "display:none",
        "position:relative on its card",
        "font-weight:bold",
        "margin:auto",
      ],
      1,
      "A positioned ancestor supplies the containing block. The card stays in normal flow.",
    ),
    q(
      "Which unit is tied to the root font size?",
      ["px", "vh", "rem", "% in every property"],
      2,
      "rem follows the root font size. em usually depends on the current element's font size.",
    ),
    q(
      "What does auto-fit do to unused grid tracks?",
      [
        "Collapses them",
        "Always adds a scrollbar",
        "Fixes them at 100px",
        "Makes them absolute",
      ],
      0,
      "Collapsed empty tracks let populated tracks expand into the remaining space.",
    ),
    q(
      "What does a size container query measure?",
      [
        "The browser's total screen",
        "The document's file size",
        "Its own selected element unconditionally",
        "An eligible ancestor query container",
      ],
      3,
      "The ancestor establishes containment. Descendants can respond to its size.",
    ),
  ]),
  cssLab(
    "css",
    16,
    "Logical spacing for every direction",
    [
      "Physical left and right are not always the start and end of a line. Logical properties follow writing mode and text direction: padding-inline is horizontal in ordinary English layouts, while padding-block is vertical.",
      "inline-size and block-size are logical alternatives to width and height. Replacing arbitrary physical offsets makes a component easier to reuse in right-to-left interfaces. Keep physical directions when they actually describe a physical requirement.",
    ],
    "Give plant cards 24px inline padding, 16px block padding, and a 4px inline-start accent.",
    ".plant { }",
    ".plant { padding-inline: 24px; padding-block: 16px; border-inline-start: 4px solid #52734d; margin-block: 12px; background: #f1eadb; }",
    [
      ["Use logical inline spacing", c(".plant", "padding-inline", "24px")],
      ["Use logical block spacing", c(".plant", "padding-block", "16px")],
      [
        "Add a direction-aware accent",
        c(".plant", "border-inline-start", "4px solid #52734d"),
      ],
    ],
  ),
  cssLab(
    "css",
    17,
    "Stable artwork and predictable cropping",
    [
      "aspect-ratio reserves a shape even before media loads. object-fit:cover crops an image to fill its box; contain preserves the entire image with possible empty space. Neither changes the original asset.",
      "Give the box a definite size or aspect ratio, and constrain its width. An image still needs meaningful alt text in HTML. Avoid fixing a whole card's height when its text can grow at larger font sizes.",
    ],
    "Reserve square artwork and keep images cropped inside their available width.",
    ".art { }\nimg { }",
    ".art { aspect-ratio: 1; background: #d4e2b8; display: grid; place-items: center; font-size: 4rem; }\nimg { width: 100%; height: 100%; object-fit: cover; }",
    [
      ["Reserve a square art region", c(".art", "aspect-ratio", "1")],
      ["Constrain image width", c("img", "width", "100%")],
      ["Crop without distorting", c("img", "object-fit", "cover")],
    ],
  ),
  cssLab(
    "css",
    18,
    "Mini project · a sticky workspace",
    [
      "position:sticky behaves like an in-flow element until it reaches an offset in its scroll container. A sticky element needs an offset such as top. An ancestor with overflow can change which container it sticks inside.",
      "Build a workspace using grid for the page regions and flex for the toolbar. min-width:0 on flexible children allows long content to shrink instead of forcing the page wider. Sticky controls must leave room for focused content.",
    ],
    "Build a workspace with a sticky toolbar, a flexible gallery, and cards that can shrink.",
    ".studio { }\n.toolbar { }\n.gallery { }\n.plant { }",
    ".studio { display: grid; gap: 20px; padding: 20px; font-family: system-ui; }\n.toolbar { display: flex; justify-content: space-between; position: sticky; top: 0; background: #f5efdf; z-index: 1; }\n.gallery { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }\n.plant { min-width: 0; padding: 16px; background: #e3eacc; }",
    [
      [
        "Keep toolbar visible within its scroll container",
        c(".toolbar", "position", "sticky"),
      ],
      ["Set the sticky threshold", c(".toolbar", "top", "0")],
      ["Prevent intrinsic card overflow", c(".plant", "min-width", "0")],
    ],
    { kind: "project", duration: 25 },
  ),
  cssLab(
    "css",
    19,
    "A cascade you can reason about",
    [
      "Cascade layers let you define precedence between groups of normal author rules before specificity is compared. In @layer reset, components, utilities, later layers win over earlier ones for normal declarations. Unlayered normal rules outrank layered normal rules.",
      "Specificity is not a reason to keep adding ids or !important. Keep selectors low in specificity and reserve utilities for intentional overrides. Important declarations reverse layer ordering, so avoid using them to patch a poorly planned cascade.",
    ],
    "Create a components layer with the card rule and a utilities layer with the compact override.",
    "@layer reset, components, utilities;\n/* Add the layered rules */",
    "@layer reset, components, utilities;\n@layer components { .plant { padding: 24px; border: 1px solid #cabfa9; } }\n@layer utilities { .compact { padding: 8px; } }",
    [
      [
        "Define default card padding",
        c("@layer components .plant", "padding", "24px"),
      ],
      [
        "Define a compact override",
        c("@layer utilities .compact", "padding", "8px"),
      ],
      [
        "Keep a visible component border",
        c("@layer components .plant", "border", "1px solid #cabfa9"),
      ],
    ],
  ),
  quiz("css", 20, "Checkpoint · component systems", [
    q(
      "What follows text direction automatically?",
      ["padding-left", "float:right", "padding-inline-start", "background:red"],
      2,
      "Logical inline-start follows the start edge in the active writing direction.",
    ),
    q(
      "Which combination avoids a distorted image?",
      [
        "Fixed width with arbitrary stretched height",
        "object-fit:cover within a sized box",
        "font-size:0",
        "z-index:999",
      ],
      1,
      "object-fit preserves the image's aspect ratio while controlling fit inside its box.",
    ),
    q(
      "Why can a sticky header fail to stick?",
      [
        "It has a heading",
        "It has a background",
        "Its text is short",
        "It lacks an offset or uses an unexpected scroll container",
      ],
      3,
      "Sticky positioning depends on a threshold and the ancestor scrolling context.",
    ),
    q(
      "For normal declarations, what wins over layered author rules?",
      [
        "Unlayered author rules",
        "Any shorter selector",
        "A comment",
        "The alphabetically first file",
      ],
      0,
      "Layer precedence is resolved before specificity. Unlayered normal rules sit above layered normal rules.",
    ),
  ]),
  cssLab(
    "css",
    21,
    "Select by relationship",
    [
      ":has() selects an element based on matching descendants or related elements. A card can highlight itself when its input is invalid or when a checkbox is checked. :focus-within selects an element that contains the focused control.",
      "Relational selectors reduce styling-only JavaScript, but keep their scope specific. A broad body:has(...) rule can be harder to reason about. Preserve a visible focus indicator and avoid relying on color alone for error feedback.",
    ],
    "Highlight a form containing an invalid input and outline a plant card while a descendant is focused.",
    "form { padding: 12px; }",
    "form { padding: 12px; }\nform:has(input:invalid) { border: 2px solid #b54738; }\n.plant:focus-within { outline: 2px solid #35634a; outline-offset: 4px; }",
    [
      [
        "Select a form with invalid input",
        c("form:has(input:invalid)", "border", "2px solid #b54738"),
      ],
      [
        "Keep a focus-within outline",
        c(".plant:focus-within", "outline", "2px solid #35634a"),
      ],
      [
        "Separate the outline from the card",
        c(".plant:focus-within", "outline-offset", "4px"),
      ],
    ],
  ),
  cssLab(
    "css",
    22,
    "Motion that respects preferences",
    [
      "Animate transform and opacity for a small entrance effect rather than repeatedly changing layout dimensions. An animation defines keyframes, a duration, and a timing curve. It should help explain state, not distract from reading.",
      "prefers-reduced-motion lets people ask for less animation. Remove nonessential animation in that query. Avoid hiding content until an animation runs, because scripts, styles, or motion settings might prevent the animation from starting.",
    ],
    "Give cards a short entrance and turn it off when reduced motion is requested.",
    ".plant { }\n/* Add keyframes and a reduced-motion rule */",
    ".plant { animation: arrive 200ms ease-out; padding: 20px; }\n@keyframes arrive { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\n@media (prefers-reduced-motion: reduce) { .plant { animation: none; } }",
    [
      [
        "Add a brief entrance",
        c(".plant", "animation", "arrive 200ms ease-out"),
      ],
      [
        "Start from an offset",
        c("@keyframes arrive from", "transform", "translateY(8px)"),
      ],
      [
        "Respect reduced motion",
        c(
          "@media (prefers-reduced-motion: reduce) .plant",
          "animation",
          "none",
        ),
      ],
    ],
  ),
  cssLab(
    "css",
    23,
    "Scroll with intentional stopping points",
    [
      "A horizontal collection can use overflow-x:auto and scroll-snap-type to align cards after scrolling. scroll-snap-align identifies each stop. Use proximity for gentle assistance; mandatory snapping can be awkward when content is larger than the viewport.",
      "Never make dragging the only way to reach content. Keep cards and links reachable by keyboard. Give the collection a clear label in HTML and avoid hiding the scrollbar when it is the only clue that more content exists.",
    ],
    "Make the gallery a horizontal rail with proximity snapping and 80% width cards.",
    ".gallery { }\n.plant { }",
    ".gallery { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x proximity; padding: 12px; }\n.plant { flex: 0 0 80%; scroll-snap-align: start; padding: 20px; background: #e2e9cf; }",
    [
      ["Allow horizontal scrolling", c(".gallery", "overflow-x", "auto")],
      [
        "Use proximity snapping",
        c(".gallery", "scroll-snap-type", "x proximity"),
      ],
      [
        "Align cards at their starts",
        c(".plant", "scroll-snap-align", "start"),
      ],
    ],
  ),
  cssLab(
    "css",
    24,
    "Mini project · a resilient form",
    [
      "A form layout should tolerate long labels, browser autofill, keyboard focus, and validation messages. Use inherited typography on controls, a full available width, and border-box so padding does not push fields outside their container.",
      "Keep a clear focus-visible outline. Invalid styling should accompany explanatory text in HTML; CSS alone cannot tell someone how to fix a value. Test at 200% zoom and on a narrow screen before treating the form as finished.",
    ],
    "Style a compact, readable form with full-width controls and keyboard-visible focus.",
    "form { }\ninput { }\ninput:focus-visible { }",
    "form { max-width: 32rem; padding: 24px; background: #f1ebdc; }\nlabel { display: block; margin-block: 12px 4px; }\ninput { box-sizing: border-box; width: 100%; font: inherit; padding: 12px; border: 1px solid #958974; }\ninput:focus-visible { outline: 3px solid #35634a; outline-offset: 2px; }\nbutton { font: inherit; padding: 10px 18px; }",
    [
      ["Limit the form's reading width", c("form", "max-width", "32rem")],
      [
        "Keep controls within their width",
        c("input", "box-sizing", "border-box"),
      ],
      [
        "Provide a strong focus indicator",
        c("input:focus-visible", "outline", "3px solid #35634a"),
      ],
    ],
    { kind: "project", duration: 25 },
  ),
  quiz("css", 25, "Checkpoint · accessible polish", [
    q(
      "Which selects a parent form that contains an invalid input?",
      [
        "form:has(input:invalid)",
        "form > :parent",
        "input::form",
        "form:hover-only",
      ],
      0,
      "has() lets the form match based on a descendant's state.",
    ),
    q(
      "What is a good reduced-motion treatment for decorative entrances?",
      [
        "Double their speed",
        "Hide all cards",
        "Disable the nonessential animation",
        "Disable keyboard navigation",
      ],
      2,
      "Content remains available while the optional motion is removed.",
    ),
    q(
      "Why choose scroll-snap proximity over mandatory for a card rail?",
      [
        "It removes the need for navigation",
        "It offers gentler alignment without forcing every stop",
        "It downloads fewer images",
        "It creates more cards",
      ],
      1,
      "Proximity assists nearby stopping without forcing every scroll position onto a snap point.",
    ),
    q(
      "Why use border-box on a full-width input?",
      [
        "It makes the input read-only",
        "It removes its label",
        "It changes text direction",
        "It includes padding and borders in the declared width",
      ],
      3,
      "The input's outer width stays within the available space.",
    ),
  ]),
  cssLab(
    "css",
    26,
    "Theme with custom properties",
    [
      "Custom properties inherit and are resolved where var() is used. Define semantic roles such as --surface, --ink, and --accent instead of naming every token after a literal color. A component can override a token locally without rewriting all its declarations.",
      "A fallback in var(--token, fallback) handles a missing or invalid custom property reference. It does not fix every invalid value for the final CSS property. Keep color pairs readable and test focus states in both themes.",
    ],
    "Define a warm dark palette and consume the surface and ink tokens in plant cards.",
    ":root { }\n.plant { }",
    ":root { --surface: #24211d; --ink: #eee8dc; --accent: #a2c884; }\nbody { background: #171512; color: var(--ink); font-family: system-ui; }\n.plant { background: var(--surface); color: var(--ink); padding: 20px; }\nbutton { background: var(--accent); color: #172010; }",
    [
      ["Define a semantic surface", c(":root", "--surface", "#24211d")],
      [
        "Consume the surface token",
        c(".plant", "background", "var(--surface)"),
      ],
      ["Consume the ink token", c(".plant", "color", "var(--ink)")],
    ],
  ),
  cssLab(
    "css",
    27,
    "Print the content people need",
    [
      "A print media query can remove navigation and controls, switch to ink-friendly colors, and keep related content together. break-inside:avoid asks the formatter not to split a card across pages when it can reasonably keep it together.",
      "Do not rely on background graphics for essential meaning because print settings may omit them. Keep links understandable in the document, and preview multiple paper sizes. A print stylesheet is part of product usability, especially for receipts and guides.",
    ],
    "Make the plant guide print without navigation or controls, using dark text on white and unbroken cards.",
    ".plant { padding: 20px; }",
    ".plant { padding: 20px; }\n@media print {\n  nav, button { display: none; }\n  body { background: white; color: black; }\n  .plant { break-inside: avoid; }\n}",
    [
      ["Hide navigation in print", c("@media print nav", "display", "none")],
      [
        "Use paper-friendly background",
        c("@media print body", "background", "white"),
      ],
      [
        "Keep cards together when possible",
        c("@media print .plant", "break-inside", "avoid"),
      ],
    ],
  ),
  cssLab(
    "css",
    28,
    "Control intrinsic sizing",
    [
      "Grid and flex items have automatic minimum sizes that can preserve long content even when it overflows. min-width:0 or min-inline-size:0 allows a child to shrink; minmax(0,1fr) does the same for a flexible grid track.",
      "overflow-wrap:anywhere can break a long URL when needed. Avoid applying overflow:hidden to the entire page to hide a sizing bug, since it can conceal focused controls and useful content. Fix the element that causes the overflow.",
    ],
    "Build a two-column studio that can shrink and wrap long card text.",
    ".studio { }\n.plant { }\n.plant p { }",
    ".studio { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 20px; }\n.plant { min-inline-size: 0; padding: 16px; }\n.plant p { overflow-wrap: anywhere; }",
    [
      [
        "Let both grid tracks shrink",
        c(".studio", "grid-template-columns", "minmax(0, 1fr) minmax(0, 2fr)"),
      ],
      [
        "Remove the card's automatic minimum",
        c(".plant", "min-inline-size", "0"),
      ],
      [
        "Allow emergency word breaks",
        c(".plant p", "overflow-wrap", "anywhere"),
      ],
    ],
  ),
  cssLab(
    "css",
    29,
    "Use feature detection for enhancements",
    [
      "@supports checks whether the browser understands a CSS feature. Write a useful baseline first, then enhance it inside the query. A feature check is more robust than guessing support from a browser's name or version.",
      "Progressive enhancement means the content works before the optional feature arrives. A simple block gallery can become a grid when supported. Keep source order meaningful so different layouts still have the same reading and keyboard order.",
    ],
    "Provide a block gallery fallback and enhance it to a grid using a feature query.",
    ".gallery { }",
    ".gallery { display: block; }\n.plant { padding: 16px; margin-block: 12px; background: #e6e9d5; }\n@supports (display: grid) { .gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } }",
    [
      ["Keep a baseline block layout", c(".gallery", "display", "block")],
      [
        "Enhance only when grid is supported",
        c("@supports (display: grid) .gallery", "display", "grid"),
      ],
      [
        "Define enhanced columns",
        c(
          "@supports (display: grid) .gallery",
          "grid-template-columns",
          "1fr 1fr",
        ),
      ],
    ],
  ),
  quiz("css", 30, "Checkpoint · production CSS", [
    q(
      "Which is a semantic color token?",
      ["--bright-green-2", "--surface", "--random-hex", "--pixel-6"],
      1,
      "A role such as surface describes the color's purpose, making themes easier to maintain.",
    ),
    q(
      "What does break-inside:avoid request in print?",
      [
        "Always add a blank page",
        "Hide overflow",
        "Keep a box together where possible",
        "Disable printing",
      ],
      2,
      "It discourages splitting the box, while the formatter may still split content too large for a page.",
    ),
    q(
      "Which helps a grid track shrink below its content's automatic minimum?",
      ["minmax(0, 1fr)", "z-index:0", "font-style:italic", "position:relative"],
      0,
      "A zero track minimum permits shrinking. Fix child wrapping as well when content is unbreakable.",
    ),
    q(
      "What should be outside an @supports enhancement?",
      [
        "An empty page",
        "Only error messages",
        "A user-agent check",
        "A useful baseline layout",
      ],
      3,
      "The baseline remains functional when the enhancement is unavailable.",
    ),
  ]),
  cssLab(
    "css",
    31,
    "Capstone · a responsive planning dashboard",
    [
      "Turn the provided semantic markup into a finished planning dashboard. Establish a small token system, a clear toolbar, adaptive cards, distinct actions, and a readable note form. Use spacing and hierarchy before adding decoration.",
      "The gallery must collapse without horizontal page overflow. Keep keyboard focus visible and make all form controls inherit the surrounding font. This is a complete CSS application interface; the JavaScript path supplies its behavior.",
      "Test at a phone-sized preview, a wide window, and browser zoom. Inspect the longest label and the form's invalid state. A finished stylesheet needs to handle those states as well as the ideal screenshot.",
    ],
    "Ship a warm dark dashboard with tokens, an adaptive gallery, usable form controls, and visible keyboard focus.",
    ":root { }\nbody { }\n.studio { }\n.gallery { }\n.plant { }\nbutton:focus-visible { }",
    ":root { --surface: #27231e; --ink: #eee8dd; --accent: #a3c98b; }\n* { box-sizing: border-box; }\nbody { margin: 0; background: #191714; color: var(--ink); font: 16px/1.5 system-ui; }\n.studio { max-width: 1000px; margin: auto; padding: 24px; }\n.toolbar, .toolbar nav { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; justify-content: space-between; }\na { color: var(--accent); }\n.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 16px; margin-block: 24px; }\n.plant { position: relative; min-width: 0; background: var(--surface); padding: 20px; border: 1px solid #4a443a; }\n.art { color: var(--accent); font-size: 4rem; }\n.badge { position: absolute; top: 8px; right: 8px; color: var(--accent); }\nbutton { background: var(--accent); color: #192014; border: 0; padding: 10px 16px; font: inherit; cursor: pointer; }\nbutton:focus-visible, input:focus-visible { outline: 3px solid #f4d17b; outline-offset: 3px; }\nlabel { display: block; }\ninput { width: 100%; padding: 12px; font: inherit; margin-block: 8px; }\n.notice { padding: 16px; border-inline-start: 3px solid var(--accent); }\nfooter { margin-top: 24px; }",
    [
      [
        "Build the adaptive gallery",
        c(
          ".gallery",
          "grid-template-columns",
          "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        ),
      ],
      [
        "Use the shared surface token",
        c(".plant", "background", "var(--surface)"),
      ],
      [
        "Keep actions keyboard-visible",
        c("button:focus-visible", "outline", "3px solid #f4d17b"),
      ],
      ["Keep controls readable", c("input", "font", "inherit")],
    ],
    {
      kind: "project",
      filename: "dashboard.css",
      projectBrief: [
        "Resize the preview and confirm cards collapse without overflow.",
        "Tab through every action and field.",
        "Add a light theme by overriding semantic tokens.",
      ],
    },
  ),
  cssLab(
    "css",
    32,
    "Capstone · a polished storefront",
    [
      "A storefront needs product comparison, clear prices, and consistent actions. Build a reusable card system rather than styling every card independently. Use a container query so the cards adapt when embedded in another page.",
      "Provide a sticky store header without covering focused content, a layout that wraps down to one column, a coherent focus state, and a print view. Product images should reserve space to prevent layout shifts.",
      "This capstone delivers the visual application shell. The markup is provided, so your work is concentrated on CSS architecture, responsiveness, and accessibility. The JavaScript shop capstone adds basket behavior.",
    ],
    "Finish the Seed Supply storefront: responsive product grid, square art, sticky toolbar, usable buttons, and a print mode.",
    ".studio { }\n.toolbar { }\n.gallery { }\n.art { }\n/* Build the store stylesheet */",
    ":root { --paper: #f5efdf; --ink: #332d24; --accent: #315c42; }\n* { box-sizing: border-box; }\nbody { margin: 0; font: 16px/1.5 system-ui; color: var(--ink); background: var(--paper); }\n.studio { max-width: 1100px; margin: auto; padding: 20px; }\n.toolbar { position: sticky; top: 0; z-index: 2; background: var(--paper); padding-block: 12px; }\n.toolbar nav { display: flex; gap: 16px; align-items: center; }\na { color: var(--accent); }\n.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 20px; container-type: inline-size; margin-block: 24px; }\n.plant { min-width: 0; border: 1px solid #cfc3ad; padding: 20px; }\n.art { aspect-ratio: 1; display: grid; place-items: center; font-size: 5rem; color: var(--accent); background: #e1e7ce; }\nbutton { padding: 12px 20px; border: 0; background: var(--accent); color: white; font: inherit; cursor: pointer; }\nbutton:focus-visible { outline: 3px solid #9e6135; outline-offset: 3px; }\ninput { font: inherit; padding: 12px; max-width: 100%; }\n.badge { font-weight: bold; }\n.notice, footer { margin-block: 24px; }\n@media print { .toolbar { position: static; } button { display: none; } .plant { break-inside: avoid; } }",
    [
      ["Keep the store toolbar sticky", c(".toolbar", "position", "sticky")],
      [
        "Adapt product columns",
        c(
          ".gallery",
          "grid-template-columns",
          "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
        ),
      ],
      ["Reserve square product art", c(".art", "aspect-ratio", "1")],
      [
        "Provide keyboard focus",
        c("button:focus-visible", "outline", "3px solid #9e6135"),
      ],
      [
        "Keep product cards together in print",
        c("@media print .plant", "break-inside", "avoid"),
      ],
    ],
    {
      kind: "project",
      filename: "storefront.css",
      projectBrief: [
        "Test narrow and wide layouts with long product names.",
        "Use print preview to inspect page breaks.",
        "Keep the same HTML and create a second theme using tokens.",
      ],
    },
  ),
];
