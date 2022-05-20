import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, Input } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { firestoreDB } from "../firebase";
import { fetchPlaces, fetchText } from "../services";
import AutocompleteInput from "./AutocompleteInput";
import Popup from "./Popup";

export const PlacesContext = React.createContext();

const Database = ({ places, handlePlaceClick, logged }) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [placesArray, setPlacesArray] = useState([]);
  const [columns, setColumns] = useState([]);
  const [userId, setUserId] = useState(null);
  const selectedPlaceAddress = useRef(null);
  const selectedAddressId = useRef(null);
  const lngCoord = useRef(null);
  const latCoord = useRef(null);

  useEffect(() => {
    const userIdLocal = localStorage.getItem("ID");
    setUserId(userIdLocal);
  }, [logged]);

  useEffect(() => {
    setColumns([
      { field: "name", headerName: "Name", width: 130, editable: true },
      {
        field: "address",
        headerName: "Address",
        width: 200,
        renderCell: (params) => (
          <PlacesContext.Provider value={placesArray}>
            <AutocompleteInput
              params={params}
              onSelectPlace={onSelectPlace}
              handleChangePlace={handleChangePlace}
            />
          </PlacesContext.Provider>
        ),
      },
      {
        field: "coordinates",
        headerName: "Coodrinates",
        width: 150,
        editable: true,
      },
    ]);
  }, [placesArray]);

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
    selectionModel.map(async (elem) => {
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
            selectedPlaceAddress.current = data.features[0]?.place_name;
          })
          .then(() => {
            updateDoc(doc(firestoreDB, "places", params.id), {
              coordinates: event.target.value,
              lng: lngCoord.current,
              lat: latCoord.current,
              address: selectedPlaceAddress.current,
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

  const handleChangePlace = (e) => {
    e.stopPropagation();
    let arr = new Set([]);
    fetchPlaces(e.target.value)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data?.features?.forEach((item) => arr.add(item.place_name));
        setPlacesArray([...arr]);
      });
  };

  const onSelectPlace = (_, values) => {
    fetchPlaces(values)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // try use context
        lngCoord.current = data?.features?.[0].center[0];
        latCoord.current = data?.features?.[0].center[1];
      })
      .then(() => {
        updateDoc(doc(firestoreDB, "places", selectedAddressId.current), {
          coordinates: [lngCoord.current, latCoord.current],
          lng: lngCoord.current,
          lat: latCoord.current,
          address: values,
        });
      });
    setPlacesArray([]);
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
            onRowClick={handlePlaceClick}
            onCellClick={(e) => (selectedAddressId.current = e.id)}
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
