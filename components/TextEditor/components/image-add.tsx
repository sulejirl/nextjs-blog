import * as React from "react";
import { Typography, IconButton, Popover, TextField, Box } from "@mui/material";
import { PhotoCamera, Add } from "@mui/icons-material";

interface IProps {
  editorState: any;
  onChange: (editorState: any) => void;
  modifier: any;
}
export default function BasicPopover(props: IProps) {
  const [url, setUrl] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleAddImage = () => {
    const { editorState, onChange, modifier } = props;
    onChange(modifier(editorState, url));
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <IconButton aria-describedby={id} onClick={handleClick}>
        <PhotoCamera />
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
          <TextField
            variant="outlined"
            placeholder="Paster the image link"
            size="small"
            onChange={(e) => setUrl(e.target.value)}
            sx={{ mr: 1 }}
          />
          <IconButton onClick={handleAddImage}>
            <Add />
          </IconButton>
        </Box>
      </Popover>
    </div>
  );
}
