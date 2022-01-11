import React, { useState, useRef } from "react";
import { Popover, TextField, Box, Button, Grid } from "@mui/material/";

export default function BasicPopover({
  anchorEl,
  onHandleAlignment,
  onSetSize,
  onClose,
  onDelete,
}: any) {
  const [imageHeight, setImageHeight] = useState(200);
  const [imageWidth, setImageWidth] = useState(200);
  const handleSetSize = () => {
    onSetSize(imageWidth, imageHeight);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  return (
    <div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Grid>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => onHandleAlignment("left")}
            >
              Left
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => onHandleAlignment("center")}
            >
              Center
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => onHandleAlignment("right")}
            >
              Right
            </Button>
          </Grid>
          <Grid container alignContent={"center"}>
            <TextField
              type={"number"}
              placeholder="Width"
              size="small"
              onChange={(e) => {
                setImageWidth(Number(e.target.value));
              }}
            />
            <TextField
              type={"number"}
              placeholder="Height"
              size="small"
              onChange={(e) => setImageHeight(Number(e.target.value))}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleSetSize}
            >
              Set Size
            </Button>
          </Grid>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={onDelete}
          >
            Delete Image
          </Button>
        </Box>
      </Popover>
    </div>
  );
}
