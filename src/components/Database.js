import MenuIcon from "@mui/icons-material/Menu";
import { Box, Input } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";
import { columns } from "../data";
import Popup from "./Popup";

const Database = ({ places, handlePlaceClick }) => {
  const [searchValue, setSearchValue] = useState("");

  const searchPlaces = places?.filter((place) => {
    if (searchValue === "") {
      return place;
    } else if (place.name.toLowerCase().includes(searchValue.toLowerCase())) {
      return place;
    }
  });

  return (
    <Box>
      <Popup
        variant="text"
        sx={{
          width: "400px",
          heigth: "30px",
          background: "#fff",
          color: "black",
        }}
        icon={<MenuIcon />}
      >
        <Input
          placeholder="Search for place"
          sx={{ padding: "10px", width: "100%" }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Box style={{ height: 400, width: "500px" }}>
          <DataGrid
            rows={searchPlaces}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick={true}
            onRowClick={(e) => handlePlaceClick(e)}
          />
        </Box>
      </Popup>
    </Box>
  );
};

export default Database;
