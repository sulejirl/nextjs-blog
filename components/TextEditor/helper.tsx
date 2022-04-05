import { Editor, Transforms, Text, Node, Element } from "slate";
import {
  ReactEditor,
} from "slate-react";
import imageExtensions from "image-extensions";
import isUrl from "is-url";
import escapeHtml from "escape-html";
import { jsx } from "slate-hyperscript";

type EmptyText = {
  text: string;
};

type ImageElement = {
  type: "image";
  url: string;
  children: EmptyText[];
};

type DividerElement = {
  type: "divider";
  children: EmptyText[];
};

const LIST_TYPES = ["numbered-list", "bulleted-list", "divider", "block-quote"];
export const EditorCommands = {
  isBoldMarkActive(editor) {
    const [match]: any = Editor.nodes(editor, {
      match: (n: any) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match]: any = Editor.nodes(editor, {
      match: (n: any) => n.type === "code",
    });

    return !!match;
  },
  isFormatActive(editor, format) {
    const [match]: any = Editor.nodes(editor, {
      match: (n) => n[format] === true,
      mode: "all",
    });
    return !!match;
  },
  isBlockActive(editor, format) {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
      })
    );

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = EditorCommands.isBoldMarkActive(editor);
    Transforms.setNodes(editor, { bold: isActive ? null : true } as any, {
      match: (n) => Text.isText(n),
      split: true,
    });
  },

  toggleCodeBlock(editor) {
    const isActive = EditorCommands.isCodeBlockActive(editor);
    Transforms.setNodes(editor, { type: isActive ? null : "code" } as any, {
      match: (n) => Editor.isBlock(editor, n),
    });
  },
  toggleH3(editor) {
    const isActive = EditorCommands.isCodeBlockActive(editor);
    Transforms.setNodes(editor, { type: isActive ? null : "h1" } as any, {
      match: (n) => Editor.isBlock(editor, n),
    });
  },
  toggleFormat(editor, format) {
    const isActive = EditorCommands.isFormatActive(editor, format);
    Transforms.setNodes(
      editor,
      { [format]: isActive ? null : true },
      { match: Text.isText, split: true }
    );
  },
  toggleBlockFormat(editor, format) {
    const isActive = EditorCommands.isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);
    const text = { text: "" };
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        LIST_TYPES.includes(n.type),
      split: true,
    });
    const newProperties: Partial<Element> = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
      children: [text],
    };

    Transforms.setNodes<Element>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [text] };
      Transforms.wrapNodes(editor, block);
    }
  },
  insertImage(editor, url) {
    const text = { text: "" };
    const image: ImageElement = { type: "image", url, children: [text] };
    const emptyLine: any = { type: "paragraph", children: [text] };
    Transforms.insertNodes(editor, image as any);
    Transforms.insertNodes(editor, emptyLine as any);
  },
  insertDivider(editor) {
    const { selection } = editor;
    const absPath = selection.anchor.path;
    const text = { text: "" };
    const Divider: DividerElement = { type: "divider", children: [text] };
    const emptyLine: any = { type: "paragraph", children: [text] };
    Transforms.delete(editor, { at: [absPath[0]] });
    Transforms.insertNodes(editor, Divider as any ,{ at: [absPath[0]] });
    Transforms.insertNodes(editor, emptyLine as any,{ at: [absPath[0] + 1] });
    ReactEditor.focus(editor);
    Transforms.select(editor, {
      path: [absPath[0] + 1],
      offset: 0,
    });
  },

  serialize(value) {
    return (
      value
        // Return the string content of each paragraph in the value's children.
        .map((n) => Node.string(n))
        // Join them all with line breaks denoting paragraphs.
        .join("\n")
    );
  },

  htmlSerialize(node: any) {
    if (Text.isText(node)) {
      let string = escapeHtml(node.text);
      if (node.bold) {
        string = `<strong>${string}</strong>`;
      }
      if (node.italic) {
        string = `<em>${string}</em>`;
      }
      if (node.underlined) {
        string = `<u>${string}</u>`;
      }
      return string;
    }
    const children = node.children
      .map((n) => EditorCommands.htmlSerialize(n))
      .join("");

    switch (node.type) {
      case "quote":
        return `<blockquote><p>${children}</p></blockquote>`;
      case "h1":
        return `<h1>${children}</h1>`;
      case "h3":
        return `<h3>${children}</h3>`;
      case "paragraph":
        return `<p>${children}</p>`;
      case "divider":
        return `<hr>${children}</hr>`;
      case "list-item":
        return `<li>${children}</li>`;
      case "numbered-list":
        return `<ol>${children}</ol>`;
      case "image":
        return `<img src="${escapeHtml(node.url)}" height=${
          node.height || 200
        } width=${node.width || 200} alignment=${
          node.alignment
        }>${children}</img>`;
      case "link":
        return `<a href="${escapeHtml(node.url)}">${children}</a>`;
      default:
        return children;
    }
  },

  htmlDeserialize(el) {
    if (el.nodeType === 3) {
      return el.textContent;
    } else if (el.nodeType !== 1) {
      return null;
    }

    let children = Array.from(el.childNodes).map(
      EditorCommands.htmlDeserialize
    );

    if (children.length === 0) {
      children = [{ text: "" }];
    }

    switch (el.nodeName) {
      case "BODY":
        return jsx("fragment", {}, children);
      case "BR":
        return "\n";
      case "BLOCKQUOTE":
        return jsx("element", { type: "quote" }, children);
      case "H1":
        return jsx("element", { type: "h1" }, children);
      case "H3":
        return jsx("element", { type: "h3" }, children);
      case "HR":
        return jsx("element", { type: "divider" }, children);
      case "LI":
        return jsx("element", { type: "list-item" }, children);
      case "OL":
        return jsx("element", { type: "numbered-list" }, children);
      case "P":
        return jsx("element", { type: "paragraph" }, children);
      case "STRONG":
        return jsx("text", { type: "paragraph", bold: true }, children);
      case "EM":
        return jsx("text", { type: "paragraph", italic: true }, children);
      case "IMG":
        return jsx(
          "element",
          {
            type: "image",
            url: el.getAttribute("src"),
            height: el.getAttribute("height"),
            width: el.getAttribute("width"),
            alignment: el.getAttribute("alignment"),
          },
          children
        );
      case "A":
        return jsx(
          "element",
          { type: "link", url: el.getAttribute("href") },
          children
        );
      default:
        return el.textContent;
    }
  },
  deserialize(string) {
    if (!string) return null;
    // Return a value array of children derived by splitting the string.
    return string.split("\n").map((line) => {
      return {
        children: [{ text: line }],
      };
    });
  },
  isImageUrl(url) {
    if (!url) return false;
    if (!isUrl(url)) return false;
    const ext = new URL(url).pathname.split(".").pop();
    return imageExtensions.includes(ext);
  },
};
