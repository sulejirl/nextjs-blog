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
  useSlateStatic,
  useSelected,
} from "slate-react";
import Img from "next/image";
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
  CancelOutlined,
  ImageOutlined,
  Delete,
} from "@mui/icons-material";
import imageExtensions from "image-extensions";
import isUrl from "is-url";
import { IconButton, Popover } from "@mui/material";

import {
  Button,
  Icon,
  Menu,
  Portal,
  CodeElement,
  DefaultElement,
  Button as ImgButton,
} from "./components";
import { EditorCommands } from "./helper";
import useWindowSize from "../../hooks/useWindowSize";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import ImageAdd from "./components/imageAdd";
import ImageSettings from "./components/imageSettings";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
type EmptyText = {
  text: string;
};

type ImageElement = {
  type: "image";
  url: string;
  children: EmptyText[];
};
const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);
  const [imageAnchor, setImageAnchor] = useState(null);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);

  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
        `}
      >
        <Img
          src={element.url}
          width={width || 200}
          height={height || 200}
          onClick={(e) => {
            setImageAnchor(e.currentTarget);
          }}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? "0 0 0 3px #B4D5FF" : "none"};
          `}
        />
        <ImageSettings
          anchorEl={imageAnchor}
          onSetSize={(width, height) => {
            setWidth(width);
            setHeight(height);
            setImageAnchor(null);
          }}
          onClose={() => {
            setImageAnchor(null);
          }}
          onDelete={() => {
            setImageAnchor(null);
            Transforms.removeNodes(editor, { at: path, voids: true });
          }}
        />
      </div>
    </div>
  );
};

const insertImage = (editor, url) => {
  const text = { text: "" };
  const image: ImageElement = { type: "image", url, children: [text] };
  Transforms.insertNodes(editor, image as any);
};
const isImageUrl = (url) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split(".").pop();
  return imageExtensions.includes(ext);
};
const withImages = (editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split("/");

        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result;
            insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
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
  const ref = useRef();
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
  const editor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );
  const [cursorActive, setCursorActive] = useState(false);
  useOnClickOutside(ref, () => setCursorActive(false));

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "image":
        return <Image {...props} />;
      case "code":
        return <CodeElement {...props} />;
      case "h1":
        return <h1 {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);
  return (
    <div ref={ref}>
      <Slate
        editor={editor}
        value={value || []}
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
        <SideToolbar onClickToolbar={() => setCursorActive(false)} />
        <Editable
        style={{minHeight: "100vh"}}

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
          onClick={(event) => {
            setCursorActive(true);
          }}
        />
      </Slate>
    </div>
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

const SideToolbar = ({ onClickToolbar }: any) => {
  const ref = useRef<HTMLDivElement | null>();
  const editor = useSlate();
  const focused = useFocused();
  const [showSideToolbar, setShowSideToolbar] = useState(false);
  const [lineHeight, setLineHeight] = useState(0);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [sideToolbar, setSideToolbar] = useState(false);
  const windowSize = useWindowSize();

  const toggleSideToolbar = () => {
    onClickToolbar();
    setSideToolbar(!sideToolbar);
  };
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
    }
    if (sideToolbar && ReactEditor.isFocused(editor as ReactEditor)) {
      setSideToolbar(false);
    }
  });
  if (showSideToolbar) {
    return (
      <>
        {sideToolbar ? (
          <>
            <IconButton
              sx={{
                position: "absolute",
                top: `${(bottom + top) / 2 - lineHeight}px`,
                left: `${left - 60}px`,
              }}
            >
              <CancelOutlined
                onClick={() => {
                  toggleSideToolbar();
                }}
              />
            </IconButton>
            <ImageAdd
              editor={editor}
              sx={{
                position: "absolute",
                top: `${(bottom + top) / 2 - lineHeight}px`,
                left: `${left - 10}px`,
                zIndex: 999,
              }}
              insertImage={insertImage}
            />
          </>
        ) : (
          <IconButton
            sx={{
              position: "absolute",
              top: `${(bottom + top) / 2 - lineHeight}px`,
              left: `${left - 60}px`,
            }}
          >
            <AddCircleOutlineOutlined
              onClick={() => {
                toggleSideToolbar();
              }}
            />
          </IconButton>
        )}
      </>
    );
  }
  return <></>;
};
const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement | null>();
  const editor = useSlate();
  const focused = useFocused();

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
