import React, { useState } from "react";
import { IconButton } from "@mui/material/";
import { ImageOutlined } from "@mui/icons-material";
import { widgetOptions } from "../../../../../util/cloudinary";

export default function BasicPopover({ sx, editor, insertImage }: any) {
  let widget = (window as any).cloudinary.createUploadWidget(
    widgetOptions,
    (err, result) => {
      if (!err) {
        if (result && result.event === "success") {
          insertImage(editor, result.info.secure_url);
        }
      }
    }
  );
  const [imagePath, setImagePath] = useState("");

  const handleAddImage = () => {
    widget.open();
  };
  return (
    <div>
      <IconButton sx={sx} onClick={handleAddImage}>
        <ImageOutlined />
      </IconButton>
    </div>
  );
}
