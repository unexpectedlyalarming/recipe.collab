import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import ListItem from "./ListItem/ListItem";

export default function List({ list, removeItem, listName }) {
  function removeItemFromList(recipe_id) {
    removeItem(recipe_id);
  }

  const listView = list?.length ? (
    list?.map((recipe) => {
      return (
        <Stack spacing={2} key={recipe.recipe_id}>
          <ListItem listItem={recipe} removeItem={removeItemFromList} />
        </Stack>
      );
    })
  ) : (
    <Stack spacing={2}>
      <Typography variant="h5">No recipes found</Typography>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{listName}</Typography>
      {listView}
    </Stack>
  );
}
