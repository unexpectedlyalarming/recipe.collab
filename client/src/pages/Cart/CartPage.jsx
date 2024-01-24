import Cart from "../../components/Cart/Cart";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import Loading from "../Loading/Loading";
import { useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const {
    data: cartData,
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
        setCart(cartData);
      } catch (error) {
        console.log(error);
      }
    }
    fetchCart();
  }, [success]);

  function filterItem(recipe_id) {
    const newCart = cart.filter((item) => item.recipe_id !== recipe_id);
    setCart(newCart);
  }

  if (loading) return <Loading />;

  return (
    <>
      <Cart cart={cart} removeItem={filterItem} />
    </>
  );
}
