import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Box } from "@mui/material";
import Stack from "@mui/material/Stack";
import { collection, onSnapshot } from "firebase/firestore";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef, useState } from "react";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Authorization from "../components/Authorization";
import Database from "../components/Database";
import { firestoreDB } from "../firebase";
import "./Map.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(42.65);
  const [lat, setLat] = useState(43.9);
  const [zoom, setZoom] = useState(9);
  const [places, setPlaces] = useState(null);
  const [coordinatesPicked, setCoordinatesPicked] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const inputValue = useRef(null);

  useEffect(
    () =>
      onSnapshot(collection(firestoreDB, "places"), (snapshot) =>
        setPlaces(snapshot.docs.map((doc) => doc.data()))
      ),
    []
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
  });

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

  const handlePlaceName = (e) => {
    setPlaceName(e.target.value);
  };

  useEffect(() => {
    console.log(placeName);
  }, [placeName]);

  const handleClickName = () => {
    console.log("jhyubuynu");
  };

  const marker = new mapboxgl.Marker();

  const addMarker = (event) => {
    const coordinates = event.lngLat;

    console.log("Lng:", coordinates.lng, "Lat:", coordinates.lat);
    marker.setLngLat(coordinates).addTo(map.current);
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `<input class="inputPlace" />
        <button class="onBtn">ok</button>
        <button>no</button>
      `
      )
      .addTo(map.current);
  };

  useEffect(() => {
    if (!map.current) return;
    map.current.on("click", (e) => addMarker(e));
  }, []);

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
        <Authorization />
      </Stack>
    </Box>
  );
};
export default Map;
