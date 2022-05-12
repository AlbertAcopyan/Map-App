import { Box, Button, Input } from "@mui/material";
import React, { useEffect, useState } from "react";

const FormMap = ({ setPlaceName, saveNewPlace }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    setPlaceName(name);
  }, [name]);

  return (
    <Box>
      <Input
        placeholder="Name"
        value={name}
        sx={{ marginBottom: "10px" }}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={saveNewPlace}>Save</Button>
      <Button>Cancel</Button>
    </Box>
  );
};

export default FormMap;
