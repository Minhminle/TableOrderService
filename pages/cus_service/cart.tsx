import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import firebase from "firebase/compat/app";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, push } from "firebase/database";
const Cart = () => {
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
  const orderRef = ref(database, "OrderDetails");
  const router = useRouter();
  const [products, setProducts] = useState<
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
        ? router.query.items[0]
        : router.query.items;
      const decodedItems = JSON.parse(decodeURIComponent(queryParams));
      setProducts(decodedItems);
    }
  }, [router.query]);

  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Hàm tăng số lượng sản phẩm
  const increaseQuantity = (index: number) => {
    const newProducts = [...products];
    newProducts[index].quantity++;
    setProducts(newProducts);
  };

  // Hàm giảm số lượng sản phẩm
  const decreaseQuantity = (index: number) => {
    const newProducts = [...products];
    if (newProducts[index].quantity > 0) {
      newProducts[index].quantity--;
      setProducts(newProducts);
    }
    if (newProducts[index].quantity === 0) {
      newProducts.splice(index, 1);
      setProducts(newProducts);
    }
  };

  // Tính tổng giá trị của các sản phẩm trong giỏ hàng
  const calculateTotalPrice = () => {
    let totalPrice = 0;
    products.forEach((product) => {
      totalPrice = totalPrice + product.quantity * product.price;
    });
    return totalPrice;
  };

  const handleExit = () => {
    router.push("/cus_service/menu"); // Điều hướng về trang chính (home)
  };
  function sendOrder(
    products: {
      id: string;
      quantity: number;
      name: string;
      price: number;
      path: string;
      type: string;
    }[]
  ) {
    // Gửi toàn bộ mảng products lên Firebase Realtime Database
    orderRef
      .set(products) // Gửi dữ liệu của toàn bộ mảng lên Firebase
      .then(() => {
        console.log("Data sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending data: ", error);
      });
  }

  return (
    <>
      <Box
        sx={{
          background: "#C50023",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Typography
          sx={{
            color: "white",
            fontWeight: 600,
          }}
          variant="h5"
        >
          THÔNG TIN ĐƠN HÀNG
        </Typography>
      </Box>
      {/* Hiểnthị*/}
      <Box sx={{ p: "20px 0px 0px 0px" }}>
        <Stack display="flex" gap="20px">
          {products.map((product, index) => (
            <Stack
              key={index}
              direction={"row"}
              justifyContent="space-between"
              sx={{
                padding: "5px",
                backgroundColor: "#fff9c4",
                width: "99%",
                borderRadius: "16px",
              }}
            >
              <Box
                component="img"
                src={`${product.path}`}
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                }}
              />
              <Stack pl={"5px"}>
                <Typography style={{ fontSize: "13px", fontWeight: "bold" }}>
                  {product.name}
                </Typography>
                <Stack direction={"row"}>
                  <TextField
                    id="standard-basic"
                    label="Ghi chú"
                    onFocus={() => setIsKeyboardOpen(true)}
                    onBlur={() => setIsKeyboardOpen(false)}
                    variant="standard"
                    style={{ fontSize: "10px", fontStyle: "italic" }}
                    sx={{ width: "100%" }}
                    InputProps={{
                      style: {
                        fontSize: "15px",
                        background: "transparent", // Đặt màu nền thành trong suốt
                      },
                    }}
                  />
                  <Stack sx={{ width: "100%" }}>
                    <Typography
                      style={{ fontSize: "15px" }}
                      sx={{
                        fontWeight: 700,
                        color: "red",
                        textAlign: "right",
                      }}
                    >
                      {(product.quantity * product.price).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VND
                    </Typography>
                    <Stack
                      sx={{ justifyContent: "flex-end" }}
                      direction={"row"}
                      spacing={0}
                    >
                      <IconButton
                        sx={{ padding: "0" }}
                        onClick={() => decreaseQuantity(index)}
                      >
                        <IndeterminateCheckBoxIcon />
                      </IconButton>
                      <TextField
                        value={product.quantity}
                        variant="standard"
                        inputProps={{
                          style: {
                            textAlign: "center",
                            maxWidth: "30px",
                          },
                        }}
                      />
                      <IconButton
                        sx={{ padding: "0" }}
                        onClick={() => increaseQuantity(index)}
                      >
                        <LocalHospitalIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Hiển thị tổng giá trị */}
      <Typography
        sx={{
          textAlign: "right",
          color: "#d50000",
          fontWeight: "bold",
          mt: "10px",
          mr: "5px",
        }}
      >
        Tổng cộng: {calculateTotalPrice().toLocaleString("vi-VN")} VND
      </Typography>

      {/* Button điều hướng và thoát */}
      <Box
        sx={{
          position: "fixed",
          bottom: isMobile && isKeyboardOpen ? "100vh" : 0,
          left: 0,
          right: 0,
          padding: 2,
          background: "#fff",
        }}
      >
        <Stack spacing={1}>
          <Button
            variant="contained"
            style={{ width: "100%", background: "#C50023", color: "#ffffff" }}
            onClick={() => sendOrder}
          >
            Gửi đơn
          </Button>
          <Button
            variant="contained"
            style={{ width: "100%", background: "#ffffff", color: "gray" }}
            onClick={handleExit}
          >
            Thoát
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default Cart;
