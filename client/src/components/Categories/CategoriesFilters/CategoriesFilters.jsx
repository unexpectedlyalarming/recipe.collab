import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { useState } from "react";

export default function CategoriesFilters({ tags, setFilter, filter }) {
  function handleFilterChange(tag) {
    setFilter(tag.tag);
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
    <Grid container spacing={2}>
      {tagsList}
    </Grid>
  );
}
