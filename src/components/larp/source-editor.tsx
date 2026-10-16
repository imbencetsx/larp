"use client";

import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import {
  Annotation,
  Compartment,
  EditorSelection,
  EditorState,
  Prec,
  Transaction,
  countColumn,
} from "@codemirror/state";
import { EditorView, highlightWhitespace, keymap } from "@codemirror/view";
import {
  indentLess,
  indentMore,
  insertNewlineAndIndent,
  insertNewlineKeepIndent,
  temporarilySetTabFocusMode,
} from "@codemirror/commands";
import {
  HighlightStyle,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { tags } from "@lezer/highlight";

const externalChange = Annotation.define<boolean>();
const colors = HighlightStyle.define([
  { tag: tags.keyword, color: "#c9a6e8", class: "code-keyword" },
  { tag: [tags.tagName, tags.typeName], color: "#e9b478", class: "code-tag" },
  {
    tag: [tags.attributeName, tags.propertyName],
    color: "#a5c9e8",
    class: "code-property",
  },
  {
    tag: [tags.string, tags.attributeValue],
    color: "#b8d99a",
    class: "code-string",
  },
  {
    tag: [tags.number, tags.bool, tags.null],
    color: "#e9a78c",
    class: "code-number",
  },
  { tag: tags.comment, color: "#9a9386", class: "code-comment" },
  {
    tag: tags.function(tags.variableName),
    color: "#e3d491",
    class: "code-function",
  },
  {
    tag: [tags.operator, tags.punctuation],
    color: "#d5cbb9",
    class: "code-punctuation",
  },
]);
const theme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "var(--code)",
      color: "var(--foreground)",
      fontSize: "12px",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": {
      fontFamily: "var(--font-code), monospace",
      lineHeight: "22px",
      overflow: "auto",
    },
    ".cm-content": { padding: "12px 0", caretColor: "var(--foreground)" },
    ".cm-line": { padding: "0 12px" },
    ".cm-gutters": {
      backgroundColor: "var(--code)",
      color: "var(--muted-foreground)",
      borderRight: "1px solid var(--border)",
    },
    ".cm-activeLine, .cm-activeLineGutter": {
      backgroundColor: "var(--code-highlight)",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--foreground)" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
      { backgroundColor: "#62734555" },
    ".cm-tooltip": {
      backgroundColor: "var(--popover)",
      color: "var(--popover-foreground)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
    },
    ".cm-highlightSpace:before": { color: "var(--border)" },
    ".cm-highlightTab": { backgroundImage: "none", position: "relative" },
    ".cm-highlightTab:after": {
      content: "'→'",
      position: "absolute",
      insetInlineStart: "0",
      color: "var(--muted-foreground)",
    },
  },
  { dark: true },
);

function insertIndent(view: EditorView) {
  if (view.state.readOnly) return false;
  if (view.state.selection.ranges.some((range) => !range.empty))
    return indentMore(view);
  const { state } = view;
  view.dispatch(
    state.update(
      state.changeByRange((range) => {
        const line = state.doc.lineAt(range.from);
        const column = countColumn(
          state.sliceDoc(line.from, range.from),
          state.tabSize,
        );
        const spaces = " ".repeat(2 - (column % 2));
        return {
          changes: { from: range.from, insert: spaces },
          range: EditorSelection.cursor(range.from + spaces.length),
        };
      }),
      { scrollIntoView: true, userEvent: "input.indent" },
    ),
  );
  return true;
}

function continueLine(view: EditorView) {
  const opensBlock = view.state.selection.ranges.some((range) => {
    const line = view.state.doc.lineAt(range.from);
    const before = view.state.sliceDoc(line.from, range.from);
    const tag = /<([\w-]+)\b[^>]*>\s*$/.exec(before);
    return (
      /[({\[]\s*$/.test(before) ||
      (!!tag &&
        !/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(
          tag[1]!,
        ) &&
        !/\/\s*>\s*$/.test(before))
    );
  });
  return opensBlock
    ? insertNewlineAndIndent(view)
    : insertNewlineKeepIndent(view);
}

export function SourceEditor(props: {
  code: string;
  filename: string;
  onChange: (code: string) => void;
  onRun: () => void;
  onSubmit?: () => void;
  onBlur?: () => void;
  readOnly: boolean;
  maxLength: number;
}) {
  const parent = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const current = useRef(props);
  current.current = props;
  const editable = useRef(new Compartment());
  useEffect(() => {
    const { filename, code, readOnly } = current.current;
    const language = filename.endsWith(".html")
      ? html({ autoCloseTags: true })
      : filename.endsWith(".css")
        ? css()
        : javascript({
            typescript: /\.tsx?$/.test(filename),
            jsx: /\.[jt]sx$/.test(filename),
          });
    const editor = new EditorView({
      parent: parent.current!,
      state: EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          language,
          theme,
          syntaxHighlighting(colors),
          highlightWhitespace(),
          EditorState.tabSize.of(2),
          indentUnit.of("  "),
          editable.current.of([
            EditorState.readOnly.of(readOnly),
            EditorView.editable.of(!readOnly),
          ]),
          EditorView.contentAttributes.of({
            role: "textbox",
            "aria-label": `Code editor for ${filename}`,
            "aria-multiline": "true",
            "aria-describedby": "editor-keyboard-help",
            "data-code-editor": "true",
            spellcheck: "false",
            autocapitalize: "off",
            autocorrect: "off",
          }),
          Prec.highest(
            keymap.of([
              {
                key: "Tab",
                run: insertIndent,
                shift: indentLess,
                preventDefault: true,
              },
              { key: "Enter", run: continueLine, shift: continueLine },
              {
                key: "Mod-Enter",
                run: () => {
                  current.current.onRun();
                  return true;
                },
              },
              {
                key: "Mod-Shift-Enter",
                run: () => {
                  (current.current.onSubmit ?? current.current.onRun)();
                  return true;
                },
              },
              {
                key: "Escape",
                run: (editor) => {
                  temporarilySetTabFocusMode(editor);
                  return false;
                },
              },
            ]),
          ),
          EditorState.changeFilter.of(
            (transaction) =>
              !transaction.docChanged ||
              transaction.annotation(externalChange) === true ||
              transaction.newDoc.length <= current.current.maxLength ||
              transaction.newDoc.length < transaction.startState.doc.length,
          ),
          EditorView.updateListener.of((update) => {
            if (
              update.docChanged &&
              !update.transactions.every((transaction) =>
                transaction.annotation(externalChange),
              )
            )
              current.current.onChange(update.state.doc.toString());
          }),
          EditorView.domEventHandlers({
            blur: () => {
              current.current.onBlur?.();
            },
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [props.filename]);
  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    if (editor.state.doc.toString() !== props.code)
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: props.code },
        annotations: [
          externalChange.of(true),
          Transaction.addToHistory.of(false),
        ],
      });
    if (editor.state.readOnly !== props.readOnly)
      editor.dispatch({
        effects: editable.current.reconfigure([
          EditorState.readOnly.of(props.readOnly),
          EditorView.editable.of(!props.readOnly),
        ]),
      });
  }, [props.code, props.readOnly, props.filename]);
  return <div className="source-editor" ref={parent} />;
}
