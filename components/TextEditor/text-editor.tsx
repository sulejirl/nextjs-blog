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
  useOnClickOutside(ref, () => setCursorActive(false));

  useEffect(() => {
    console.log(readOnly);
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
            style={{ userSelect: "none", margin: "20px" }}
          >
            <hr style={{ userSelect: "none", margin: "20px" }} />
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

  const handleOnSavePost = (draft) => {
    const post = {
      title: "",
      body: EditorCommands.htmlSerialize({ children: value }),
      draft: draft ? true : false,
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
          <SideToolbar onClickToolbar={() => setCursorActive(false)} />
        )}
        <Editable
          readOnly={readOnly}
          style={{ minHeight: "100vh" }}
          renderLeaf={(props) => <Leaf {...props} />}
          renderElement={renderElement}
          placeholder="Enter some text..."
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
            console.log(children);
            if (event.key === "Enter") {
              if (type === "list-item" && value.text === "") {
                event.preventDefault();
                Transforms.delete(editor, { at: [absPath[0],absPath[1]] });
                Transforms.insertNodes(
                  editor,
                  {
                    type: "paragraph",
                    children: [{ text: "" }],
                  },
                  { at: [absPath[0]+1] }
                );
                Transforms.select(editor, {
                  path: [absPath[0]+1],
                  offset: 0,
                });
              }
            }
            if (event.key === "Backspace") {
              console.log(value, type, absPath, parentNodeType);
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
