import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { useState, useMemo } from "react";

export default function CategoriesFilters({ tags, setFilter }) {
  const [selected, setSelected] = useState(null);

  function handleFilterChange(tag) {
    setSelected(tag.tag);
    setFilter(tag.tag);
  }

  const tagsList = useMemo(
    () =>
      tags?.map((tag) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={tag?.tag_id}>
          <Chip
            label={tag.tag}
            onClick={() => handleFilterChange(tag)}
            color={selected === tag.tag ? "primary" : "default"}
          />
        </Grid>
      )),
    [tags, selected, handleFilterChange]
  );

  return (
    <Grid container spacing={2}>
      {tagsList}
    </Grid>
  );
}
