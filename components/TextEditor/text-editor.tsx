import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Slate,
  Editable,
  ReactEditor,
  withReact,
  useSlate,
  useFocused,
} from "slate-react";
import {
  Editor,
  Transforms,
  Text,
  createEditor,
  Element,
  BaseEditor,
  Descendant,
  Range,
  Node,
} from "slate";
import { css } from "@emotion/css";
import { withHistory } from "slate-history";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  AddCircleOutlineOutlined,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";

import {
  Button,
  Icon,
  Menu,
  Portal,
  CodeElement,
  DefaultElement,
} from "./components";
import { EditorCommands } from "./helper";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const serialize = (value) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n) => Node.string(n))
      // Join them all with line breaks denoting paragraphs.
      .join("\n")
  );
};

// Define a deserializing function that takes a string and returns a value.
const deserialize = (string) => {
  if (!string) return null;
  // Return a value array of children derived by splitting the string.
  return string.split("\n").map((line) => {
    return {
      children: [{ text: line }],
    };
  });
};
const HoveringMenuExample = () => {
  const focused = useFocused();
  const initialValue: CustomElement[] = [
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ];
  const [value, setValue] = useState<Descendant[]>(
    (typeof window !== "undefined" &&
      deserialize(window.localStorage.getItem("content"))) ||
      initialValue
  );
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      case "h1":
        return <h1 {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);
  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);

        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (isAstChange) {
          // Save the value to Local Storage.
          localStorage.setItem("content", serialize(value));
        }
      }}
    >
      <HoveringToolbar />
      <SideToolbar />
      <div>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            EditorCommands.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            EditorCommands.toggleCodeBlock(editor);
          }}
        >
          Code Block
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            EditorCommands.toggleH3(editor);
          }}
        >
          H3
        </button>
      </div>
      <Editable
        renderLeaf={(props) => <Leaf {...props} />}
        renderElement={renderElement}
        placeholder="Enter some text..."
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }

          // Replace the `onKeyDown` logic with our new commands.
          switch (event.key) {
            case "`": {
              event.preventDefault();
              EditorCommands.toggleCodeBlock(editor);
              break;
            }

            case "b": {
              event.preventDefault();
              EditorCommands.toggleBoldMark(editor);
              break;
            }
          }
        }}
        onDOMBeforeInput={(event: InputEvent) => {
          switch (event.inputType) {
            case "formatBold":
              return toggleFormat(editor, "bold");
            case "formatItalic":
              return toggleFormat(editor, "italic");
            case "formatUnderline":
              return toggleFormat(editor, "underlined");
            case "formatH3":
              return toggleFormat(editor, "h3");
          }
        }}
      />
    </Slate>
  );
};

const toggleFormat = (editor, format) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true }
  );
};

const isFormatActive = (editor, format) => {
  const [match]: any = Editor.nodes(editor, {
    match: (n) => n[format] === true,
    mode: "all",
  });
  return !!match;
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underlined) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const SideToolbar = () => {
  const ref = useRef<HTMLDivElement | null>();
  const editor = useSlate();
  const [showSideToolbar, setShowSideToolbar] = useState(false);
  const [lineHeight, setLineHeight] = useState(0);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const { selection, children } = editor;
    const preChildren: any = selection && children[selection.anchor.path[0]];
    setShowSideToolbar(
      selection &&
        Range.isCollapsed(selection) &&
        preChildren.children[0].text.length === 0
    );

    if (typeof window.getSelection() !== "undefined") {
      const domSelection = window.getSelection();
      if (domSelection.rangeCount > 0) {
        const domRange = domSelection.getRangeAt(0);
        const child: any = selection && preChildren;

        const rect = domRange.getClientRects();
        if (child && rect.length > 0) {
          const lineHeight =
            child.type === "h1" ? rect[0].height - 12 : rect[0].height;
          setTop(rect[0].top);
          setBottom(rect[0].bottom);
          setLeft(rect[0].left);
          setLineHeight(lineHeight);
        }
      }

      // console.log(domSelection, domRange, rect);
    }
  });
  if (showSideToolbar) {
    return (
      <IconButton
        sx={{
          position: "absolute",
          top: `${(bottom + top) / 2 - lineHeight}px`,
          left: `${left - 60}px`,
        }}
      >
        <AddCircleOutlineOutlined />
      </IconButton>
    );
  }
  return <></>;
};
const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement | null>();
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor as ReactEditor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.removeAttribute("style");
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = "1";
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  });

  return (
    <Portal>
      <Menu
        ref={ref}
        className={css`
          padding: 8px 7px 6px;
          position: absolute;
          z-index: 1;
          top: -10000px;
          left: -10000px;
          margin-top: -6px;
          opacity: 0;
          background-color: #222;
          border-radius: 4px;
          transition: opacity 0.75s;
        `}
      >
        <FormatButton format="bold">
          <FormatBold />
        </FormatButton>
        <FormatButton format="italic">
          <FormatItalic />
        </FormatButton>
        <FormatButton format="underlined">
          <FormatUnderlined />
        </FormatButton>
      </Menu>
    </Portal>
  );
};

const FormatButton = ({ format, children }) => {
  const editor = useSlate();
  return (
    <Button
      reversed
      active={isFormatActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleFormat(editor, format);
      }}
    >
      {children}
    </Button>
  );
};

export default HoveringMenuExample;
