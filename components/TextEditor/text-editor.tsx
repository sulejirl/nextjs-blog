import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Slate,
  Editable,
  ReactEditor,
  withReact,
  useFocused,
} from "slate-react";
import { createEditor, BaseEditor, Descendant, Node, Transforms } from "slate";
import { withHistory } from "slate-history";
import { EditorCommands } from "./helper";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import {
  HoveringToolbar,
  SideToolbar,
  Leaf,
  Image,
  PublishMenu,
} from "./components";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  h3?: boolean;
  "list-item"?: boolean;
  "numbered-list"?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

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
            EditorCommands.insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (EditorCommands.isImageUrl(text)) {
      EditorCommands.insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const TextEditor = ({ onSave, data, readOnly }) => {
  const ref = useRef();
  const focused = useFocused();
  const initialValue: CustomElement[] = [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ];

  const [value, setValue] = useState<Descendant[]>(initialValue);
  const editor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );
  const [cursorActive, setCursorActive] = useState(false);
  const [toolbarToogle, setToolbarToogle] = useState(false);

  useOnClickOutside(ref, () => setCursorActive(false));

  useEffect(() => {
    if (data) {
      const document = new DOMParser().parseFromString(data, "text/html");
      if (document.body) {
        const editorValue = EditorCommands.htmlDeserialize(document.body);
        if (editorValue) {
          editor.children = editorValue;
          setValue(editorValue);
        }
      }
    }
  }, [data]);

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "image":
        return <Image {...props} readOnly={readOnly} />;
      case "h1":
        return <h1 {...props} />;
      case "h3":
        return <h3 {...props} />;
      case "block-quote":
        return <blockquote {...props.attributes}>{props.children}</blockquote>;
      case "divider":
        return (
          <div
            {...props}
            contentEditable={false}
            style={{ userSelect: "none", padding: "10px" }}
          >
            <hr style={{ userSelect: "none", margin: "10px" }} />
          </div>
        );
      case "list-item":
        return <li {...props.attributes}>{props.children}</li>;
      case "numbered-list":
        return <ol {...props.attributes}>{props.children}</ol>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const handleOnSavePost = (title, draft) => {
    const image:any = value.find((item) => item.type === "image");
    const imageUrl = image.url || "";
    const post = {
      title: title || "",
      body: EditorCommands.htmlSerialize({ children: value }),
      draft: draft ? true : false,
      thumbnail: imageUrl,
    };
    onSave(post);
  };

  return (
    <div ref={ref}>
      {!readOnly && <PublishMenu onSave={handleOnSavePost} />}
      <Slate
        editor={editor}
        value={value || []}
        onChange={(value) => {
          setValue(value);
        }}
      >
        {!readOnly && <HoveringToolbar />}
        {!readOnly && (
          <SideToolbar onClickToolbar={() => setCursorActive(false)} onToolbarToogle={(open)=>setToolbarToogle(open)} />
        )}
        <Editable
          readOnly={readOnly}
          style={{ minHeight: "100vh" }}
          renderLeaf={(props) => <Leaf {...props} />}
          renderElement={renderElement}
          placeholder={!toolbarToogle && "Enter some text..."}
          onKeyDown={(event) => {
            const { children, selection } = editor;
            const absPath = selection.anchor.path;
            const parentNodeType = children[absPath[0]].type;
            let value = null;
            let type = null;
            for (let i of absPath) {
              value = value ? value.children[i] : children[i];
              type = value.type ? value.type : type;
            }
            if (event.key === " ") {
              if (value.text === "-") {
                event.preventDefault();
                Transforms.delete(editor, { at: [absPath[0]] });
                Transforms.insertNodes(editor, {
                  type: "bulleted-list",
                  children: [{ type: "list-item", children: [{ text: "" }] }],
                } as any);
              }
              if (value.text === "1.") {
                event.preventDefault();
                Transforms.delete(editor, { at: [absPath[0]] });
                Transforms.insertNodes(editor, {
                  type: "numbered-list",
                  children: [{ type: "list-item", children: [{ text: "" }] }],
                } as any);
              }
            }
            if (event.key === "Enter") {
              if (type === "list-item" && value.text === "") {
                const insertLocation =
                  absPath[0] === 0 && absPath[1] === 0
                    ? absPath[0]
                    : absPath[0] + 1;
                event.preventDefault();
                if (absPath[1] === 0) {
                  Transforms.delete(editor, { at: [absPath[0]] });
                } else {
                  Transforms.delete(editor, { at: [absPath[0], absPath[1]] });
                }
                Transforms.insertNodes(
                  editor,
                  {
                    type: "paragraph",
                    children: [{ text: "" }],
                  },
                  { at: [insertLocation] }
                );
                Transforms.select(editor, {
                  path: [insertLocation],
                  offset: 0,
                });
              }
            }
            if (event.key === "Backspace") {
              const { children } = editor;
              if (
                value.text === "" &&
                (parentNodeType === "numbered-list" ||
                  parentNodeType === "bulleted-list") &&
                absPath[1] === 0
              ) {
                event.preventDefault();
                Transforms.delete(editor, { at: [absPath[0]] });
                Transforms.insertNodes(
                  editor,
                  {
                    type: "paragraph",
                    children: [{ text: "" }],
                  },
                  { at: [absPath[0]] }
                );
                Transforms.select(editor, {
                  path: [absPath[0]],
                  offset: 0,
                });
              }
            }
            if (!event.ctrlKey) {
              return;
            }

            // Replace the `onKeyDown` logic with our new commands.
            switch (event.key) {
              case "b": {
                event.preventDefault();
                EditorCommands.toggleBoldMark(editor);
                break;
              }
            }
          }}
          onDOMBeforeInput={(event: InputEvent) => {
            // switch (event.inputType) {
            //   case "formatBold":
            //     return EditorCommands.toggleFormat(editor, "bold");
            //   case "formatItalic":
            //     return EditorCommands.toggleFormat(editor, "italic");
            //   case "formatUnderline":
            //     return EditorCommands.toggleFormat(editor, "underlined");
            //   case "formatH1":
            //     return EditorCommands.toggleBlockFormat(editor, "h1");
            //   case "formatH3":
            //     return EditorCommands.toggleBlockFormat(editor, "h3");
            // }
          }}
          onClick={(event) => {
            setCursorActive(true);
          }}
        />
      </Slate>
    </div>
  );
};

export default TextEditor;
