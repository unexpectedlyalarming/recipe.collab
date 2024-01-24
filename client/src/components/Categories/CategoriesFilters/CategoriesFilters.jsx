import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import _ from "lodash";

export default function CategoriesFilters({
  tags,
  setFilter,
  filter,
  setTagQuery,
}) {
  function handleFilterChange(tag) {
    setFilter(tag.tag);
  }

  const [debouncedFilter, setDebouncedFilter] = useState(filter);

  function handleInputChange(e) {
    setDebouncedFilter(e.target.value);

    setFilter(encodeURIComponent(_.startCase(e.target.value)));
    setTagQuery(encodeURIComponent(_.startCase(e.target.value)));
  }

  const tagsList = tags?.map((tag) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={tag?.tag_id}>
        <Chip
          label={tag.tag}
          onClick={() => handleFilterChange(tag)}
          color={filter === tag.tag ? "primary" : "default"}
        />
      </Grid>
    );
  });

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Grid container spacing={2}>
        {tagsList}
      </Grid>
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
