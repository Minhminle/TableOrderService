import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getApp, initializeApp } from "firebase/app";
import { firebaseConfig } from "@/models/Config";
import { BillDetails, BillItem } from "@/models/Bill";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";

// // Khởi tạo Firebase App
// const firebaseApp = initializeApp(firebaseConfig);

// // Lấy đối tượng Firestore
// const firestore = getFirestore(firebaseApp);
function convertDateFormat(dateString: string) {
  // Phân tách ngày giờ thành các phần
  const parts = dateString.split(" ");
  const datePart = parts[0];
  const timePart = parts[1];

  // Phân tách ngày thành ngày, tháng và năm
  const dateParts = datePart.split("/");
  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];

  // Phân tách giờ, phút và giây
  const timeParts = timePart.split(":");
  const hour = timeParts[0];
  const minute = timeParts[1];
  const second = timeParts[2];

  // Kết hợp lại thành định dạng "MM/DD/YYYY HH:MM:SS"
  const formattedDate = `${month}/${day}/${year} ${hour}:${minute}:${second}`;

  return new Date(formattedDate); // Trả về một đối tượng Date mới
}

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
            new Date(convertDateFormat(date)), // Chuyển đổi ngày từ dạng string sang Date
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
    // const interval = setInterval(() => {
    //   fetchData(); // Gọi lại fetchData sau mỗi 20 giây
    // }, 3000);

    // return () => {
    //   clearInterval(interval); // Xóa interval khi component bị unmount
    // };
  }, []);

  return (
    <Box>
      <h2>Bill Details</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.date.toDateString()}</TableCell>
                <TableCell>{bill.totalPrice}</TableCell>
                <TableCell>
                  {bill.paymentStatus ? "Paid" : "Not Paid"}
                </TableCell>
                <TableCell>
                  <ul>
                    {bill.items.map((item, index) => (
                      <li key={index}>
                        {item.quantity} x {item.menu_id} - {item.bill_price}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default FirebaseDataComponent;
