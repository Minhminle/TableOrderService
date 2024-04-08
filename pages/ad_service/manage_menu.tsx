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
  updateDoc,
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getStorage } from "firebase/storage";
import { confirmAlert } from "react-confirm-alert"; // Import thư viện react-confirm-alert
import "react-confirm-alert/src/react-confirm-alert.css"; // Import CSS cho react-confirm-alert

const ManageMenu = () => {
  const fetchedMenus = useFetchMenus();
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuImage, setNewMenuImage] = useState<File | null>(null); // State để lưu trữ hình ảnh
  const [newMenuType, setNewMenuType] = useState("");
  const [menuTypes, setMenuTypes] = useState<string[]>([]); // State để lưu trữ danh sách thể loại
  const [editMenu, setEditMenu] = useState<Menu | null>(null); // State để lưu trữ thông tin món đang được chỉnh sửa

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
      const storageRef = ref(storage, "menuImages/${fileName}");
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
  const handleDeleteMenu = async (
    menuId: string,
    menuName: string,
    imagePath: string
  ) => {
    try {
      // Hiển thị bảng xác nhận trước khi xóa
      confirmAlert({
        title: "Xác nhận xóa menu",
        message: "Bạn có muốn xóa ${menuName} khỏi thực đơn hay không?",
        buttons: [
          {
            label: "Có",
            onClick: async () => {
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
              setMenus((prevMenus) =>
                prevMenus.filter((menu) => menu.id !== menuId)
              );

              // Xóa hình ảnh khỏi Firebase Storage
              const storage = getStorage(app);
              const imageRef = ref(storage, imagePath);
              await deleteObject(imageRef);
            },
          },
          {
            label: "Không",
            onClick: () => {}, // Không làm gì khi nhấn nút "Không"
          },
        ],
      });
    } catch (error) {
      console.error("Error deleting menu: ", error);
      // Hiển thị alert thất bại
      alert("Delete menu failed. Please try again later.");
    }
  };

  const handleEditMenu = (menu: Menu) => {
    setEditMenu(menu); // Cập nhật state với thông tin của món đang được chỉnh sửa
  };

  const handleSaveMenu = async () => {
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

      if (!editMenu) {
        return; // Nếu editMenu là null thì không thực hiện các xử lý tiếp theo
      }

      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const storage = getStorage(app);

      // Nếu người dùng đã chọn một hình ảnh mới
      if (newMenuImage) {
        // Tải hình ảnh mới lên Firebase Storage
        const fileName = newMenuImage.name;
        const storageRef = ref(storage, "menuImages/${fileName}");
        await uploadBytes(storageRef, newMenuImage);

        // Lấy đường dẫn mới của hình ảnh
        const imageURL = await getDownloadURL(storageRef);

        // Xóa hình ảnh cũ từ Firebase Storage
        if (editMenu.path) {
          const oldImageRef = ref(storage, editMenu.path);
          await deleteObject(oldImageRef);
        }

        // Cập nhật đường dẫn mới của hình ảnh vào menu
        editMenu.path = imageURL;
      }

      // Thực hiện cập nhật dữ liệu vào cơ sở dữ liệu
      await updateDoc(doc(firestore, "Menus", editMenu.id), {
        name: editMenu.name,
        price: editMenu.price,
        path: editMenu.path,
        type: editMenu.type,
      });

      // Cập nhật lại danh sách menu sau khi cập nhật thành công
      setMenus((prevMenus) =>
        prevMenus.map((menu) =>
          menu.id === editMenu.id ? { ...menu, ...editMenu } : menu
        )
      );

      // Đặt editMenu về null để ẩn vùng hiển thị thông tin của món
      setEditMenu(null);

      // Hiển thị thông báo lưu thành công
      alert("Menu saved successfully!");
    } catch (error) {
      console.error("Error saving menu: ", error);
      alert("Save menu failed. Please try again later.");
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

      {editMenu && (
        <Grid container direction="column" alignItems="center">
          <Box>
            <Typography>Tên món</Typography>
            <TextField
              value={editMenu.name}
              onChange={(e) =>
                setEditMenu({ ...editMenu, name: e.target.value })
              }
              variant="outlined"
            />
          </Box>
          <Box>
            <Typography>Giá</Typography>
            <TextField
              value={editMenu.price.toString()}
              onChange={(e) => {
                const value = e.target.value.trim(); // Loại bỏ các khoảng trắng từ đầu và cuối chuỗi
                const price = value === "" ? 0 : parseFloat(value); // Chuyển đổi thành số, nếu chuỗi rỗng thì gán giá trị 0
                setEditMenu({ ...editMenu, price });
              }}
              variant="outlined"
            />
          </Box>
          <Box>
            {/* Hiển thị hình ảnh */}
            <img
              src={editMenu.path}
              alt={editMenu.name}
              style={{ maxWidth: "120px", height: "120px" }}
            />
          </Box>
          <Box>
            <Typography>Chọn Hình ảnh mới</Typography>
            <input type="file" onChange={handleImageChange} />
          </Box>
          <Box>
            <Typography>Chọn Thể loại</Typography>
            <select
              value={editMenu.type}
              onChange={(e) =>
                setEditMenu({ ...editMenu, type: e.target.value })
              }
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
      )}

      <Box>
        <Button variant="contained" color="primary" onClick={handleSaveMenu}>
          Save
        </Button>
      </Box>

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
                        <IconButton onClick={() => handleEditMenu(menu)}>
                          <EditIcon />
                        </IconButton>

                        {/* Thêm nút delete */}
                        <IconButton
                          onClick={() =>
                            handleDeleteMenu(menu.id, menu.name, menu.path)
                          }
                        >
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
