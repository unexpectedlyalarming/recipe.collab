import Stack from "@mui/material/Stack";
import TrashIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function DeleteCart({ refreshCart }) {
  const {
    data: cartData,
    loading,
    request,
    success,
  } = useApi({
    url: `/cart`,
    method: "delete",
  });

  const [open, setOpen] = useState(false);

  function deleteCart() {
    try {
      request();
    } catch (error) {
      console.log(error);
    }
  }

  const alert = (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Delete Cart</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete your cart?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          onClick={() => {
            deleteCart();
            setOpen(false);
            refreshCart();
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: "2rem",
        }}
      >
        <IconButton color="error" onClick={() => setOpen(true)}>
          <TrashIcon />
          <Typography variant="h6" color="error">
            Delete Cart
          </Typography>
        </IconButton>
      </Stack>
      {alert}
    </>
  );
}
