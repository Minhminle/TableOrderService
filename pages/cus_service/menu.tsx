import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { useRouter } from "next/router";
import { getFirestore } from "firebase/firestore";
import Image from "next/image";
import { collection, addDoc, getDocs, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Box, Button, Grid, ListItem, Stack, Typography } from "@mui/material";
import firebase from "firebase/compat/app";

class Menu {
  id: string;
  name: string;
  price: number;
  path: string;
  type: string;
  constructor(
    id: string,
    name: string,
    price: number,
    path: string,
    type: string
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.path = path;
    this.type = type;
  }
}

const Home = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [showMenuDetail, sethSowMenuDetail] = useState<boolean>(false);
  const [showTypeList, setShowTypeList] = useState(false);
  const [selectedMenuItems, setSelectedMenuItems] = useState<Menu[]>([]);
  const [selectedType, setSelectedType] = useState("All");
  const [cartItems, setCartItems] = useState<
    {
      id: string;
      quantity: number;
      name: string;
      price: number;
      path: string;
      type: string;
    }[]
  >([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const router = useRouter();
  const handleViewCart = () => {
    const queryParams = encodeURIComponent(JSON.stringify(cartItems));
    router.push(`/cus_service/cart?items=${queryParams}`);
  };

  const handleTypeClick = () => {
    setShowTypeList(!showTypeList);
    setShowMenu(false);
    sethSowMenuDetail(false);
    setSelectedType("All");
  };
  const handleAllClick = () => {
    setShowMenu(true);
    setShowTypeList(false);
    sethSowMenuDetail(false);
  };
  const handleTypeDetailClick = (type: string) => {
    const filteredMenuItems = menus.filter((menu) => menu.type === type);
    setSelectedMenuItems(filteredMenuItems);
    setShowMenu(false);
    setShowTypeList(false);
    sethSowMenuDetail(true);
    setSelectedType(type);
  };

  useEffect(() => {
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
    const db = getFirestore(app);

    const fetchData = async () => {
      try {
        const menuCollection = collection(db, "Menus");
        const menuSnapshot = await getDocs(menuCollection);
        const menuList = menuSnapshot.docs.map((doc) => {
          const data = doc.data();
          return new Menu(doc.id, data.name, data.price, data.path, data.type);
        });
        setMenus(menuList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
    return () => {};
  }, []);

  const handleAddToCart = (menuId: string) => {
    // Tìm mặt hàng trong danh sách menu dựa trên menuId
    const menuItem = menus.find((menu) => menu.id === menuId);
    if (menuItem) {
      // Kiểm tra xem mặt hàng đã có trong giỏ hàng chưa
      const existingItemIndex = cartItems.findIndex(
        (item) => item.id === menuId
      );
      if (existingItemIndex === -1) {
        // Nếu món chưa có trong giỏ hàng, thêm vào giỏ hàng với số lượng là 1
        console.log("Adding item with ID:", menuId);
        setCartItems((prevCartItems) => [
          ...prevCartItems,
          {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            path: menuItem.path,
            type: menuItem.type,
            quantity: 1,
          },
        ]);
        setSelectedItems((prevSelectedItems) => [...prevSelectedItems, menuId]);
      } else {
        // Nếu món đã có trong giỏ hàng, kiểm tra xem nó đã được chọn hay chưa
        if (selectedItems.includes(menuId)) {
          // Nếu đã được chọn, bỏ món ra khỏi giỏ hàng
          console.log("Removing item with ID:", menuId);
          setCartItems((prevCartItems) =>
            prevCartItems.filter((item) => item.id !== menuId)
          );
          setSelectedItems((prevSelectedItems) =>
            prevSelectedItems.filter((id) => id !== menuId)
          );
        } else {
          // Nếu chưa được chọn, tăng số lượng lên 1
          console.log("Incrementing quantity for item with ID:", menuId);
          setCartItems((prevCartItems) =>
            prevCartItems.map((item) =>
              item.id === menuId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
          setSelectedItems((prevSelectedItems) => [
            ...prevSelectedItems,
            menuId,
          ]);
        }
      }
    } else {
      console.error("Menu item not found!");
    }
  };

  useEffect(() => {
    const totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    setCartTotal(totalItems);
  }, [cartItems]);
  const sendOrder = () => {
    const orderRef = firebase.database().ref("OrderDetails");
    orderRef
      .push(cartItems)
      .then(() => {
        console.log("Data sent successfully!");

        setCartItems([]);
      })
      .catch((error) => {
        console.error("Error sending data: ", error);
      });
  };

  return (
    <>
      <Box sx={{ background: "#ECECEC", position: "relative" }}>
        <Stack
          direction="row"
          sx={{
            background: "#C50023",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0px 20px",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#ffffff",
                fontWeight: 600,
              }}
              variant="h5"
            >
              THỰC ĐƠN
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            sx={{ borderRadius: 5, minWidth: "150px" }}
            onClick={() => handleTypeClick()}
          >
            <Stack
              direction="row"
              display="flex"
              alignItems="center"
              gap="10px"
            >
              <Typography>{selectedType}</Typography>
              <Box
                component="img"
                width="5"
                height="5"
                src="https://img.icons8.com/ios-glyphs/30/expand-arrow--v1.png"
                alt="expand-arrow--v1"
                style={{ filter: "invert(100%)" }}
              />
            </Stack>
          </Button>
        </Stack>
        {/* Hientypelist */}
        {showTypeList && (
          <Box sx={{ p: "15px 10px 15px 10px" }}>
            <Grid container spacing={2}>
              {Array.from(new Set(menus.map((menu) => menu.type))).map(
                (type, index) => {
                  const firstMenuItem = menus.find(
                    (menu) => menu.type === type
                  );
                  if (firstMenuItem) {
                    return (
                      <Grid item xs={6} key={index}>
                        <Box
                          sx={{
                            background: "white",
                            borderRadius: "16px ",
                          }}
                          onClick={
                            type === "All"
                              ? handleAllClick
                              : () => handleTypeDetailClick(type)
                          }
                        >
                          <Stack
                            display="flex"
                            alignItems="center"
                            sx={{ pt: "20px" }}
                          >
                            <Box
                              component="img"
                              src={firstMenuItem.path}
                              sx={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                p: "5px 0px 5px 0px",
                                borderRadius: "16px",
                              }}
                            />
                            <Typography sx={{ fontWeight: 700 }}>
                              {type}
                            </Typography>
                          </Stack>
                        </Box>
                      </Grid>
                    );
                  }
                  return null;
                }
              )}
            </Grid>
          </Box>
        )}

        {/* Hiendataloc */}
        {showMenuDetail && (
          <Stack sx={{ p: "16px 10px 16px 10px" }}>
            <Grid container spacing={2}>
              {selectedMenuItems
                .sort((a, b) => b.price - a.price)
                .map((menuItem, index) => (
                  <Grid
                    item
                    xs={6}
                    key={index}
                    onClick={() => handleAddToCart(menuItem.id)}
                  >
                    <ListItem
                      sx={{
                        justifyContent: "flex",
                        flexDirection: "column",
                        background: "white",
                        borderRadius: "16px",
                        height: "240px",
                        border: selectedItems.includes(menuItem.id)
                          ? "2px solid red"
                          : "none",
                      }}
                    >
                      <Stack
                        direction="column"
                        alignItems="center"
                        sx={{ pt: "20px" }}
                      >
                        <Box
                          component="img"
                          alt={menuItem.name}
                          src={menuItem.path}
                          sx={{
                            maxWidth: "120px",
                            maxHeight: "120px",
                            pb: "10px",
                            borderRadius: "16px",
                          }}
                        />
                        <Typography sx={{ fontWeight: 700 }}>
                          {menuItem.name}
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>
                          {menuItem.price.toLocaleString("vi-VN")}VNĐ
                        </Typography>
                      </Stack>
                    </ListItem>
                  </Grid>
                ))}
            </Grid>
          </Stack>
        )}

        {/* Hienmenu */}
        {showMenu && (
          <Box sx={{ p: "16px 10px 16px 10px" }}>
            <Grid container spacing={2}>
              {menus
                .filter((menu) => menu.price !== 0)
                .sort((a, b) => b.price - a.price)
                .map((menu, index) => (
                  <Grid
                    item
                    xs={6}
                    key={index}
                    onClick={() => handleAddToCart(menu.id)}
                  >
                    <ListItem
                      sx={{
                        justifyContent: "flex",
                        flexDirection: "column",
                        background: "white",
                        borderRadius: "16px",
                        height: "260px",
                        border: selectedItems.includes(menu.id)
                          ? "2px solid red"
                          : "none",
                      }}
                    >
                      <Stack
                        direction="column"
                        alignItems="center"
                        sx={{ pt: "20px" }}
                      >
                        <Box
                          component="img"
                          alt={menu.name}
                          src={menu.path}
                          sx={{
                            maxWidth: "120px",
                            maxHeight: "120px",
                            pb: "10px",
                            borderRadius: "16px",
                          }}
                        />

                        <Typography sx={{ fontWeight: 700 }}>
                          {menu.name}
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>
                          {menu.price.toLocaleString("vi-VN")}VNĐ
                        </Typography>
                      </Stack>
                    </ListItem>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}

        {/* Nutmuahang */}
        <Box sx={{ position: "fixed", bottom: "30px", right: "15px" }}>
          <Button sx={{ borderRadius: "100%" }} onClick={handleViewCart}>
            <img
              width="50"
              height="50"
              src="https://img.icons8.com/fluency/48/shopping-cart.png"
              alt="shopping-cart"
            />
          </Button>
          <Box
            sx={{
              position: "absolute",
              bottom: "50%",
              right: "0px",
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              width: "25px",
              height: "25px",
              textAlign: "center",
              fontSize: "14px",
              lineHeight: "25px",
            }}
          >
            {cartTotal}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Home;
