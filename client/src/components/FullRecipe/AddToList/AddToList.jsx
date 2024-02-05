import {
  Stack,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import useApi from "../../../hooks/useApi";
import { useState, useEffect } from "react";

export default function AddToList({ recipe_id }) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: lists, request } = useApi({
    url: `/list`,
  });

  useEffect(() => {
    async function getLists() {
      try {
        await request();
      } catch (error) {
        console.error(error);
      }
    }

    getLists();
  }, []);

  async function addRecipe(list_id) {}

  const listItems = lists?.length ? (
    lists.map((list) => {
      return (
        <ListItem key={list.list_id}>
          <ListItemButton onClick={() => addRecipe(list.list_id)}>
            <ListItemText primary={list.name} />
          </ListItemButton>
        </ListItem>
      );
    })
  ) : (
    <ListItem>
      <ListItemText primary="No lists available" />
    </ListItem>
  );

  const listModal = (
    <Dialog onClose={() => setModalOpen(false)} open={modalOpen}>
      <DialogTitle>Add To List</DialogTitle>
      <List>{listItems}</List>
    </Dialog>
  );

  return (
    <Stack spacing={2}>
      <Button onClick={() => setModalOpen(true)}>Add to list</Button>

      {modalOpen && listModal}
    </Stack>
  );
}
