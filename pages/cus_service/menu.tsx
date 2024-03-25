import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  doc,
  getFirestore,
  DocumentReference,
} from "firebase/firestore";
import Image from "next/image";
import { collection, addDoc, getDocs, getDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import {
  Avatar,
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  colors,
} from "@mui/material";

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

  return (
    <>
      <Box sx={{ position: "relative" }}>
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
          >
            <Stack
              direction="row"
              display="flex"
              alignItems="center"
              gap="10px"
            >
              <Typography>All</Typography>
              <img
                width="15"
                height="15"
                src="https://img.icons8.com/ios-glyphs/30/expand-arrow--v1.png"
                alt="expand-arrow--v1"
                style={{ filter: "invert(100%)" }}
              />
            </Stack>
          </Button>
        </Stack>
        {/* Hientypelist */}
        <Box>
          <Stack>
            {Array.from(new Set(menus.map((menu) => menu.type))).map(
              (type, index) => (
                <Typography key={index}>{type}</Typography>
              )
            )}
          </Stack>
        </Box>
        {/* Hienmenu */}
        <Box sx={{ background: "#ECECEC", p: "0px 10px 16px 10px" }}>
          <Grid container spacing={2}>
            {menus.map((menu, index) => (
              <Grid item xs={6} key={index}>
                <ListItem
                  sx={{
                    justifyContent: "flex",
                    flexDirection: "column",
                    background: "white",
                    borderRadius: "16px",
                    height: "220px",
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
                      sx={{ maxWidth: "100px", maxHeight: "100px", pb: "10px" }}
                    />

                    <Typography sx={{ fontWeight: 700 }}>
                      {menu.name}
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>{menu.id}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {menu.price.toLocaleString("vi-VN")}VNĐ
                    </Typography>
                  </Stack>
                </ListItem>
              </Grid>
            ))}
          </Grid>
        </Box>
        {/* Nutmuahang */}
        <Box sx={{ position: "fixed", bottom: "30px", right: "15px" }}>
          <Button sx={{ borderRadius: "100%" }}>
            <img
              width="50"
              height="50"
              src="https://img.icons8.czom/fluency/48/shopping-cart.png"
              alt="shopping-cart"
            />
          </Button>
          z
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
            0
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Home;