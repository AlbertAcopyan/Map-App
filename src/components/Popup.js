import React, { useState } from "react";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";

const Popup = ({ icon, children }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <Button
        aria-describedby={id}
        variant="text"
        sx={{
          width: "40px",
          heigth: "30px",
          background: "#fff",
          color: "black",
        }}
        onClick={handleClick}
      >
        {icon}
      </Button>
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
        {children}
      </Popover>
    </div>
  );
};

export default Popup;
