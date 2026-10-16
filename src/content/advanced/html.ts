import { lab, html as h, q, quiz } from "./helpers";

const siteStyle = `<style>body{font:16px/1.6 system-ui;margin:0;background:#f8f4e9;color:#30291f}header,main,footer{max-width:760px;margin:auto;padding:24px}nav{display:flex;gap:20px}a{color:#326044}article,fieldset,details{border:1px solid #c8bdab;padding:16px;margin:16px 0}label{display:block}input,select,textarea,button{font:inherit;padding:8px;margin:4px 0}button{background:#305740;color:white;border:0}h1{line-height:1.2}</style>`;
export const htmlLessons = [
  lab(
    "html",
    11,
    "Forms with meaningful groups",
    [
      "A long form is easier to understand when related controls share a fieldset and a short legend. Radio controls belong to one mutually exclusive group when they share a name. A checkbox is an independent yes-or-no choice.",
      "Give every control its own id and explicit label. The submitted value comes from value, not from the visible label. A checked radio is included under its group name; an unchecked checkbox is omitted entirely.",
    ],
    "Build a delivery preference form with two delivery radio choices and an optional updates checkbox.",
    "<form>\n  <fieldset>\n    <!-- Group the delivery options -->\n  </fieldset>\n</form>",
    '<form><fieldset><legend>Delivery</legend><label for="pickup">Pick up</label><input id="pickup" type="radio" name="delivery" value="pickup"><label for="post">Post</label><input id="post" type="radio" name="delivery" value="post"></fieldset><label for="updates">Send updates</label><input id="updates" type="checkbox" name="updates"><button>Save preferences</button></form>',
    [
      ["Name the delivery group with a legend", h("fieldset > legend")],
      [
        "Add pickup and post radios sharing name delivery",
        h('input[type="radio"][name="delivery"][value="post"]'),
      ],
      [
        "Add a labeled updates checkbox",
        h('label[for="updates"] + input#updates[type="checkbox"]'),
      ],
    ],
  ),
  lab(
    "html",
    12,
    "Let the browser validate",
    [
      "HTML constraints give immediate feedback without JavaScript. required checks presence, type=email checks a basic email shape, and min/max constrain numeric values. minlength counts text characters; pattern checks a regular expression against the entire value.",
      "Browser validation is a convenience for the person completing the form. A server must validate the same inputs again because an HTTP request can bypass the form. Explain constraints in visible text and associate that help using aria-describedby.",
    ],
    "Create a ticket form: a required email, 1–6 seats, and a help-linked booking code of three uppercase letters.",
    "<form>\n  <!-- Add constrained fields and visible help -->\n  <button>Book seats</button>\n</form>",
    '<form><label for="email">Email</label><input id="email" type="email" name="email" required><label for="seats">Seats</label><input id="seats" type="number" name="seats" min="1" max="6" required><label for="code">Booking code</label><input id="code" name="code" pattern="[A-Z]{3}" aria-describedby="code-help" required><p id="code-help">Use three uppercase letters.</p><button>Book seats</button></form>',
    [
      ["Require a valid email", h('input[type="email"][required]')],
      ["Constrain seats to 1–6", h('input[type="number"][min="1"][max="6"]')],
      [
        "Connect the code constraint to visible help",
        h('input[pattern="[A-Z]{3}"][aria-describedby="code-help"]'),
      ],
    ],
  ),
  lab(
    "html",
    13,
    "Accessible audio and video",
    [
      "Media controls should be available to the person watching. Avoid autoplay with sound. Video can list several source elements so the browser chooses a supported format; a track element supplies timed captions separately from the picture.",
      "Captions include speech and meaningful sounds. A transcript supplies the content as ordinary text and can describe visual information that the audio omits. In a deployed project the .webm and .vtt files must actually exist; this offline lab checks the markup.",
    ],
    "Mark up a workshop video with controls, a WebM source, English captions, and a linked transcript.",
    "<section>\n  <h2>Workshop recording</h2>\n  <!-- Add video and transcript link -->\n</section>",
    '<section><h2>Workshop recording</h2><video controls preload="metadata"><source src="workshop.webm" type="video/webm"><track src="captions.vtt" kind="captions" srclang="en" label="English" default></video><a href="#transcript">Read transcript</a><div id="transcript"><h3>Transcript</h3><p>Start by choosing a sunny spot for the seed tray.</p></div></section>',
    [
      [
        "Provide user-controlled video",
        h("video[controls] > source[type='video/webm']"),
      ],
      [
        "Add an English captions track",
        h('track[kind="captions"][srclang="en"]'),
      ],
      ["Link to an on-page transcript", h('a[href="#transcript"]')],
    ],
  ),
  lab(
    "html",
    14,
    "Choose the right image",
    [
      "A responsive image can offer several resolutions with srcset. The sizes attribute tells the browser how much layout space the image will occupy. The browser chooses based on that space, pixel density, and other factors; it does not simply load every candidate.",
      "Use picture when the crop or format changes, and keep a fallback img as the last child. Put alternative text on img. Width and height reserve the aspect ratio before loading, while loading=lazy is suited to images below the initial viewport.",
    ],
    "Build a responsive project picture with a wide-screen source and a lazy fallback with dimensions and useful alt text.",
    "<figure>\n  <!-- Offer a wide and narrow project image -->\n</figure>",
    '<figure><picture><source media="(min-width: 700px)" srcset="garden-wide.webp"><img src="garden-small.webp" alt="Seed trays arranged on a sunny shelf" width="640" height="480" loading="lazy"></picture><figcaption>Spring planting shelf</figcaption></figure>',
    [
      [
        "Offer a media-specific image source",
        h("picture > source[media][srcset]"),
      ],
      [
        "Reserve image dimensions and lazy-load",
        h("picture > img[width][height][loading='lazy'][alt]"),
      ],
      ["Describe the figure with a caption", h("figure > figcaption")],
    ],
  ),
  quiz("html", 15, "Checkpoint · forms and media", [
    q(
      "What groups radio controls into one choice?",
      [
        "The same id",
        "The same name",
        "The same label text",
        "A surrounding div",
      ],
      1,
      "A shared name creates the radio group. Each id must still be unique.",
    ),
    q(
      "Does required make an API endpoint safe from missing input?",
      [
        "Yes, the browser blocks every request",
        "Only on mobile",
        "No, the server must validate independently",
        "Only if the label has for",
      ],
      2,
      "Requests can be sent without using your form. Validate again at the server boundary.",
    ),
    q(
      "Where does alternative text belong in a picture element?",
      ["On every source", "On picture", "In a CSS rule", "On the fallback img"],
      3,
      "The img represents the image and carries its text alternative. Sources only offer candidates.",
    ),
    q(
      "Which media addition serves people who cannot hear the recording?",
      ["A captions track", "Autoplay", "A larger poster image", "preload=auto"],
      0,
      "Captions carry speech and relevant sounds in sync with the recording.",
    ),
  ]),
  lab(
    "html",
    16,
    "A dialog with a real close action",
    [
      "The dialog element represents a dialog. showModal() opens it in the top layer and gives it modal behavior; the open attribute alone displays a non-modal dialog. A form with method=dialog closes its enclosing dialog without sending an HTTP request.",
      "Give the dialog an accessible name using aria-labelledby and a heading id. Plan where focus goes when opening and closing. This lab starts the dialog open so you can test the native close button without adding JavaScript.",
    ],
    "Create an open, named confirmation dialog with a native close form.",
    "<dialog open>\n  <!-- Add a heading and native close action -->\n</dialog>",
    '<dialog open aria-labelledby="confirm-title"><h2 id="confirm-title">Reservation saved</h2><p>Your seat is ready.</p><form method="dialog"><button value="done">Done</button></form></dialog>',
    [
      [
        "Connect the dialog name to its heading",
        h('dialog[aria-labelledby="confirm-title"] > h2#confirm-title'),
      ],
      ["Use native dialog form submission", h('dialog form[method="dialog"]')],
      [
        "Provide a Done control",
        h('form[method="dialog"] button[value="done"]', "Done"),
      ],
    ],
  ),
  lab(
    "html",
    17,
    "Progress is different from a measurement",
    [
      "progress describes completion of a task, such as an upload. Its max sets the total and value sets completed work. Leave value out for indeterminate progress. meter describes a measurement in a known range, such as storage use or moisture.",
      "Label both elements and provide useful text. A meter can have low, high, and optimum to express the preferred part of its range. Do not use progress for a rating just because its default appearance looks like a bar.",
    ],
    "Show a labeled 3-of-5 setup progress bar and a labeled moisture meter at 40 out of 100.",
    "<section>\n  <h2>Greenhouse status</h2>\n</section>",
    '<section><h2>Greenhouse status</h2><label for="setup">Setup complete</label><progress id="setup" value="3" max="5">3 of 5</progress><label for="moisture">Soil moisture</label><meter id="moisture" min="0" max="100" value="40" low="25" high="75" optimum="50">40%</meter></section>',
    [
      ["Label setup progress", h('label[for="setup"] + progress#setup')],
      ["Represent three of five steps", h('progress[value="3"][max="5"]')],
      [
        "Represent moisture as a measurement",
        h('meter#moisture[value="40"][max="100"]'),
      ],
    ],
  ),
  lab(
    "html",
    18,
    "Build a product card contract",
    [
      "data-* attributes attach private application data to elements. A script can read data-product-id as element.dataset.productId. They do not replace semantic attributes such as href, type, disabled, or aria-expanded.",
      "Put an action on a button and navigation on a link. Explicit type=button prevents an action button inside a form from submitting it accidentally. A clear data contract also makes event delegation possible later in JavaScript.",
    ],
    "Make two product cards with product ids, real detail links, and non-submit add buttons carrying their product ids.",
    '<section aria-label="Seed catalog">\n  <!-- Add basil and mint cards -->\n</section>',
    '<section aria-label="Seed catalog"><article data-product-id="basil"><h2>Basil</h2><a href="/products/basil">Basil details</a><button type="button" data-add="basil">Add Basil</button></article><article data-product-id="mint"><h2>Mint</h2><a href="/products/mint">Mint details</a><button type="button" data-add="mint">Add Mint</button></article></section>',
    [
      ["Give Basil a stable data id", h('article[data-product-id="basil"]')],
      ["Link to Mint details", h('a[href="/products/mint"]')],
      [
        "Use an explicit action button",
        h('button[type="button"][data-add="basil"]'),
      ],
    ],
  ),
  lab(
    "html",
    19,
    "Design for a keyboard",
    [
      "A skip link lets keyboard users jump past repeated navigation to main content. Use ordinary anchors and a real target id. Native buttons and links already participate in the focus order; positive tabindex values usually create a confusing alternate order.",
      "Every input needs an accessible name. Icon-only controls need a name too, but a visible word is often easier to understand. Use tabindex=-1 only when an element needs to receive programmatic focus without joining the normal Tab sequence.",
    ],
    "Add a skip link, a focusable main target, and an accessibly named search field.",
    '<header><nav><a href="/">Home</a></nav></header>\n<main><h1>Catalog</h1></main>',
    '<a href="#content">Skip to content</a><header><nav aria-label="Main"><a href="/">Home</a></nav></header><main id="content" tabindex="-1"><h1>Catalog</h1><form role="search"><label for="query">Find a seed</label><input id="query" name="q" type="search"><button>Search</button></form></main>',
    [
      ["Link straight to main content", h('a[href="#content"]', "Skip")],
      [
        "Make main a focus target outside the Tab order",
        h('main#content[tabindex="-1"]'),
      ],
      [
        "Label the search field",
        h('label[for="query"] + input#query[type="search"]'),
      ],
    ],
  ),
  quiz("html", 20, "Checkpoint · native interaction", [
    q(
      "Which opens a modal dialog with native modal behavior?",
      [
        "Adding class=modal",
        "Setting open",
        "Calling showModal()",
        "Adding role=button",
      ],
      2,
      "showModal() puts a dialog in the top layer and makes outside content inert. open alone is non-modal.",
    ),
    q(
      "Which element describes 65% of a file upload?",
      ["meter", "progress", "output only", "blockquote"],
      1,
      "An upload is progress toward task completion. A meter is a measurement in a range.",
    ),
    q(
      "What does this button do inside a normal form?",
      [
        "Nothing until a type is set",
        "Always closes the page",
        "Navigates to a URL",
        "Submits the form by default",
      ],
      3,
      "The default button type in a normal form is submit. Specify type=button for a separate action.",
      '<button data-add="basil">Add</button>',
    ),
    q(
      "What is the most robust clickable navigation element?",
      [
        "An a with href",
        "A span with onClick",
        "A div with cursor:pointer",
        "An img with a title",
      ],
      0,
      "A real anchor supports keyboard use, copy link, open in new tab, and navigation semantics.",
    ),
  ]),
  lab(
    "html",
    21,
    "Structured event information",
    [
      "Machine-readable values make content more useful. time can show a friendly date while datetime holds an ISO date. address is contact information for the nearest article or document, rather than a generic wrapper for any street address.",
      "Microdata adds item names and properties to existing markup. It does not guarantee a special search result. Keep the structured values consistent with the visible content; invisible or contradictory metadata makes the page less trustworthy.",
    ],
    "Mark up a workshop article with Event microdata, a named event, a machine-readable date, and organizer contact.",
    "<article>\n  <h2>Seed swap</h2>\n</article>",
    '<article itemscope itemtype="https://schema.org/Event"><h2 itemprop="name">Seed swap</h2><time itemprop="startDate" datetime="2027-04-12">12 April 2027</time><address>Organizer: <a href="mailto:hello@example.com">Mira</a></address></article>',
    [
      [
        "Identify the structured event",
        h('article[itemscope][itemtype="https://schema.org/Event"]'),
      ],
      ["Name the event", h('[itemprop="name"]', "Seed swap")],
      [
        "Supply a machine-readable date",
        h('time[itemprop="startDate"][datetime="2027-04-12"]'),
      ],
    ],
  ),
  lab(
    "html",
    22,
    "Mark up technical writing",
    [
      "Semantic text elements carry meaning beyond their appearance. code marks computer code; pre preserves whitespace; kbd represents user input; samp represents program output. A definition list pairs terms in dt with descriptions in dd.",
      "Escape literal angle brackets as &lt; and &gt; when showing HTML source. Otherwise the browser interprets the example as elements. Use abbr with an expanded title when an abbreviation needs explaining.",
    ],
    "Create a help page with an escaped HTML example, a keyboard shortcut, and a definition list.",
    "<main>\n  <h1>Studio help</h1>\n</main>",
    '<main><h1>Studio help</h1><pre><code>&lt;h1&gt;Garden&lt;/h1&gt;</code></pre><p>Save with <kbd>Ctrl</kbd> + <kbd>S</kbd>.</p><dl><dt>HTML</dt><dd>The structure of a web document.</dd></dl><p><abbr title="Cascading Style Sheets">CSS</abbr> controls presentation.</p></main>',
    [
      ["Show literal HTML as code", h("pre > code", "<h1>")],
      ["Mark a keyboard input", h("kbd", "Ctrl")],
      ["Pair a term with its definition", h("dl > dt + dd")],
    ],
  ),
  lab(
    "html",
    23,
    "Draw an accessible inline icon",
    [
      "Inline SVG is part of the document and scales without a separate image request. viewBox defines its coordinate system. A meaningful standalone SVG can use role=img and aria-labelledby pointing to a title inside the SVG.",
      "When an icon merely repeats a visible button label, hide that decorative SVG from assistive technology with aria-hidden=true. Do not give the same icon both a redundant spoken name and a visible text label.",
    ],
    "Create a named standalone sprout SVG plus a Save button containing a decorative SVG.",
    "<section>\n  <!-- Add meaningful and decorative SVGs -->\n</section>",
    '<section><svg viewBox="0 0 32 32" role="img" aria-labelledby="sprout-title"><title id="sprout-title">A growing sprout</title><path d="M16 28V12M16 18L7 9M16 14L25 5" stroke="green" fill="none"/></svg><button type="button"><svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16"><path d="M2 2h12v12H2z" fill="green"/></svg>Save</button></section>',
    [
      [
        "Give the meaningful SVG an image role and name",
        h('svg[role="img"][aria-labelledby="sprout-title"]'),
      ],
      ["Provide its title", h("svg > title#sprout-title")],
      ["Hide a redundant button icon", h('button svg[aria-hidden="true"]')],
    ],
  ),
  lab(
    "html",
    24,
    "Mini project · workshop registration",
    [
      "An event page needs a coherent reading order: event name, schedule, practical details, then registration. Build the same order in the document so it remains useful without styling. Keep one h1 and use h2 for the main sections.",
      "Form controls need names to be submitted. Use a select for a compact list of sessions, a fieldset for related preferences, and an explicit submit button. Native details can hold an FAQ without increasing the visual density of the page.",
    ],
    "Assemble a workshop page with a schedule, session selection, required attendee email, and expandable FAQ.",
    "<main>\n  <h1>Spring workshop</h1>\n  <!-- Build the schedule, registration, and FAQ -->\n</main>",
    '<main><h1>Spring workshop</h1><section><h2>Schedule</h2><ol><li><time datetime="09:00">09:00</time> Seed starting</li><li><time datetime="11:00">11:00</time> Container gardens</li></ol></section><form><fieldset><legend>Reserve a place</legend><label for="attendee">Email</label><input id="attendee" name="email" type="email" required><label for="session">Session</label><select id="session" name="session"><option value="seeds">Seed starting</option><option value="containers">Container gardens</option></select><button type="submit">Reserve</button></fieldset></form><details><summary>What should I bring?</summary><p>A notebook and your favorite seeds.</p></details></main>',
    [
      ["Include a machine-readable schedule", h("main ol time[datetime]")],
      [
        "Collect an email and session",
        h('form select[name="session"] > option[value="containers"]'),
      ],
      ["Provide an expandable FAQ", h("details > summary")],
    ],
    { kind: "project", duration: 25 },
  ),
  quiz("html", 25, "Checkpoint · semantics and accessibility", [
    q(
      "Which datetime value is machine-readable?",
      ["Next spring", "2027-04-12", "Mondayish", "In two weeks"],
      1,
      "An ISO date identifies a date without relying on local date wording.",
    ),
    q(
      "How do you display literal <main> in a code example?",
      [
        "Put raw <main> inside p",
        "Use a title attribute",
        "Write &lt;main&gt; inside code",
        "Use a CSS comment",
      ],
      2,
      "Character references display the angle brackets instead of creating an element.",
    ),
    q(
      "An SVG repeats a button's visible Save text. What should it do?",
      [
        "Be aria-hidden=true",
        "Have tabindex=1",
        "Have a second Save label",
        "Replace the button",
      ],
      0,
      "Hide redundant decoration so the control is announced once with its visible name.",
    ),
    q(
      "What makes a form control appear in submitted form data?",
      [
        "A CSS class",
        "A placeholder",
        "An id alone",
        "A name and an eligible current value",
      ],
      3,
      "The name is the submitted key. Disabled controls and unchecked checkboxes are omitted.",
    ),
  ]),
  lab(
    "html",
    26,
    "Search that has a URL",
    [
      "A GET form encodes its fields in the URL query string. That makes a search bookmarkable and shareable. POST usually sends its fields in a request body and is more appropriate for changes than for a simple read-only search.",
      "The input name is the query key: name=q produces ?q=fern. Do not put passwords or private tokens in a GET form. The preview blocks actual navigation; inspect the markup here and test the full request in a deployed page.",
    ],
    "Create a GET catalog search with query q and a category filter.",
    "<form>\n  <!-- Add search and category -->\n</form>",
    '<form action="/catalog" method="get" role="search"><label for="q">Search catalog</label><input id="q" type="search" name="q"><label for="category">Category</label><select id="category" name="category"><option value="all">All</option><option value="herbs">Herbs</option></select><button type="submit">Find seeds</button></form>',
    [
      [
        "Use a GET request to /catalog",
        h('form[action="/catalog"][method="get"]'),
      ],
      ["Submit search under q", h('input[type="search"][name="q"]')],
      ["Offer a named category filter", h('select[name="category"]')],
    ],
  ),
  lab(
    "html",
    27,
    "Help people fill it in",
    [
      "autocomplete tokens let the browser and password managers offer known information. inputmode hints which software keyboard to show; it does not validate input. A postal code is text because leading zeroes and letters can be meaningful.",
      "Use a visible error container with an id and connect it using aria-describedby. aria-invalid describes a field that has actually failed validation; do not mark an untouched form invalid on first render. Allow paste and avoid autocomplete=off on normal identity fields.",
    ],
    "Build a delivery form using appropriate autocomplete and keyboard hints, with help for the postal code.",
    "<form>\n  <!-- Make the address easy to enter -->\n</form>",
    '<form><label for="full-name">Full name</label><input id="full-name" name="name" autocomplete="name"><label for="street">Street address</label><textarea id="street" name="street" autocomplete="street-address"></textarea><label for="postal">Postal code</label><input id="postal" name="postal" type="text" autocomplete="postal-code" aria-describedby="postal-help"><p id="postal-help">Include any leading zeroes.</p><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></form>',
    [
      ["Support full-name autofill", h('input[autocomplete="name"]')],
      [
        "Keep postal codes as text with help",
        h(
          'input[type="text"][autocomplete="postal-code"][aria-describedby="postal-help"]',
        ),
      ],
      ["Offer telephone input hints", h('input[type="tel"][inputmode="tel"]')],
    ],
  ),
  lab(
    "html",
    28,
    "A useful receipt",
    [
      "A receipt combines identity, line items, totals, and contact details. A table is appropriate because each row has the same price and quantity relationships. Put the total in tfoot and the shop's contact details in address.",
      "Use data to attach a machine-readable value to a friendly amount and time for the purchase date. Keep the information readable without images. A print stylesheet can later hide navigation and use paper-friendly colors without changing the document.",
    ],
    "Build a receipt with scoped headers, a purchase date, a line item, and a total footer.",
    "<article>\n  <h1>Receipt #104</h1>\n</article>",
    '<article><h1>Receipt #104</h1><time datetime="2027-04-12">12 April 2027</time><table><caption>Your order</caption><thead><tr><th scope="col">Item</th><th scope="col">Price</th></tr></thead><tbody><tr><th scope="row">Basil seeds</th><td><data value="450">€4.50</data></td></tr></tbody><tfoot><tr><th scope="row">Total</th><td>€4.50</td></tr></tfoot></table><address>Questions? <a href="mailto:shop@example.com">Email the shop</a></address></article>',
    [
      ["Identify the purchase date", h("time[datetime]")],
      ["Keep line items in the table body", h("tbody th[scope='row']")],
      ["Include a labeled total", h("tfoot th[scope='row']", "Total")],
    ],
  ),
  lab(
    "html",
    29,
    "Prepare a reusable template",
    [
      "A template stores inert HTML: its contents are not rendered in the page until a script clones template.content into the document. It is useful for repeated cards and rows because the structure can be authored as HTML rather than concatenated strings.",
      "Do not assume that hiding content sanitizes it. When JavaScript later fills a template, prefer textContent for untrusted strings. Keep stable ids on the template and container, while repeated cards use classes rather than duplicate ids.",
    ],
    "Create an inert product-card template and an empty live results container with an accessible status.",
    "<main>\n  <h1>Seed catalog</h1>\n</main>",
    '<main><h1>Seed catalog</h1><p role="status" id="result-status">No results loaded.</p><section id="results" aria-label="Products"></section><template id="product-card"><article class="product"><h2 class="product-name"></h2><p class="product-price"></p><button type="button" class="add-product">Add to basket</button></article></template></main>',
    [
      ["Create the inert card template", h("template#product-card")],
      ["Provide a results target", h('section#results[aria-label="Products"]')],
      ["Provide a live result status", h('p#result-status[role="status"]')],
    ],
  ),
  quiz("html", 30, "Checkpoint · ready to ship", [
    q(
      "Why use GET for a public catalog search?",
      [
        "It encrypts the query",
        "It updates the database automatically",
        "Its URL can be shared and bookmarked",
        "It hides every field",
      ],
      2,
      "GET expresses a read operation and places named values in the URL. It does not provide secrecy.",
    ),
    q(
      "Why is a postal code usually text?",
      [
        "Leading zeroes and letters can matter",
        "It is never submitted",
        "Number inputs cannot have labels",
        "All postal codes are one digit",
      ],
      0,
      "Postal codes identify places rather than quantities. Numeric coercion can destroy their meaning.",
    ),
    q(
      "What happens to template contents before cloning?",
      [
        "They execute automatically",
        "They replace main",
        "They are sent as a form",
        "They stay inert and unrendered",
      ],
      3,
      "A template is a source of reusable DOM content, not a visible section.",
    ),
    q(
      "When should aria-invalid=true appear?",
      [
        "On every required field at load",
        "When the field has failed validation",
        "Only on submit buttons",
        "Whenever a label is missing",
      ],
      1,
      "Describe a real invalid state and connect an explanation, instead of announcing errors before interaction.",
    ),
  ]),
  lab(
    "html",
    31,
    "Capstone · a searchable field guide",
    [
      "Build a complete static reference app using native document behavior. A table of contents jumps to entries; details expands care notes; a GET form describes the future search endpoint. The local page must remain useful even without that endpoint.",
      "Start with a semantic outline, then create three self-contained plant articles with a shared information structure. Add a comparison table and contact information. Test the jump links, keyboard order, and disclosure controls in the preview.",
      "This is a complete static site, not a JavaScript search engine. The next language courses add filtering and persistence. Download the finished HTML to run it in a browser and supply a backend later if you want server-powered search.",
    ],
    "Ship Field Notes: a complete guide with a skip link, entry navigation, three articles with care disclosures, a comparison table, and an email contact.",
    '<!doctype html>\n<html lang="en">\n<head><title>Field Notes</title></head>\n<body>\n  <!-- Build the complete field guide -->\n</body>\n</html>',
    '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Field Notes — an herb guide</title>' +
      siteStyle +
      '</head><body><a href="#content">Skip to content</a><header><h1>Field Notes</h1><p>A small, useful guide to kitchen herbs.</p><nav aria-label="Herbs"><a href="#basil">Basil</a><a href="#mint">Mint</a><a href="#rosemary">Rosemary</a></nav></header><main id="content" tabindex="-1"><article id="basil"><h2>Basil</h2><p>Soft leaves for summer meals.</p><details><summary>Basil care</summary><p>Bright light and consistently moist soil.</p></details></article><article id="mint"><h2>Mint</h2><p>A fragrant herb for tea.</p><details><summary>Mint care</summary><p>Grow in a container to contain spreading roots.</p></details></article><article id="rosemary"><h2>Rosemary</h2><p>An evergreen with aromatic needles.</p><details><summary>Rosemary care</summary><p>Sun and freely draining soil.</p></details></article><table><caption>Light needs</caption><thead><tr><th scope="col">Herb</th><th scope="col">Light</th></tr></thead><tbody><tr><th scope="row">Basil</th><td>Bright</td></tr><tr><th scope="row">Mint</th><td>Partial sun</td></tr></tbody></table></main><footer><address><a href="mailto:notes@example.com">Suggest an entry</a></address></footer></body></html>',
    [
      ["Make the guide keyboard navigable", h('a[href="#content"]')],
      [
        "Build three articles with native care disclosures",
        h("main > article:nth-of-type(3) details > summary"),
      ],
      ["Compare plants with scoped headers", h('table thead th[scope="col"]')],
      ["Provide a footer contact", h('footer address a[href^="mailto:"]')],
    ],
    {
      kind: "project",
      filename: "field-notes.html",
      projectBrief: [
        "Test every internal navigation link and disclosure.",
        "Read the page in document order without styles.",
        "Extend it with two herbs and a glossary before sharing.",
      ],
    },
  ),
  lab(
    "html",
    32,
    "Capstone · the workshop booking site",
    [
      "Combine your document, form, media, and accessibility skills in one small product. Visitors need to know what the event offers, compare sessions, choose seats, enter contact details, and understand what happens next.",
      "Use HTML constraints for helpful immediate feedback and label each control. The preview intentionally prevents network submission. A real booking service still needs a server to check capacity, validate input, take payment if needed, and send a confirmation.",
      "Keep the page complete as a static prototype: include a schedule, a registration form, an FAQ, and an organizer contact. The deliverable can become a real app in the JavaScript and Next.js capstones.",
    ],
    "Build Workshop Club: a complete event site with a schedule table, a labeled booking form, 1–6 seats, required attendee email, agreement checkbox, FAQ, and contact footer.",
    '<!doctype html>\n<html lang="en"><head><title>Workshop Club</title></head>\n<body><!-- Build your event site --></body></html>',
    '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Workshop Club — book a spring session</title>' +
      siteStyle +
      '</head><body><header><h1>Workshop Club</h1><p>Make something useful with your hands.</p><nav aria-label="Page"><a href="#schedule">Schedule</a><a href="#booking">Book</a><a href="#faq">FAQ</a></nav></header><main><section id="schedule"><h2>Spring sessions</h2><table><caption>12 April 2027</caption><thead><tr><th scope="col">Time</th><th scope="col">Session</th></tr></thead><tbody><tr><th scope="row"><time datetime="09:00">09:00</time></th><td>Seed starting</td></tr><tr><th scope="row"><time datetime="11:00">11:00</time></th><td>Container gardens</td></tr></tbody></table></section><section id="booking"><h2>Reserve your place</h2><form action="/bookings" method="post"><fieldset><legend>Your booking</legend><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required><label for="session">Session</label><select id="session" name="session"><option value="seeds">Seed starting</option><option value="containers">Container gardens</option></select><label for="seats">Seats</label><input id="seats" name="seats" type="number" min="1" max="6" value="1" required><label><input type="checkbox" name="terms" required> I agree to the cancellation policy.</label><button type="submit">Reserve seats</button></fieldset></form></section><section id="faq"><h2>Questions</h2><details><summary>Can beginners join?</summary><p>Yes. All materials and guidance are included.</p></details><details><summary>Can I cancel?</summary><p>Email us at least two days before your session.</p></details></section></main><footer><address><a href="mailto:club@example.com">Contact the organizers</a></address></footer></body></html>',
    [
      [
        "Provide the session schedule",
        h("#schedule table tbody tr:nth-child(2)"),
      ],
      [
        "Collect a required attendee email",
        h('form[method="post"] input[type="email"][required][name="email"]'),
      ],
      [
        "Constrain seats and require agreement",
        h('form input[name="seats"][min="1"][max="6"]'),
      ],
      ["Include agreement and expandable help", h("#faq details summary")],
      [
        "Require the booking agreement",
        h('input[name="terms"][type="checkbox"][required]'),
      ],
    ],
    {
      kind: "project",
      filename: "workshop-club.html",
      projectBrief: [
        "Try submitting empty and invalid fields to inspect native validation.",
        "Test the entire page using Tab, Shift+Tab, Enter, and Space.",
        "In a deployed service, validate every booking again on the server.",
      ],
    },
  ),
];
