import { Stack, Button, TextField, Typography } from "@mui/material";
import useApi from "../../../hooks/useApi";
import { useState } from "react";

export default function CreateList({ updateLists }) {
  const [name, setName] = useState("");

  const [error, setError] = useState(null);

  const { request } = useApi({
    url: `/list`,
    method: "post",
    body: {
      name,
    },
  });

  async function addList() {
    try {
      setError("Loading...");

      const data = await request();

      if (data) {
        updateLists(data);
        setError(null);
      } else {
        setError("An unknown error has occured.");
      }
    } catch (error) {
      setError(error?.message);
    }
  }

  return (
    <Stack spacing={2}>
      <TextField
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="List name"
        required
      />

      <Button onClick={addList}>Create New List</Button>

      <Typography variant="p">{error}</Typography>
    </Stack>
  );
}
