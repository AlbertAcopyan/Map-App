import { Box, Button, Input } from "@mui/material";
import React, { useEffect, useState } from "react";

const FormMarker = ({ place, deletePlace }) => {
  return (
    <Box>
      <Box>${place}</Box>
      <Button onClick={deletePlace}>Deleteplace</Button>
    </Box>
  );
};

export default FormMarker;
