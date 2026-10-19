import ts from "typescript";

// Describe the public names a learner must create without filling their bodies.
export function lessonOutline(source, filename) {
  if (filename.endsWith(".css")) {
    return [...source.matchAll(/([^{}]+)\{/g)]
      .map(
        (match) =>
          `${match[1].replace(/\/\*[\s\S]*?\*\//g, "").trim()} {\n  /* Write your declarations here. */\n}`,
      )
      .filter((text) => !text.startsWith(" {"))
      .join("\n\n");
  }
  if (!/\.[cm]?[jt]sx?$/.test(filename)) return "";
  const file = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  return file.statements
    .flatMap((node) => {
      if (
        ts.isImportDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node)
      )
        return [node.getText(file)];
      if (ts.isFunctionDeclaration(node)) {
        const modifiers =
          node.modifiers?.map((modifier) => modifier.getText(file)).join(" ") ??
          "";
        return [
          `${modifiers ? modifiers + " " : ""}function ${node.name?.getText(file) ?? ""}${node.typeParameters?.length ? `<${node.typeParameters.map((type) => type.getText(file)).join(", ")}>` : ""}(${node.parameters.map((parameter) => parameter.getText(file)).join(", ")})${node.type ? `: ${node.type.getText(file)}` : ""} {\n  // Build this function in the steps below.\n}`,
        ];
      }
      if (ts.isVariableStatement(node)) {
        const kind =
          node.declarationList.flags & ts.NodeFlags.Const ? "const" : "let";
        return node.declarationList.declarations.map(
          (declaration) =>
            `${kind} ${declaration.name.getText(file)}${declaration.type ? `: ${declaration.type.getText(file)}` : ""} = /* choose the value or implementation from the task */;`,
        );
      }
      if (ts.isClassDeclaration(node))
        return [
          `class ${node.name?.getText(file) ?? ""} {\n  // Add the fields and methods described in the steps.\n}`,
        ];
      return [];
    })
    .join("\n\n");
}
