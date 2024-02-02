import Stack from "@mui/material/Stack";
import { Button } from "@mui/material";
import { useState } from "react";
import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContextText from "@mui/material/DialogContentText";
import { set } from "lodash";

export default function ForkButton({ forkOfUserRecipe, forkId }) {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const { data, loading, success, request } = useApi({
    url: `/recipe/versions/accept/${forkId}`,
    method: "patch",
  });

  async function handleFork() {
    try {
      const data = await request();
      if (data) {
        navigate(`/recipe/${data.recipe_id}`);
      }

      setIsOpen(false);
    } catch (error) {
      console.log(error);
    }
  }

  const ownerForkView = (
    <Stack direction="row" spacing={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsOpen(true)}
      >
        Merge with Original
      </Button>
    </Stack>
  );

  const dialogView = (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <DialogTitle>Confirm Fork</DialogTitle>
      <DialogContent>
        <DialogContextText>
          Are you sure you want to fork this recipe?
        </DialogContextText>

        <DialogContextText>
          Forking this recipe will delete your original recipe and replace it
          with this one.
        </DialogContextText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button onClick={handleFork}>Merge</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {forkOfUserRecipe && ownerForkView}
      {dialogView}
    </>
  );
}
