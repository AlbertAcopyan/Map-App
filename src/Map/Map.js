import ReactDOM from "react-dom";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import "./Map.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Box } from "@mui/material";
import Stack from "@mui/material/Stack";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Authorization from "../components/Authorization";
import Database from "../components/Database";
import { firestoreDB } from "../firebase";
import FormMap from "../components/FormMap";
import { fetchText } from "../services/index";
import "./Map.css";
import FormMarker from "../components/FormMarker";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(42.65);
  const [lat, setLat] = useState(43.9);
  const [zoom, setZoom] = useState(9);
  const [places, setPlaces] = useState(null);
  const [placeAddress, setPlaceAddress] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const [placeCoordinates, setPlaceCoordinates] = useState(null);
  const [userId, setUserId] = useState(null);
  const [logged, setLogged] = useState(false);
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  useEffect(() =>
    onSnapshot(collection(firestoreDB, "places"), (snapshot) =>
      setPlaces(snapshot.docs.map((doc) => doc.data()))
    )
  );

  useEffect(() => {
    const userIdLocal = localStorage.getItem("ID");
    setUserId(userIdLocal);
    console.log(userIdLocal, "map");
  }, [logged]);

  const userLogged = () => {
    setLogged(true);
  };

  const saveNewPlace = useCallback(async () => {
    console.log(
      "coord:",
      placeCoordinates,
      "address:",
      placeAddress,
      "name:",
      placeName
    );
    if (placeCoordinates && placeAddress && placeName && userId) {
      const id = Math.random() * 10;
      await setDoc(doc(firestoreDB, "places", `${id}`), {
        address: placeAddress,
        coordinates: `${placeCoordinates[0]}, ${placeCoordinates[1]}`,
        id: `${id}`,
        lat: placeCoordinates[1],
        lng: placeCoordinates[0],
        name: placeName,
        uid: userId,
      });
    } else if (!userId) {
      alert("You have to log in first!");
    } else {
      console.log("Error", userId);
    }
  }, [placeCoordinates, placeAddress, placeName]);

  const deletePlace = () => {
    console.log(123123);
  };

  const handleMapClick = useCallback(
    (e) => {
      const coordinates = e.lngLat;

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
  }, [handleMapClick]);

  useEffect(() => {
    places?.forEach((place) => {
      if (userId && userId === place.uid) {
        const marker = new mapboxgl.Marker({ draggable: true })
          .setLngLat([place.lng, place.lat])
          .addTo(map.current);

        const onDragEnd = async () => {
          const lngLat = marker.getLngLat();
          const newAddress = fetchText(lngLat.lng, lngLat.lat)
            .then((response) => {
              return response.json();
            })
            .then((data) => {
              return data.features[0]?.place_name;
            });
          try {
            await updateDoc(doc(firestoreDB, "places", place.id), {
              coordinates: `${lngLat.lng}, ${lngLat.lat}`,
              lat: lngLat.lat,
              lng: lngLat.lng,
              address: await newAddress,
            });
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        };

        marker.on("dragend", onDragEnd);
      }
    });
  }, [places, userId]);

  useEffect(() => {
    if (!map.current) return;
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  const handlePlaceClick = (e) => {
    if (!map.current) return;
    map.current.flyTo({
      center: [e.row.lng, e.row.lat],
      essential: true,
    });
  };

  return (
    <Box>
      <Box ref={mapContainer} sx={{ height: "100vh" }} />
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
        <Database places={places} handlePlaceClick={handlePlaceClick} />
        <Authorization userLogged={userLogged} />
      </Stack>
    </Box>
  );
};
export default Map;
