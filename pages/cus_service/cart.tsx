import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Cart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<
    Array<{
      id: string;
      quantity: number;
      name: string;
      price: number;
      path: string;
      type: string;
    }>
  >([]);

  useEffect(() => {
    if (router.query && router.query.items) {
      const queryParams = Array.isArray(router.query.items)
        ? router.query.items[0] // Lấy phần tử đầu tiên trong mảng
        : router.query.items;
      const decodedItems = JSON.parse(decodeURIComponent(queryParams));
      setCartItems(decodedItems);
    }
  }, [router.query]);

  return (
    <div>
      <h1>Cart</h1>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id}>
            <div>ID: {item.id}</div>
            <div>Name: {item.name}</div>
            <div>Quantity: {item.quantity}</div>
            <div>Price: {item.price}</div>
            <div>Type: {item.type}</div>
            <div>
              <img
                src={item.path}
                alt={item.name}
                style={{ maxWidth: "100px" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
