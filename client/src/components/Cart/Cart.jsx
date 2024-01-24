import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CartItem from "./CartItem/CartItem";

export default function Cart({ cart, removeItem }) {
  function removeItemFromCart(recipe_id) {
    removeItem(recipe_id);
  }

  const cartView = cart?.length ? (
    cart?.map((recipe) => {
      return (
        <Stack spacing={2} key={recipe.recipe_id}>
          <CartItem cartItem={recipe} removeItem={removeItemFromCart} />
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
      <Typography variant="h5">Cart</Typography>
      {cartView}
    </Stack>
  );
}
