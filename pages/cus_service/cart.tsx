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
  const [quantity, setQuantity] = useState(1); // Trạng thái lưu giá trị hiện tại của TextField sản phẩm 1
  const [price, setPrice] = useState(13000); // Giá tiền của mỗi sản phẩm
  const [totalPrice, setTotalPrice] = useState(0); // Trạng thái lưu tổng tiền
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
  const handleTextFieldFocus = () => {
    if (isMobile) {
      setIsKeyboardOpen(true);
    }
  };

  const handleTextFieldBlur = () => {
    if (isMobile) {
      setIsKeyboardOpen(false);
    }
  };

  // Hàm tăng giá trị sản phẩm
  const increase = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
    setTotalPrice((prevTotalPrice) => prevTotalPrice + price); // Cập nhật tổng tiền khi tăng số lượng
  };

  // Hàm giảm giá trị sản phẩm
  const decrease = () => {
    if (quantity > 0) {
      setQuantity((prevQuantity) => prevQuantity - 1);
      setTotalPrice((prevTotalPrice) => prevTotalPrice - price); // Cập nhật tổng tiền khi giảm số lượng
    }
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
      <Box>
        <Stack display="flex">
          <Stack
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
              src="https://i.ibb.co/8dH5kK4/meat.jpg"
              sx={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
              }}
            />
            <Stack pl={"5px"}>
              <Typography style={{ fontSize: "13px", fontWeight: "bold" }}>
                COMBO NƯỚNG LỚN & LẨU BÒ KIM CHÂM
              </Typography>
              <Stack direction={"row"}>
                <TextField
                  id="standard-basic"
                  label="Ghi chú"
                  onFocus={handleTextFieldFocus}
                  onBlur={handleTextFieldBlur}
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
                    sx={{ fontWeight: 700, color: "red", textAlign: "right" }}
                  >
                    {price * quantity} VND
                  </Typography>
                  <Stack
                    sx={{ justifyContent: "flex-end" }}
                    direction={"row"}
                    spacing={0}
                  >
                    <IconButton sx={{ padding: "0" }} onClick={increase}>
                      <LocalHospitalIcon />
                    </IconButton>
                    <TextField
                      value={quantity}
                      variant="standard"
                      inputProps={{
                        style: {
                          textAlign: "center",
                          maxWidth: "30px",
                        },
                      }}
                    />
                    <IconButton sx={{ padding: "0" }} onClick={decrease}>
                      <IndeterminateCheckBoxIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <Typography
        sx={{
          textAlign: "right",
          color: "#d50000",
          fontWeight: "bold",
          mt: "10px",
          mr: "5px",
        }}
      >
        {/* totalPrice */}
        Tổng cộng: {price * quantity} VND
        {/* Hiển thị tổng tiền */}
      </Typography>

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
