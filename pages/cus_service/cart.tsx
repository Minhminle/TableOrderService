import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Cart = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<
    Array<{ id: string; quantity: number }>
  >([]);

  useEffect(() => {
    // Kiểm tra xem router.query có tồn tại hay không và có chứa các query params không
    if (router.query && Object.keys(router.query).length > 0) {
      const queryParams = router.query;
      const items = [];

      // Xử lý thông tin sản phẩm từ query params
      for (const key in queryParams) {
        if (key.startsWith("id")) {
          const id = key.substring(2);
          const quantity = parseInt(queryParams[key] as string, 10); // Chú ý ép kiểu đúng cách
          items.push({ id, quantity });
        }
      }

      // Cập nhật state với thông tin sản phẩm
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
