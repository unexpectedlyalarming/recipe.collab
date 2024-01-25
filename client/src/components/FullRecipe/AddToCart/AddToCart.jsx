import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import Chip from "@mui/material/Chip";
import CartIcon from "@mui/icons-material/ShoppingCart";
import CartIconOutlined from "@mui/icons-material/ShoppingCartOutlined";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";

export default function AddToCart({ recipeId }) {
  const [added, setAdded] = useState(false);
  const [addedSnackbar, setAddedSnackbar] = useState(false);
  const [removedSnackbar, setRemovedSnackbar] = useState(false);
  const {
    data: recipeInCart,
    loading,
    request,
  } = useApi({
    url: `/cart/${recipeId}`,
  });

  useEffect(() => {
    async function fetchCart() {
      try {
        const response = await request();

        if (response) {
          setAdded(true);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchCart();
  }, []);

  //add to cart

  const {
    data: addedRecipe,
    loading: adding,
    request: addToCart,
  } = useApi({
    url: `/cart/${recipeId}`,
    method: "post",
  });

  // remove from cart

  const {
    data: removedRecipe,
    loading: removing,
    request: removeFromCart,
  } = useApi({
    url: `/cart/${recipeId}`,
    method: "delete",
  });

  async function handleClick() {
    if (added) {
      try {
        await removeFromCart();
        setAdded(false);

        setRemovedSnackbar(true);
        setTimeout(() => {
          setRemovedSnackbar(false);
        }, 2000);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await addToCart();
        setAdded(true);

        setAddedSnackbar(true);
        setTimeout(() => {
          setAddedSnackbar(false);
        }, 2000);
      } catch (error) {
        console.log(error);
      }
    }
  }

  if (loading) return <CircularProgress />;

  if (added) {
    return (
      <>
        <IconButton
          color="primary"
          aria-label="Remove from shopping cart"
          onClick={handleClick}
        >
          <CartIcon />
        </IconButton>
        <Snackbar
          open={removedSnackbar}
          autoHideDuration={2000}
          message="Added to cart"
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={() => setRemovedSnackbar(false)}
        />
      </>
    );
  } else {
    return (
      <>
        <IconButton
          color="primary"
          aria-label="add to shopping cart"
          onClick={handleClick}
        >
          <CartIconOutlined />
        </IconButton>
        <Snackbar
          open={addedSnackbar}
          autoHideDuration={2000}
          message="Removed from cart"
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={() => setAddedSnackbar(false)}
        />
      </>
    );
  }
}
