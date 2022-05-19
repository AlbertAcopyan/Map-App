import { Button } from "@mui/material";

export const columns = [
  { field: "name", headerName: "Name", width: 130, editable: true, renderCell: () => <Button>ASASDASD</Button> },
  { field: "address", headerName: "Address", width: 150, editable: true },
  {
    field: "coordinates",
    headerName: "Coodrinates",
    width: 150, editable: true
  },
];
