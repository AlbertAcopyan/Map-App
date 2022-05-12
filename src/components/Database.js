import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, Input } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { columns } from "../data";
import { firestoreDB } from "../firebase";
import Popup from "./Popup";

const Database = ({ places, handlePlaceClick }) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userIdLocal = localStorage.getItem("ID");
    setUserId(userIdLocal);
    console.log(userIdLocal);
  });

  const searchPlaces = places?.filter((place) => {
    if (place.uid === userId) {
      if (searchValue === "") {
        return place;
      } else if (place.name.toLowerCase().includes(searchValue.toLowerCase())) {
        console.log(1231);
        return place;
      } else {
        console.log("no data");
      }
    } else {
      console.log("no id");
    }
  });

  useEffect(() => {
    console.log(selectionModel);
  }, [selectionModel]);

  const deleteRow = async () => {
    await selectionModel.map((elem) => {
      deleteDoc(doc(firestoreDB, "places", elem));
    });
  };
  return (
    <Box>
      <Popup
        variant="text"
        sx={{
          width: "400px",
          heigth: "30px",
          background: "#fff",
          color: "black",
          position: "relative",
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
            hideFooterSelectedRowCount={true}
            onRowClick={(e) => handlePlaceClick(e)}
            onSelectionModelChange={(newSelectionModel) => {
              setSelectionModel(newSelectionModel);
            }}
            selectionModel={selectionModel}
          />
        </Box>
        <Button
          onClick={deleteRow}
          sx={{ position: "absolute", bottom: "10px" }}
        >
          <DeleteIcon />
        </Button>
      </Popup>
    </Box>
  );
};

export default Database;
