import React, { useState } from "react";
import {
  IconButton,
  Popover,
  Typography,
  TextField,
  Box,
  Button,
  Grid,
} from "@mui/material/";
import { ImageOutlined } from "@mui/icons-material";

export default function BasicPopover({ sx, editor, insertImage }: any) {
  const [imagePath, setImagePath] = useState("");
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const handleAddImage = () => {
    insertImage(editor, imagePath);
    handleClose();
  };
  return (
    <div>
      <IconButton sx={sx} aria-describedby={id} onClick={handleClick}>
        <ImageOutlined />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Grid container alignContent={"center"}>
            <TextField
              placeholder="Add Image Url"
              size="small"
              onChange={(e) => setImagePath(e.target.value)}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleAddImage}
            >
              Add
            </Button>
          </Grid>
        </Box>
      </Popover>
    </div>
  );
}
