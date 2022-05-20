import { styled } from "@material-ui/styles";
import { Autocomplete, TextField } from "@mui/material";
import React, { useContext } from "react";
import { PlacesContext } from "./Database";

const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiAutocomplete-inputRoot": {
    padding: 6,
  },
});

const AutocompleteInput = ({ params, onSelectPlace, handleChangePlace }) => {
  const places = useContext(PlacesContext);

  return (
    <StyledAutocomplete
      id="autocompleteInput"
      options={places}
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

export default AutocompleteInput;
