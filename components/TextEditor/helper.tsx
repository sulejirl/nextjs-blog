import { Editor, Transforms, Text } from "slate";
export const EditorCommands = {
  isBoldMarkActive(editor) {
    const [match]: any = Editor.nodes(editor, {
      match: (n:any) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match]: any= Editor.nodes(editor, {
      match: (n:any) => n.type === "code",
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = EditorCommands.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true } as any,
      { match: (n) => Text.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor) {
    const isActive = EditorCommands.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" } as any,
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },
  toggleH3(editor) {
    const isActive = EditorCommands.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "h1" } as any,
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },
};
