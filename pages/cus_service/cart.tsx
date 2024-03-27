import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Cart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<
    Array<{ id: string; quantity: number }>
  >([]);

  useEffect(() => {
    if (router.query && Object.keys(router.query).length > 0) {
      const queryParams = router.query;
      const items = [];

      for (const key in queryParams) {
        if (key.startsWith("id")) {
          const id = key.substring(2);
          const quantity = parseInt(queryParams[key] as string, 10);
          items.push({ id, quantity });
        }
      }

      setCartItems(items);
    }
  }, [router.query]);

  return (
    <div>
      <h1>Cart</h1>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id}>
            ID: {item.id}, Quantity: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
