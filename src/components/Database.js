import MenuIcon from "@mui/icons-material/Menu";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { columns } from "../data";
import Popup from "./Popup";

const Database = ({ places, handlePlaceClick }) => {
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
        <Box style={{ height: 400, width: "500px" }}>
          <DataGrid
            rows={places}
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
