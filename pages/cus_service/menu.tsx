import React, { useEffect, useState } from "react";
import { Box, Button, Grid, ListItem, Stack, Typography } from "@mui/material";
import { Menu, useFetchMenus } from "@/models/Menu";

const Home = () => {
  const fetchedMenus = useFetchMenus();
  const [menus, setMenus] = useState<Menu[]>([]);

  useEffect(() => {
    setMenus(fetchedMenus); // Cập nhật state menus sau khi fetch dữ liệu thành công
  }, [fetchedMenus]);

  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [previousShowMenu, setPreviousShowMenu] = useState<boolean>(true);
  const [showMenuDetail, sethSowMenuDetail] = useState<boolean>(false);
  const [showTypeList, setShowTypeList] = useState(false);
  const [selectedMenuItems, setSelectedMenuItems] = useState<Menu[]>([]);
  const [selectedType, setSelectedType] = useState("All");
  const [cartItems, setCartItems] = useState<
    { id: string; quantity: number }[]
  >([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleTypeClick = () => {
    setShowTypeList(!showTypeList);
    setPreviousShowMenu((prevShowMenu) => !prevShowMenu);
    setShowMenu(!previousShowMenu);
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

  const typeMapping = {
    All: "Tất cả",
    Pickle: "Đồ chua - Bánh mì",
    Beverages: "Nước ngọt - Trà",
    Beef: "Bò nướng",
    Meat: "Heo - Gà - Hải sản",
    Soda: "Soda mùi",
    Vegetable: "Rau nướng",
    Hotpots: "Lẩu",
    Combo: "Combo Nướng & Lẩu",
    Sausace: "Sốt",
  };

  const getTypeName = (type: keyof typeof typeMapping) =>
    typeMapping[type] || type;

  const typeImage = {
    All: "https://i.ibb.co/0tF7fyd/all.jpg",
    Pickle: "https://i.ibb.co/0n30TwX/Pickle.jpg",
    Beef: "https://i.ibb.co/DLwJ2Mg/beef.jpg",
    Hotpots: "https://i.ibb.co/y8Ndcqs/hotpot.jpg",
    Sausace: "https://i.ibb.co/kSsJ3CJ/sausace.jpg",
    Beverages: "https://i.ibb.co/Dw8JDmM/Beverages.jpg",
    Soda: "https://i.ibb.co/mtSMfm2/soda.jpg",
    Combo: "https://i.ibb.co/jGFHGzj/combo.jpg",
    Meat: "https://i.ibb.co/8dH5kK4/meat.jpg",
    Vegetable: "https://i.ibb.co/xmcdkwk/vegetable.jpg",
  };

  const getTypeImage = (type: keyof typeof typeImage) =>
    typeImage[type] || type;

  const handleAddToCart = (menuId: string) => {
    const existingItemIndex = cartItems.findIndex((item) => item.id === menuId);
    if (existingItemIndex === -1) {
      // Nếu món chưa có trong giỏ hàng, thêm vào giỏ hàng với số lượng là 1
      console.log("Adding item with ID:", menuId);
      setCartItems((prevCartItems) => [
        ...prevCartItems,
        { id: menuId, quantity: 1 },
      ]);
      setSelectedItems((prevSelectedItems) => [...prevSelectedItems, menuId]);
    } else {
      // Nếu món đã có trong giỏ hàng, loại bỏ nó khỏi giỏ hàng
      console.log("Removing item with ID:", menuId);
      const updatedCartItems = cartItems.filter((item) => item.id !== menuId);
      setCartItems(updatedCartItems);
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.filter((id) => id !== menuId)
      );
    }
  };

  useEffect(() => {
    const totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    setCartTotal(totalItems);
  }, [cartItems]);

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
                fontSize: "22px",
              }}
            >
              THỰC ĐƠN
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            sx={{ borderRadius: 5, width: "200px" }}
            onClick={() => handleTypeClick()}
          >
            <Stack
              direction="row"
              display="flex"
              alignItems="center"
              gap="10px"
            >
              <Typography style={{ fontSize: "12px" }}>
                {/* {selectedType} */}
                {getTypeName(selectedType as keyof typeof typeMapping)}
              </Typography>
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
                              src={getTypeImage(
                                type as keyof typeof typeMapping
                              )}
                              sx={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                p: "5px 0px 5px 0px",
                                borderRadius: "16px",
                              }}
                            />
                            <Typography sx={{ fontWeight: 700 }}>
                              {getTypeName(type as keyof typeof typeMapping)}
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

                        <Typography
                          sx={{ fontWeight: 700, textAlign: "center" }}
                        >
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
          <Button sx={{ borderRadius: "100%" }} href="cart">
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
