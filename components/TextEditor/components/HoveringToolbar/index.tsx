import React, { useEffect, useRef } from "react";
import { Button, Menu } from "./components";
import { Editor, Range } from "slate";
import { ReactEditor, useSlate, useFocused } from "slate-react";
import { EditorCommands } from "../../helper";
import { css } from "@emotion/css";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from "@mui/icons-material";

const FormatButton = ({ format, children }) => {
  const editor = useSlate();
  return (
    <Button
      reversed
      active={EditorCommands.isFormatActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        EditorCommands.toggleFormat(editor, format);
      }}
    >
      {children}
    </Button>
  );
};
export const HoveringToolbar = () => {
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
