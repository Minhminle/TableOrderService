import { useEffect, useState } from "react";
import { initializeApp, getApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";
import { BillDetails, BillItem } from "@/models/Bill";

// // Khởi tạo Firebase App
// const firebaseApp = initializeApp(firebaseConfig);

// // Lấy đối tượng Firestore
// const firestore = getFirestore(firebaseApp);

// Component React để lấy dữ liệu từ Firestore
function FirebaseDataComponent() {
  // Kiểm tra xem ứng dụng Firebase đã tồn tại chưa
  let app;
  try {
    app = getApp();
  } catch (error) {
    // Ứng dụng Firebase chưa tồn tại, hãy khởi tạo mới
    app = initializeApp(firebaseConfig);
  }

  // Sử dụng ứng dụng Firebase đã khởi tạo để tạo Firestore
  const db = getFirestore(app);
  const [bills, setBills] = useState<BillDetails[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const billDetailsCollection = collection(db, "Bills"); // Thay "billDetails" bằng tên của collection trên Firestore của bạn
        const snapshot = await getDocs(billDetailsCollection);

        const billsData: BillDetails[] = [];

        snapshot.forEach((doc) => {
          const billData = doc.data();
          const { id, items, date, paymentStatus, totalPrice } = billData;

          // Chuyển đổi dữ liệu từ Firestore thành đối tượng BillDetails
          const billItems: BillItem[] = items.map((item: any) => {
            return new BillItem(
              item.menu_id,
              item.bill_price,
              item.quantity,
              item.note,
              item.itemstatus
            );
          });

          const billDetails = new BillDetails(
            id,
            billItems,
            new Date(date), // Chuyển đổi ngày từ dạng string sang Date
            paymentStatus,
            totalPrice
          );

          billsData.push(billDetails);
        });

        setBills(billsData);
      } catch (error) {
        console.error("Error fetching bills: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Bill Details</h2>
      <ul>
        {bills.map((bill) => (
          <li key={bill.id}>
            <p>Date: {bill.date.toDateString()}</p>
            <p>Total Price: {bill.totalPrice}</p>
            <p>Payment Status: {bill.paymentStatus ? "Paid" : "Not Paid"}</p>
            <ul>
              {bill.items.map((item, index) => (
                <li key={index}>
                  {item.quantity} x {item.menu_id} - {item.bill_price}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FirebaseDataComponent;
