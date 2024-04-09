import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";
import {
  query,
  where,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";

// Định nghĩa một lớp mới để phản ánh cấu trúc dữ liệu của mỗi mục trong items array
export class OrderItem {
  menu_id: string;
  orderdetails_price: number;
  quantity: number;
  note: string;
  itemstatus: boolean;

  constructor(
    menu_id: string,
    orderdetails_price: number,
    quantity: number,
    note: string = "",
    itemstatus: boolean = true
  ) {
    this.menu_id = menu_id;
    this.orderdetails_price = orderdetails_price;
    this.quantity = quantity;
    this.note = note;
    this.itemstatus = itemstatus;
  }
}

// Cập nhật lớp OrderDetails để chứa mảng các mục được chọn
export class OrderDetails {
  items: OrderItem[];
  orderDate: Date;
  orderTime: string;
  paymentStatus: boolean;
  totalPrice: number;

  constructor(
    items: OrderItem[],
    orderDate: Date,
    orderTime: string,
    paymentStatus: boolean = false,
    totalPrice: number
  ) {
    this.items = items;
    this.orderDate = orderDate;
    this.orderTime = orderTime;
    this.paymentStatus = paymentStatus;
    this.totalPrice = totalPrice;
  }
}

export function useFetchOrderDetails(tableId: string) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const fetchData = async () => {
      try {
        const orderDetailsCollection = collection(db, "OrderDetails");
        const q = query(
          orderDetailsCollection,
          where("tableId", "==", tableId)
        );
        const querySnapshot = await getDocs(q);
        const orderDetailsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Chuyển đổi dữ liệu của mỗi mục items trong dữ liệu Firestore thành OrderItem
          const items = data.items.map(
            (item: any) =>
              new OrderItem(
                item.menu_id,
                item.orderdetails_price,
                item.quantity
              )
          );
          return new OrderDetails(
            items,
            data.orderDate,
            data.orderTime,
            data.paymentStatus,
            data.totalPrice
          );
        });
        setOrderDetails(orderDetailsList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [tableId]);

  return orderDetails;
}
