const escapeAttribute = (value: string) =>
  value.replace(
    /[&"<>]/g,
    (character) =>
      ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[character]!,
  );

/** Builds supplied documents and exports without rewriting saved learner drafts. */
export function htmlDocument(
  source: string,
  title: string,
  stylesheet = "styles.css",
  script?: string,
) {
  const link = `<link rel="stylesheet" href="${escapeAttribute(stylesheet)}">`;
  if (/<html[\s>]/i.test(source)) {
    let document = source.trim();
    if (!/<!doctype\s+html/i.test(document))
      document = `<!DOCTYPE html>\n${document}`;
    if (!/<head[\s>]/i.test(document))
      document = document.replace(/(<html\b[^>]*>)/i, "$1\n<head></head>");
    if (
      !new RegExp(
        `href=["']${stylesheet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
      ).test(document)
    )
      document = document.replace(/<\/head\s*>/i, `  ${link}\n</head>`);
    if (
      script &&
      !document.includes(`src="${script}"`) &&
      !document.includes(`src='${script}'`)
    )
      document = document.replace(
        /<\/body\s*>/i,
        `  <script src="${escapeAttribute(script)}" defer></script>\n</body>`,
      );
    return document;
  }
  const body = source
    .trim()
    .split("\n")
    .map((line) => (line ? `    ${line}` : ""))
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeAttribute(title)}</title>
    ${link}
${script ? `    <script src="${escapeAttribute(script)}" defer></script>\n` : ""}  </head>
  <body>
${body}
  </body>
</html>\n`;
}
