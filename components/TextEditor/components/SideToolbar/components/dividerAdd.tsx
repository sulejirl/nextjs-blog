import React from "react";
import { IconButton } from "@mui/material/";
import { HorizontalRule } from "@mui/icons-material";

export default function BasicPopover({ sx, editor, insertDivider }: any) {
  const handleAddDivider = () => {
    insertDivider(editor);
  };
  return (
    <div>
      <IconButton sx={sx} onClick={handleAddDivider}>
        <HorizontalRule />
      </IconButton>
    </div>
  );
}
