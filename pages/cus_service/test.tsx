import React from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";
type Props = {};

const test = (props: Props) => {
  const firebaseConfig = {
    apiKey: "AIzaSyAvG04eeCLcb6VBF7F61x7H-3zyTTBQfjM",
    authDomain: "tableorderservice.firebaseapp.com",
    projectId: "tableorderservice",
    storageBucket: "tableorderservice.appspot.com",
    messagingSenderId: "789767582873",
    appId: "1:789767582873:web:c0cc47801fff8ba1b8f408",
    measurementId: "G-25TT028B48",
  };
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  // Tham chiếu đến bảng OrderDetails trong cơ sở dữ liệu
  const orderDetailsRef = ref(database, "OrderDetails");

  // Dữ liệu cần thêm vào bảng OrderDetails
  const orderDetailsData = {
    order_id: "YOUR_ORDER_ID",
    menu_id: "YOUR_MENU_ID",
    quantity: 1, // Số lượng
    orderdetails_price: 100, // Giá của mặt hàng
  };

  // Thêm dữ liệu vào bảng OrderDetails
  push(orderDetailsRef, orderDetailsData)
    .then(() => {
      console.log("Data added successfully!");
    })
    .catch((error) => {
      console.error("Error adding data: ", error);
    });
  return <></>;
};

export default test;
