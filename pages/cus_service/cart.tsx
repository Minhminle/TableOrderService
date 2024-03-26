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

const Cart = () => {
  const [products, setProducts] = useState([
    {
      name: "COMBO NƯỚNG LỚN & LẨU BÒ KIM CHÂM",
      path: "https://i.ibb.co/8dH5kK4/meat.jpg",
      quantity: 1,
      price: 13000,
    },
    {
      name: "TRỨNG",
      path: "https://i.ibb.co/rfBf8NF/temp-Picture.jpg",
      quantity: 1,
      price: 5000,
    },
  ]);

  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    );
  }, []);

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
  };

  // Tính tổng giá trị của các sản phẩm trong giỏ hàng
  const calculateTotalPrice = () => {
    let totalPrice = 0;
    products.forEach((product) => {
      totalPrice = totalPrice + product.quantity * product.price;
    });
    return totalPrice;
  };

  const router = useRouter();

  const handleExit = () => {
    router.push("/cus_service/menu"); // Điều hướng về trang chính (home)
  };

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
      <Box>
        <Stack spacing={1}>
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
                      {product.quantity * product.price} VND
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
        Tổng cộng: {calculateTotalPrice()} VND
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
