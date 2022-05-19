import { styled } from "@material-ui/core";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import { Autocomplete, Box, Button, Input, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { firestoreDB } from "../firebase";
import { fetchPlaces, fetchText } from "../services";
import Popup from "./Popup";

const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiAutocomplete-inputRoot": {
    padding: 6,
  },
});

const Database = ({ places, handlePlaceClick, editPlace }) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [placesArray, setPlacesArray] = useState([]);
  const [columns, setColumns] = useState([]);
  const [userId, setUserId] = useState(null);
  const placeAddress = useRef(null);
  const addressId = useRef(null);
  const lngCoord = useRef(null);
  const latCoord = useRef(null);

  useEffect(() => {
    const userIdLocal = localStorage.getItem("ID");
    setUserId(userIdLocal);
  });

  useEffect(() => {
    setColumns([
      { field: "name", headerName: "Name", width: 130, editable: true },
      {
        field: "address",
        headerName: "Address",
        width: 200,
        renderCell: (params) => renderAutocomplete(placesArray, params),
      },
      {
        field: "coordinates",
        headerName: "Coodrinates",
        width: 150,
        editable: true,
      },
    ]);
  }, [placesArray]);

  const renderAutocomplete = (arr, params) => {
    return (
      <StyledAutocomplete
        id="autocompleteInput"
        options={arr}
        sx={{
          width: 200,
          height: 50,
          position: "absolute",
          right: "170px",
        }}
        onChange={onSelectPlace}
        value={params.value}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField {...params} onKeyDown={handleChangePlace} />
        )}
      />
    );
  };

  const searchPlaces = places?.filter((place) => {
    if (place.uid === userId) {
      if (searchValue === "") {
        return place;
      } else if (
        place.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        place.address.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return place;
      }
    }
  });

  const deleteRow = async () => {
    await selectionModel.map((elem) => {
      deleteDoc(doc(firestoreDB, "places", elem));
    });
  };

  const editData = async (params, event) => {
    try {
      if (params.field === "coordinates") {
        lngCoord.current = event.target.value?.split(",")[0];
        latCoord.current = event.target.value?.split(",")[1];

        fetchText(lngCoord.current, latCoord.current)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            placeAddress.current = data.features[0]?.place_name;
          })
          .then(() => {
            updateDoc(doc(firestoreDB, "places", params.id), {
              coordinates: event.target.value,
              lng: lngCoord.current,
              lat: latCoord.current,
              address: placeAddress.current,
            });
          });
      } else {
        await updateDoc(doc(firestoreDB, "places", params.id), {
          [params.field]: event.target.value,
        });
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const onSelectPlace = (_, values) => {
    fetchPlaces(values)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        lngCoord.current = data?.features?.[0].center[0];
        latCoord.current = data?.features?.[0].center[1];
      })
      .then(() => {
        updateDoc(doc(firestoreDB, "places", addressId.current), {
          coordinates: [lngCoord.current, latCoord.current],
          lng: lngCoord.current,
          lat: latCoord.current,
          address: values,
        });
      });
      editPlace()
    setPlacesArray([]);
  };

  const handleChangePlace = (e) => {
    e.stopPropagation();
    let arr = [];
    fetchPlaces(e.target.value)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data?.features?.forEach((item) =>
          !arr.includes(item.place_name) ? arr.push(item.place_name) : ""
        );
        setPlacesArray(arr);
      });
  };

  return (
    <Box
      sx={{
        ":hover": {
          background: "#b8baba",
          borderRadius: "4px",
        },
      }}
    >
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
        <Box style={{ height: 400, width: "550px" }}>
          <DataGrid
            rows={searchPlaces}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick={true}
            hideFooterSelectedRowCount={true}
            onRowClick={(e) => handlePlaceClick(e)}
            onCellClick={(e) => (addressId.current = e.id)}
            onSelectionModelChange={(newSelectionModel) => {
              setSelectionModel(newSelectionModel);
            }}
            selectionModel={selectionModel}
            experimentalFeatures={{ newEditingApi: true }}
            onCellEditStop={(params, event) => editData(params, event)}
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
