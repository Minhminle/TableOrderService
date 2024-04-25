import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";

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

export class BillDetails {
  id: string;
  items: BillItem[];
  date: Date;
  paymentStatus: boolean;
  totalPrice: number;

  constructor(
    id: string,
    items: BillItem[],
    date: any, // Sử dụng any cho date trước khi kiểm tra
    paymentStatus: boolean,
    totalPrice: number
  ) {
    this.id = id;
    this.items = items;
    this.date = date instanceof Date ? date : date.toDate(); // Kiểm tra và chuyển đổi sang Date nếu cần
    this.paymentStatus = paymentStatus;
    this.totalPrice = totalPrice;
  }
}

export function useFetchBillDetails() {
  const [billDetails, setBillDetails] = useState<BillDetails[]>([]);

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        const billsCollection = collection(db, "Bills");
        const querySnapshot = await getDocs(billsCollection);

        const fetchedBillDetails: BillDetails[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();

          const items: BillItem[] = data.items.map(
            (item: any) =>
              new BillItem(
                item.menu_id,
                item.bill_price,
                item.quantity,
                item.note,
                item.itemstatus
              )
          );

          const billDetails = new BillDetails(
            doc.id,
            items,
            data.date, // Truyền data.date trước khi kiểm tra và chuyển đổi
            data.paymentStatus,
            data.totalPrice
          );

          fetchedBillDetails.push(billDetails);
        });

        console.log("Fetched Bill Details:", fetchedBillDetails);
        setBillDetails(fetchedBillDetails);
      } catch (error) {
        console.error("Error fetching bill details: ", error);
      }
    };

    fetchBillDetails();

    return () => {
      // Cleanup function (nếu cần thiết)
    };
  }, []);

  return billDetails;
}
