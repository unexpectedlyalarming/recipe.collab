import Cart from "../../components/Cart/Cart";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import Loading from "../Loading/Loading";
import { useState } from "react";
import DeleteCart from "../../components/Cart/DeleteCart/DeleteCart";
import Container from "@mui/material/Container";
export default function CartPage() {
  const [refresh, setRefresh] = useState(false);
  const {
    data: cartData,
    setData: setCart,
    loading,
    request,
    success,
  } = useApi({
    url: `/cart/user`,
  });

  useEffect(() => {
    async function fetchCart() {
      try {
        await request();
      } catch (error) {
        console.log(error);
      }
    }
    fetchCart();
  }, [success, refresh]);

  function handleRefresh() {
    setRefresh(!refresh);
  }

  function filterItem(recipe_id) {
    const newCart = cartData.filter((item) => item.recipe_id !== recipe_id);
    setCart(newCart);
  }

  if (loading) return <Loading />;

  return (
    <Container>
      <Cart cart={cartData} removeItem={filterItem} />
      <DeleteCart refreshCart={handleRefresh} />
    </Container>
  );
}
