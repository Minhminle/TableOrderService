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
export class BillItem {
  menu_id: string;
  bill_price: number;
  quantity: number;
  note: string;
  itemstatus: boolean;

  constructor(
    menu_id: string,
    bill_price: number,
    quantity: number,
    note: string = "",
    itemstatus: boolean = true
  ) {
    this.menu_id = menu_id;
    this.bill_price = bill_price;
    this.quantity = quantity;
    this.note = note;
    this.itemstatus = itemstatus;
  }
}

// Cập nhật lớp BillDetails để chứa mảng các mục được chọn
export class BillDetails {
  id: string;
  items: BillItem[];
  date: Date;
  paymentStatus: boolean;
  totalPrice: number;

  constructor(
    id: string,
    items: BillItem[],
    date: Date,
    paymentStatus: boolean,
    totalPrice: number
  ) {
    this.id = id;
    this.items = items;
    this.date = date;
    this.paymentStatus = paymentStatus;
    this.totalPrice = totalPrice;
  }
}

export function useFetchBillDetails(tableId: string) {
  const [billDetails, setBillDetails] = useState<BillDetails[]>([]);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const fetchData = async () => {
      try {
        const billsCollection = collection(db, "Bills");
        const q = query(billsCollection, where("tableId", "==", tableId));
        const querySnapshot = await getDocs(q);
        const billDetailsList = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            // Lấy ID của BillDetails từ doc.id
            const id = doc.id;
            // Chuyển đổi dữ liệu của mỗi mục items trong dữ liệu Firestore thành BillItem
            const items = data.items.map(
              (item: any) =>
                new BillItem(item.menu_id, item.bill_price, item.quantity)
            );
            return new BillDetails(
              id,
              items,
              data.billDate,
              data.paymentStatus,
              data.totalPrice
            );
          })
          .filter((billDetail) => !billDetail.paymentStatus); // Lọc các đơn hàng có paymentStatus là false
        setBillDetails(billDetailsList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [tableId]);

  return billDetails;
}
