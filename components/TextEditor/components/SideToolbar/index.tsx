import React, { useEffect, useRef, useState } from "react";
import { ReactEditor, useSlate, useFocused } from "slate-react";
import { Range } from "slate";
import { IconButton } from "@mui/material";
import { AddCircleOutlineOutlined, CancelOutlined } from "@mui/icons-material";
import ImageAdd from "./components/imageAdd";
import DividerAdd from "./components/dividerAdd";

import { EditorCommands } from "../../helper";

import useWindowSize from "../../../../hooks/useWindowSize";

export const SideToolbar = ({ onClickToolbar }: any) => {
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
        preChildren.type === 'paragraph' &&
        preChildren.children[0] &&
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
              insertImage={EditorCommands.insertImage}
            />
            <DividerAdd
              editor={editor}
              sx={{
                position: "absolute",
                top: `${(bottom + top) / 2 - lineHeight}px`,
                left: `${left + 40}px`,
                zIndex: 999,
              }}
              insertDivider={EditorCommands.insertDivider}
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
