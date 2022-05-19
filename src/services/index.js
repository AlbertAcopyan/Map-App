export async function fetchText(lng, lat) {
  let response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
  );
  return response;
}

export async function fetchPlaces(value) {
  let response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
  );
  return response;
}  
