import { Box, Button, Input } from "@mui/material";
import React, { useCallback, useState } from "react";

const FormMap = ({ setPlaceName, saveNewPlace, setPopupOpen }) => {
  const [name, setName] = useState("");

  const handleNameChange = useCallback((e) => {
    const name = e.target.value;
    setName(name);
    setPlaceName(name);
  }, []);

  return (
    <Box sx={{ textAlign: "center" }}>
      <Input
        placeholder="Name"
        value={name}
        sx={{ marginBottom: "10px" }}
        onChange={handleNameChange}
      />
      <Button onClick={saveNewPlace}>Save</Button>
      <Button onClick={() => setPopupOpen(false)}>Close</Button>
    </Box>
  );
};

export default FormMap;
