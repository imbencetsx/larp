import DOMPurify from "dompurify";
import type { PreviewEvent } from "./simulation";

export function isPreviewEvent(value: unknown): value is PreviewEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<PreviewEvent>;
  return (
    Number.isInteger(event.id) &&
    event.id! >= 0 &&
    event.id! <= 100000 &&
    ["click", "submit", "input", "change"].includes(event.type ?? "") &&
    Array.isArray(event.fields) &&
    event.fields.length <= 100 &&
    event.fields.every(
      (field) =>
        field &&
        Number.isInteger(field.id) &&
        field.id >= 0 &&
        field.id <= 100000 &&
        typeof field.value === "string" &&
        field.value.length <= 2000 &&
        typeof field.checked === "boolean",
    )
  );
}
export function previewDocument(
  html: string,
  css = "",
  bridge?: {
    channel: string;
    origin: string;
    interactive: boolean;
    focusId?: number;
  },
) {
  // Learner HTML is data. Only our nonce-authorized event bridge can execute.
  const renamed = new Map<string, string>();
  // Keep DOM-clobbering protection while retaining label/ARIA associations.
  DOMPurify.addHook("uponSanitizeAttribute", (_node, attribute) => {
    if (
      ["src", "poster", "background", "srcset"].includes(attribute.attrName) &&
      !/^data:image\/(png|gif|jpe?g|webp|avif);base64,/i.test(
        attribute.attrValue,
      )
    )
      attribute.keepAttr = false;
    if (
      ["href", "xlink:href"].includes(attribute.attrName) &&
      !attribute.attrValue.startsWith("#")
    )
      attribute.keepAttr = false;
    if (
      (attribute.attrName === "id" || attribute.attrName === "name") &&
      attribute.attrValue in globalThis.document
    ) {
      const original = attribute.attrValue;
      const safe = `larp-preview-${original}`;
      attribute.attrValue = safe;
      renamed.set(original, safe);
    }
  });
  let clean: string;
  try {
    clean = DOMPurify.sanitize(html, {
      WHOLE_DOCUMENT: true,
      FORBID_TAGS: [
        "script",
        "iframe",
        "frame",
        "frameset",
        "object",
        "embed",
        "base",
        "meta",
        "link",
      ],
      FORBID_ATTR: [
        "srcdoc",
        "nonce",
        "autofocus",
        "formaction",
        "action",
        "target",
        "download",
      ],
      ALLOW_DATA_ATTR: true,
    });
  } finally {
    DOMPurify.removeHook("uponSanitizeAttribute");
  }
  const document = new DOMParser().parseFromString(clean, "text/html");
  for (const node of document.querySelectorAll(
    "[for],[aria-labelledby],[aria-describedby]",
  ))
    for (const attribute of ["for", "aria-labelledby", "aria-describedby"]) {
      const value = node.getAttribute(attribute);
      if (value)
        node.setAttribute(
          attribute,
          value
            .split(/\s+/)
            .map((id) => renamed.get(id) ?? id)
            .join(" "),
        );
    }
  for (const node of document.querySelectorAll('[href^="#"]')) {
    const id = node.getAttribute("href")!.slice(1);
    if (renamed.has(id)) node.setAttribute("href", `#${renamed.get(id)}`);
  }
  const selectors = (value: string) =>
    value.replace(/#([a-zA-Z_][\w-]*)/g, (full, id: string) =>
      renamed.has(id) ? `#${renamed.get(id)}` : full,
    );
  css = selectors(css);
  for (const style of document.querySelectorAll("style"))
    style.textContent = selectors(style.textContent ?? "");
  for (const node of document.querySelectorAll("a,area"))
    if (!node.getAttribute("href")?.startsWith("#"))
      node.removeAttribute("href");
  // srcdoc inherits the parent policy, so the bridge must satisfy both policies.
  const parentNonce =
    globalThis.document.querySelector<HTMLScriptElement>(
      "script[nonce]",
    )?.nonce;
  const nonce = parentNonce ?? crypto.randomUUID().replaceAll("-", "");
  const style = `<style>${css.replace(/<\/style/gi, " ")}</style>`;
  const safeHTML = document.body.innerHTML;
  const contentStyles = [...document.head.querySelectorAll("style")]
    .map((node) => node.outerHTML)
    .join("");
  const bridgeCode = bridge
    ? `(()=>{const options=${JSON.stringify(bridge).replace(/</g, "\\u003c")};let timer;const fields=()=>Array.from(document.querySelectorAll('input[data-sim-id],select[data-sim-id],textarea[data-sim-id]')).slice(0,100).map(node=>({id:Number(node.dataset.simId),value:String(node.value).slice(0,2000),checked:!!node.checked}));const send=(node,type)=>parent.postMessage({kind:'larp-preview',channel:options.channel,event:{id:Number(node.dataset.simId),type,fields:fields()}},options.origin);document.addEventListener('click',event=>{const link=event.target.closest('a,area');if(link&&!link.getAttribute('href')?.startsWith('#'))event.preventDefault();if(!options.interactive)return;const button=event.target.closest('button[data-sim-id]');if(button&&!(button.form&&button.type==='submit')){event.preventDefault();send(button,'click');}});document.addEventListener('submit',event=>{if(event.target.method==='dialog')return;event.preventDefault();if(options.interactive&&event.target.dataset.simId)send(event.target,'submit');});document.addEventListener('input',event=>{if(options.interactive&&event.target.dataset.simInput==='true'){clearTimeout(timer);timer=setTimeout(()=>send(event.target,'input'),300);}});document.addEventListener('change',event=>{if(options.interactive&&event.target.dataset.simChange==='true')send(event.target,'change');});if(options.focusId!==undefined){const field=document.querySelector('[data-sim-id="'+options.focusId+'"]');if(field){field.focus();try{field.setSelectionRange(field.value.length,field.value.length)}catch{}}}})();`
    : "";
  const policy = `default-src 'none'; script-src ${bridge ? `'nonce-${nonce}'` : "'none'"}; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'`;
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer">${style}${contentStyles}</head><body>${safeHTML}${bridge ? `<script nonce="${nonce}">${bridgeCode}</script>` : ""}</body></html>`;
}
