import { Box, Button, Input } from "@mui/material";
import React, { useEffect, useState } from "react";

const FormMap = ({ setPlaceName, saveNewPlace, setPopupOpen }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    setPlaceName(name);
  }, [name]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Input
        placeholder="Name"
        value={name}
        sx={{ marginBottom: "10px" }}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={saveNewPlace}>Save</Button>
      <Button onClick={() => setPopupOpen(false)}>Close</Button>
    </Box>
  );
};

export default FormMap;
