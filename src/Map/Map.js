import ReactDOM from "react-dom";
import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import "./Map.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Stack from "@mui/material/Stack";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import Popup from "../components/Popup";
import { Box, Button, CardActions, CardContent, Input } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { auth, firestoreDB } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import FormMap from "../components/FormMap";
import { fetchText } from "../services";

import { doc, setDoc } from "firebase/firestore";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const columns = [
  { field: "name", headerName: "Name", width: 130 },
  { field: "address", headerName: "Address", width: 150 },
  {
    field: "coordinates",
    headerName: "Coodrinates",
    width: 150,
  },
];

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(42.65);
  const [lat, setLat] = useState(43.9);
  const [zoom, setZoom] = useState(9);
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(false);
  const [places, setPlaces] = useState(null);
  const [placeAddress, setPlaceAddress] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const [placeCoordinates, setPlaceCoordinates] = useState(null);
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  useEffect(
    () =>
      onSnapshot(collection(firestoreDB, "places"), (snapshot) =>
        setPlaces(snapshot.docs.map((doc) => doc.data()))
      ),
    []
  );
  const saveNewPlace = useCallback(async () => {
    console.log(
      "coord:",
      placeCoordinates,
      "address:",
      placeAddress,
      "name:",
      placeName
    );
    if (placeCoordinates && placeAddress && placeName) {
      await setDoc(doc(firestoreDB, "places", `${Math.random() * 10}`), {
        address: placeAddress,
        coordinates: `${placeCoordinates[0]}, ${placeCoordinates[1]}`,
        id: `${Math.random() * 10}`,
        lat: placeCoordinates[1],
        lng: placeCoordinates[0],
        name: placeName,
      });
    } else {
      console.log(123321);
    }
  }, [placeCoordinates, placeAddress, placeName]);

  const handleMapClick = useCallback(
    (e) => {
      const coordinates = e.lngLat;

      console.log("Lng:", coordinates.lng, "Lat:", coordinates.lat);
      setPlaceCoordinates([coordinates.lng, coordinates.lat]);
      const popupNode = document.createElement("div");

      ReactDOM.render(
        <FormMap saveNewPlace={saveNewPlace} setPlaceName={setPlaceName} />,
        popupNode
      );

      popUpRef.current
        .setLngLat(e.lngLat)
        .setDOMContent(popupNode)
        .addTo(map.current);

      fetchText(coordinates.lng, coordinates.lat)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setPlaceAddress(data.features[0]?.place_name);
        });
    },
    [saveNewPlace]
  );

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    });
    map.current.addControl(geocoder);
  }, []);

  useEffect(() => {
    map.current.off("click");
    map.current.on("click", handleMapClick);
  }, [handleMapClick])

  useEffect(() => {
    places?.forEach((place) => {
      new mapboxgl.Marker()
        .setLngLat([place.lng, place.lat])
        .addTo(map.current);
    });
  }, [places]);

  useEffect(() => {
    if (!map.current) return;
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  useEffect(() => {
    console.log(placeCoordinates);
    console.log(placeName);
    console.log(placeAddress);
  }, [placeCoordinates, placeAddress, placeName]);

  const handleClickName = () => {
    console.log("jhyubuynu");
  };

  const handleLoginTab = () => {
    setTab("login");
  };

  const handleRegisterTab = () => {
    setTab("register");
  };

  const handleRegister = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, login, password);
      setUser(user);
      setErrorMessage(false);
    } catch (error) {
      setErrorMessage(true);
    }
    setLogin("");
    setPassword("");
  };

  const handleLogin = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, login, password);
      setUser(user);
      setErrorMessage(false);
    } catch (error) {
      setErrorMessage(true);
    }
    setLogin("");
    setPassword("");
  };

  const handleLogout = async () => {
    await signOut(auth);

    setUser(null);
  };

  const handlePlaceClick = (e) => {
    if (!map.current) return;
    map.current.flyTo({
      center: [e.row.lng, e.row.lat],
      essential: true,
    });
  };

  return (
    <div className="App">
      <div ref={mapContainer} className="map-container" />
      <Stack
        spacing={2}
        direction="row"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          margin: "10px",
          marginRight: "30px",
        }}
      >
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
        {/* sdfgdfgdgdf */}
        <Popup
          variant="text"
          sx={{
            width: "40px",
            heigth: "30px",
            background: "#fff",
            color: "black",
          }}
          icon={<PersonIcon />}
        >
          {user ? (
            <>
              <Box>logged in</Box>
              <Button size="medium" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  minWidth: "350px",
                }}
              >
                <Button sx={{ width: "100%" }} onClick={handleLoginTab}>
                  Login
                </Button>
                <Button sx={{ width: "100%" }} onClick={handleRegisterTab}>
                  Register
                </Button>
              </Box>
              <Box
                component="form"
                sx={{
                  padding: "20px",
                }}
                autoComplete="off"
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Input
                    placeholder="Login"
                    sx={{
                      height: "40px",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                    onChange={(e) => setLogin(e.target.value)}
                    value={login}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    sx={{
                      height: "50px",
                      padding: "10px",
                    }}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                </CardContent>
                <CardActions
                  sx={{
                    justifyContent: "center",
                  }}
                >
                  {tab === "login" ? (
                    <Button size="medium" onClick={handleLogin}>
                      Login
                    </Button>
                  ) : (
                    <Button size="medium" onClick={handleRegister}>
                      Register
                    </Button>
                  )}
                </CardActions>

                {errorMessage ? (
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    Something went wrong!
                  </Box>
                ) : (
                  ""
                )}
              </Box>
            </>
          )}
        </Popup>
      </Stack>
    </div>
  );
};
export default Map;
