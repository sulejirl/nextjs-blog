import React, { useState } from "react";
import {
  ReactEditor,
  useFocused,
  useSlateStatic,
  useSelected,
} from "slate-react";
import { css } from "@emotion/css";
import Img from "next/image";
import ImageSettings from "./components/imageSettings";
import { Transforms } from "slate";

export const Image = ({ attributes, children, element, readOnly }) => {
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);
  const [imageAnchor, setImageAnchor] = useState(null);
  const [width, setWidth] = useState(element.width || 200);
  const [height, setHeight] = useState(element.height || 200);
  const [alignment, setAlignment] = useState(element.alignment || "left");

  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
          text-align: ${alignment};
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
            padding: ${imageAnchor && !readOnly ? "0px" : "3px !important"};
            box-shadow: ${imageAnchor && !readOnly
              ? "0 0 0 3px #B4D5FF"
              : "none"};
            border: ${imageAnchor && !readOnly
              ? "#B4D5FF solid 3px !important"
              : "none"};
          `}
        />
        {!readOnly && (
          <ImageSettings
            anchorEl={imageAnchor}
            onSetSize={(width, height) => {
              setWidth(width);
              setHeight(height);
              setImageAnchor(null);
              Transforms.setNodes(editor, { width, height } as any, {
                at: path,
              });
            }}
            onHandleAlignment={(alignment) => {
              Transforms.setNodes(editor, { alignment } as any, { at: path });
              setAlignment(alignment);
            }}
            onClose={() => {
              setImageAnchor(null);
            }}
            onDelete={() => {
              setImageAnchor(null);
              Transforms.removeNodes(editor, { at: path, voids: true });
            }}
          />
        )}
      </div>
    </div>
  );
};
