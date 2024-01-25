import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import _ from "lodash";

export default function SearchFilters({ setFilter, filter }) {
  const [debouncedFilter, setDebouncedFilter] = useState(filter);

  function handleInputChange(e) {
    setDebouncedFilter(e.target.value);

    setFilter(encodeURIComponent(e.target.value));
  }

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <TextField
        id="outlined-basic"
        label="Search"
        variant="outlined"
        fullWidth
        value={debouncedFilter}
        onChange={(e) => handleInputChange(e)}
      />
    </Stack>
  );
}
