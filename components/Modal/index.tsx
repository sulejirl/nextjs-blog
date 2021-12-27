import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface IModal {
  buttonText: string;
  children?: React.ReactNode;
}

export default function BasicModal({ buttonText = "Open Modal", children }:IModal) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const Component:any = children || <></>;

  return (
    <>
      <Button onClick={handleOpen}>{buttonText}</Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Component/>
        </Box>
      </Modal>
    </>
  );
}
