import React, { useEffect, useState } from "react";
import { Menu, useFetchMenus } from "@/models/Menu";
import { initializeApp } from "firebase/app";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Box,
  Button,
  Grid,
  ListItem,
  Stack,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage } from "firebase/storage";

const ManageMenu = () => {
  const fetchedMenus = useFetchMenus();
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuImage, setNewMenuImage] = useState<File | null>(null); // State để lưu trữ hình ảnh
  const [newMenuType, setNewMenuType] = useState("");
  const [menuTypes, setMenuTypes] = useState<string[]>([]); // State để lưu trữ danh sách thể loại

  useEffect(() => {
    setMenus(fetchedMenus);
    // Lấy danh sách các thể loại từ danh sách món ăn
    const types = fetchedMenus.map((menu) => menu.type);
    // Loại bỏ các thể loại trùng lặp và cập nhật state
    setMenuTypes(Array.from(new Set(types)));
  }, [fetchedMenus]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lấy file hình ảnh từ sự kiện onChange
    const file = e.target.files?.[0];
    if (file) {
      setNewMenuImage(file);
    }
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

  const handleAddMenu = async () => {
    try {
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
      const firestore = getFirestore(app);

      // Lấy tham chiếu đến dịch vụ lưu trữ Firebase
      const storage = getStorage(app);

      // Kiểm tra xem newMenuImage có giá trị không
      if (!newMenuImage) {
        throw new Error("No image selected");
      }

      // Lấy tên file hình ảnh từ state
      const fileName = newMenuImage.name;
      const storageRef = ref(storage, `menuImages/${fileName}`);
      await uploadBytes(storageRef, newMenuImage);

      // Lấy đường dẫn của hình ảnh đã tải lên
      const imageURL = await getDownloadURL(storageRef);

      // Tạo một đối tượng menu mới từ thông tin nhập vào, bao gồm đường dẫn hình ảnh
      const newMenu = new Menu(
        "", // ID sẽ được tạo tự động
        newMenuName,
        parseFloat(newMenuPrice),
        imageURL,
        newMenuType
      );

      // Thêm menu mới vào Firestore
      const docRef = await addDoc(collection(firestore, "Menus"), {
        name: newMenu.name,
        price: newMenu.price,
        path: newMenu.path,
        type: newMenu.type,
      });

      // Cập nhật danh sách menu sau khi thêm thành công
      setMenus((prevMenus) => [...prevMenus, newMenu]);

      // Reset các trường input về giá trị mặc định sau khi thêm menu thành công
      setNewMenuName("");
      setNewMenuPrice("");
      setNewMenuImage(null);
      setNewMenuType("");

      alert("Upload to Firebase successful!");
    } catch (error) {
      console.error("Error adding menu: ", error);
      // Hiển thị alert thất bại
      alert("Upload to Firebase failed. Please try again later.");
    }
  };

  // Hàm xử lý cho nút delete
  const handleDeleteMenu = async (menuId: string) => {
    try {
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
      const firestore = getFirestore(app);

      // Xóa menu khỏi Firestore dựa trên menuId
      await deleteDoc(doc(firestore, "Menus", menuId));

      // Cập nhật danh sách menu sau khi xóa thành công
      setMenus((prevMenus) => prevMenus.filter((menu) => menu.id !== menuId));

      // Hiển thị alert thành công
      alert("Delete menu successful!");
    } catch (error) {
      console.error("Error deleting menu: ", error);
      // Hiển thị alert thất bại
      alert("Delete menu failed. Please try again later.");
    }
  };

  return (
    <>
      <Grid container direction="column" alignItems="center">
        <Box>
          <Typography>Tên món</Typography>
          <TextField
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            variant="outlined"
          />
        </Box>
        <Box>
          <Typography>Giá</Typography>
          <TextField
            value={newMenuPrice}
            onChange={(e) => setNewMenuPrice(e.target.value)}
            variant="outlined"
          />
        </Box>
        <Box>
          <Typography>Chọn Hình ảnh</Typography>
          <input type="file" onChange={handleImageChange} />
        </Box>
        <Box>
          <Typography>Chọn Thể loại</Typography>
          <select
            value={newMenuType}
            onChange={(e) => setNewMenuType(e.target.value)}
          >
            <option value="">Chọn thể loại</option>
            {menuTypes.map((type, index) => (
              <option key={index} value={type}>
                {getTypeName(type as keyof typeof typeMapping)}
              </option>
            ))}
          </select>
        </Box>
      </Grid>
      {/* Nút thêm mới */}
      <Button variant="outlined" onClick={handleAddMenu}>
        Thêm Mới
      </Button>
      <Grid>
        {showMenu && (
          <Box sx={{ p: "16px 10px 16px 10px" }}>
            <Grid container spacing={2}>
              {menus
                .filter((menu) => menu.price !== 0)
                .sort((a, b) => b.price - a.price)
                .map((menu, index) => (
                  <Grid item xs={6} key={index}>
                    <ListItem
                      sx={{
                        justifyContent: "flex",
                        flexDirection: "column",
                        background: "white",
                        borderRadius: "16px",
                        height: "260px",
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
                        {/* Thêm nút edit */}
                        <IconButton>
                          <EditIcon />
                        </IconButton>

                        {/* Thêm nút delete */}
                        <IconButton onClick={() => handleDeleteMenu(menu.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </ListItem>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Grid>
    </>
  );
};

export default ManageMenu;
