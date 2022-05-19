import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Autocomplete, Box, TextField } from "@mui/material";
import Stack from "@mui/material/Stack";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Authorization from "../components/Authorization";
import Database from "../components/Database";
import FormMap from "../components/FormMap";
import { firestoreDB } from "../firebase";
import { fetchText } from "../services/index";
import "./Map.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(42.65);
  const [lat, setLat] = useState(43.9);
  const [zoom, setZoom] = useState(9);
  const [places, setPlaces] = useState(null);
  const [userId, setUserId] = useState(null);
  const [logged, setLogged] = useState(false);
  const [popupOpen, setPopupOpen] = useState(true);
  const [editedPlace, setEditedPlace] = useState(false);
  const [currentMarkers, setCurrentMarkers] = useState([]);
  const placeName = useRef(null);
  const placeAddress = useRef(null);
  const placeCoordinates = useRef(null);
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  const userLogged = (bool) => {
    setLogged(bool);
  };

  const setPlaceName = (name) => {
    placeName.current = name;
  };

  const editPlace = () => {
    setEditedPlace(!editedPlace)
  }

  const saveNewPlace = useCallback(async () => {
    console.log(
      "coord:",
      placeCoordinates.current,
      "address:",
      placeAddress.current,
      "name:",
      placeName.current
    );
    setPopupOpen(false);
    if (
      placeCoordinates.current &&
      placeAddress.current &&
      placeName.current &&
      userId
    ) {
      const id = Math.random() * 10;
      await setDoc(doc(firestoreDB, "places", `${id}`), {
        address: placeAddress.current,
        coordinates: `${placeCoordinates.current[0]}, ${placeCoordinates.current[1]}`,
        id: `${id}`,
        lat: placeCoordinates.current[1],
        lng: placeCoordinates.current[0],
        name: placeName.current,
        uid: userId,
      });
    } else if (!userId) {
      alert("You have to log in first!");
    } else {
      console.log("Error", userId);
    }
  }, [placeCoordinates, placeAddress, placeName, userId]);

  const handleMapClick = useCallback(
    (e) => {
      const coordinates = e.lngLat;
      setPopupOpen(true);
      placeCoordinates.current = [coordinates.lng, coordinates.lat];
      const popupNode = document.createElement("div");

      ReactDOM.render(
        <FormMap
          saveNewPlace={saveNewPlace}
          setPlaceName={setPlaceName}
          setPopupOpen={setPopupOpen}
        />,
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
          placeAddress.current = data.features[0]?.place_name;
        });
    },
    [saveNewPlace]
  );

  const defaultView = () => {
    map.current.setStyle("mapbox://styles/mapbox/streets-v11");
  };

  const satelliteView = () => {
    map.current.setStyle("mapbox://styles/mapbox/satellite-v9");
  };

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
      zoom: 9,
    });
    map.current.addControl(geocoder);
  }, []);

  useEffect(
    () =>
      onSnapshot(collection(firestoreDB, "places"), (snapshot) =>
        setPlaces(snapshot.docs.map((doc) => doc.data()))
      ),
    []
  );

  useEffect(() => {
    const userIdLocal = localStorage.getItem("ID");
    setUserId(userIdLocal);
  }, [logged]);

  useEffect(() => {
    map.current.off("click");
    map.current.on("click", handleMapClick);
  }, [handleMapClick]);

  useEffect(() => {
    if (!popupOpen) {
      popUpRef.current.remove();
    }
  }, [popupOpen]);

  useEffect(() => {
    for (let i = 0; i <= currentMarkers.length; i++) {
      currentMarkers[0]?.[0]?.remove();
    }
    places?.forEach((place) => {
      if (userId && userId === place.uid && logged) {
        const marker = new mapboxgl.Marker({ draggable: true })
          .setLngLat([place.lng, place.lat])
          .addTo(map.current);
        setCurrentMarkers([...currentMarkers, marker._map?._markers]);

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
      } else if (!logged) {
        for (let i = 0; i <= currentMarkers.length; i++) {
          currentMarkers[0]?.[0]?.remove();
        }
      }
    });
  }, [places, userId, logged, editPlace]);

  useEffect(() => {
    if (!map.current) return;
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  }, []);

  const handlePlaceClick = (e) => {
    if (!map.current) return;
    map.current.flyTo({
      center: [e.row.lng, e.row.lat],
      essential: true,
      zoom: 9,
    });
  };

  const editGeocode = () => {
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
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
        <Database
          places={places}
          handlePlaceClick={handlePlaceClick}
          editPlace={editPlace}
        />
        <Authorization
          userLogged={userLogged}
          defaultView={defaultView}
          satelliteView={satelliteView}
          setPlaces={setPlaces}
        />
      </Stack>
    </Box>
  );
};
export default Map;
