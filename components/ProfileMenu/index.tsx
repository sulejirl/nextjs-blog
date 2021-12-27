import * as React from "react";
import { Menu, MenuItem, Button, Avatar, IconButton } from "@mui/material";
import { useAuth } from "../../contexts/firebaseContext";

interface IProfileMenu {
  displayName: string;
  photoURL: string;
}

export default function BasicMenu({ displayName, photoURL }: IProfileMenu) {
  const {signOut} = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <IconButton onClick={handleClick}>
        <Avatar alt={displayName} src={photoURL}>
          {!photoURL && displayName[0]}
        </Avatar>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={()=>{}}>New Report</MenuItem>
        <MenuItem onClick={()=>{}}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={signOut}>Logout</MenuItem>
      </Menu>
    </div>
  );
}
