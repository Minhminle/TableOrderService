import React, { useEffect, useState } from "react";
import { useFetchTables, Table } from "@/models/Tables";
import { firebaseConfig } from "@/models/Config";
import { initializeApp } from "firebase/app";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  ListItem,
  MenuItem,
  Select,
  Stack,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import AddIcon from "@mui/icons-material/Add";
import { Menu, useFetchMenus } from "@/models/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getStorage } from "firebase/storage";
import { confirmAlert } from "react-confirm-alert"; // Import thư viện react-confirm-alert
import "react-confirm-alert/src/react-confirm-alert.css";

const ManageTable = () => {
  const tables = useFetchTables();
  const fetchedMenus = useFetchMenus();
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  const [value, setValue] = React.useState<number | number[]>(1);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuImage, setNewMenuImage] = useState<File | null>(null); // State để lưu trữ hình ảnh
  const [newMenuType, setNewMenuType] = useState("");
  const [menuTypes, setMenuTypes] = useState<string[]>([]); // State để lưu trữ danh sách thể loại // State để lưu trữ thông tin món đang được chỉnh sửa
  const [editMenu, setEditMenu] = useState<Menu | null>(null); // State để lưu trữ thông tin món đang được chỉnh sửa

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

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[]
  ) => {
    setValue(newValue);
  };

  // Sử dụng hook useFetchMenus trực tiếp trong component
  const menusFromAPI = useFetchMenus();

  useEffect(() => {
    setMenus(fetchedMenus);
    // Lấy danh sách các thể loại từ danh sách món ăn
    const types = fetchedMenus.map((menu) => menu.type);
    // Loại bỏ các thể loại trùng lặp và cập nhật state
    setMenuTypes(Array.from(new Set(types)));
  }, [fetchedMenus]);

  useEffect(() => {
    // Lắng nghe thay đổi của biến menusFromAPI
    // và cập nhật biến menus và showMenu khi dữ liệu đã được lấy thành công
    if (menusFromAPI.length > 0) {
      setMenus(menusFromAPI);
      setShowMenu(true);
    }
  }, [menusFromAPI]);

  // Biến trạng thái để theo dõi hiển thị phần thêm mới
  const [addingNew, setAddingNew] = useState(false);

  // Hàm xử lý khi nhấn nút AddIcon
  const handleAddNew = () => {
    setAddingNew(true); // Hiển thị phần thêm mới
    setSelectedMenu(null); // Đặt selectedMenu về null để các trường còn lại trống
  };

  const handleAddMenu = async () => {
    try {
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

  const handleDeleteMenu = async (
    menuId: string,
    menuName: string,
    imagePath: string
  ) => {
    try {
      // Hiển thị bảng xác nhận trước khi xóa
      confirmAlert({
        title: "Xác nhận xóa menu",
        message: `Bạn có muốn xóa ${menuName} khỏi thực đơn hay không?`,
        buttons: [
          {
            label: "Có",
            onClick: async () => {
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
              setSelectedMenu(null);
            },
          },
          {
            label: "Không",
            onClick: () => {
              setSelectedMenu(null);
            }, // Không làm gì khi nhấn nút "Không"
          },
        ],
      });
    } catch (error) {
      console.error("Error deleting menu: ", error);
      // Hiển thị alert thất bại
      alert("Delete menu failed. Please try again later.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lấy file hình ảnh từ sự kiện onChange
    const file = e.target.files?.[0];
    if (file) {
      setNewMenuImage(file);
    }
  };

  const handleSaveMenu = async () => {
    try {
      if (!selectedMenu) {
        return; // Nếu editMenu là null thì không thực hiện các xử lý tiếp theo
      }
      const storage = getStorage(app);

      // Nếu người dùng đã chọn một hình ảnh mới
      if (newMenuImage) {
        // Tải hình ảnh mới lên Firebase Storage
        const fileName = newMenuImage.name;
        const storageRef = ref(storage, `menuImages/${fileName}`);
        await uploadBytes(storageRef, newMenuImage);

        // Lấy đường dẫn mới của hình ảnh
        const imageURL = await getDownloadURL(storageRef);

        // Xóa hình ảnh cũ từ Firebase Storage
        if (selectedMenu.path) {
          const oldImageRef = ref(storage, selectedMenu.path);
          await deleteObject(oldImageRef);
        }

        // Cập nhật đường dẫn mới của hình ảnh vào menu
        selectedMenu.path = imageURL;
      }

      // Thực hiện cập nhật dữ liệu vào cơ sở dữ liệu
      await updateDoc(doc(firestore, "Menus", selectedMenu.id), {
        name: selectedMenu.name,
        price: selectedMenu.price,
        path: selectedMenu.path,
        type: selectedMenu.type,
      });

      // Cập nhật lại danh sách menu sau khi cập nhật thành công
      setMenus((prevMenus) =>
        prevMenus.map((menu) =>
          menu.id === selectedMenu.id ? { ...menu, ...selectedMenu } : menu
        )
      );

      // Đặt editMenu về null để ẩn vùng hiển thị thông tin của món
      setSelectedMenu(null);
      setNewMenuImage(null);

      // Hiển thị thông báo lưu thành công
      alert("Menu saved successfully!");
    } catch (error) {
      console.error("Error saving menu: ", error);
      alert("Save menu failed. Please try again later.");
    }
  };

  return (
    <>
      <TabContext value={value.toString()}>
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={value.toString()}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                sx={{
                  "& .MuiTab-root": {
                    color: "#9e9e9e", // Màu chữ khi không được chọn
                  },
                  "& .Mui-selected": {
                    color: "white", // Màu chữ khi được chọn
                  },
                }}
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab label={`Danh Sách Bàn`} value="1" />
                <Tab label={`Danh Sách Menu`} value="2" />
              </TabList>
            </Box>
          </TabContext>
        </Box>
        <TabPanel value="1">
          <Grid container spacing={2}>
            {/* Grid item cho danh sách bàn */}
            <Grid item xs={7}>
              <Grid container spacing={2}>
                {tables
                  .sort((a, b) => a.table_number - b.table_number)
                  .map((table: Table) => (
                    <Grid item xs={4} key={table.table_number}>
                      <Button
                        variant="contained"
                        sx={{
                          height: "100px",
                          width: "200px",
                          background: table.status ? "" : "white",
                          color: table.status ? "white" : "black",
                        }}
                      >
                        {`Bàn số ${table.table_number}`}
                      </Button>
                    </Grid>
                  ))}
              </Grid>
            </Grid>
            <Grid item xs={5}>
              <Box
                sx={{
                  position: "fixed",
                  bottom: 0,
                  padding: 2,
                  background: "#fff",
                }}
              >
                <Stack direction="column" spacing={2}>
                  <Stack direction="row" spacing={3}>
                    <Stack direction="row" spacing={2}></Stack>
                    <Typography>Tổng tiền:</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      style={{
                        height: "50px",
                        width: "150px",
                        color: "white",
                        backgroundColor: "gray",
                      }}
                    >
                      Tạm Tính
                    </Button>
                    <Button
                      variant="contained"
                      style={{
                        height: "50px",
                        width: "150px",
                        color: "white",
                        backgroundColor: "green",
                      }}
                    >
                      Thanh Toán
                    </Button>
                    <Button
                      variant="contained"
                      style={{
                        height: "50px",
                        width: "150px",
                        background: "#ffffff",
                        color: "gray",
                      }}
                    >
                      Thông Báo
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value="2">
          <Stack direction={"row"}>
            <Box>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                sx={{ width: "100px" }}
                onClick={handleAddNew} // Gọi hàm xử lý khi nhấn nút AddIcon
              >
                Thêm
              </Button>
              <Box
                sx={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  marginTop: "20px",
                }}
              >
                {showMenu && (
                  <Box sx={{ p: "16px 10px 16px 10px" }}>
                    {menus
                      .filter((menu) => menu.price !== 0)
                      .sort((a, b) => b.price - a.price)
                      .map((menu, index) => (
                        <Grid item key={index}>
                          <ListItem onClick={() => setSelectedMenu(menu)}>
                            <Grid container spacing={2}>
                              {/* Phần hình ảnh */}
                              <Grid item xs={3}>
                                <Box
                                  component="img"
                                  alt={menu.name}
                                  src={menu.path}
                                  sx={{
                                    maxWidth: "120px",
                                    maxHeight: "120px",
                                    borderRadius: "16px",
                                  }}
                                />
                              </Grid>
                              {/* Phần name và price */}
                              <Grid item xs={6}>
                                <Stack direction="column">
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {menu.name}
                                  </Typography>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {menu.price.toLocaleString("vi-VN")}VNĐ
                                  </Typography>
                                </Stack>
                              </Grid>
                              {/* Phần button Delete */}
                              <Grid item xs={3}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                >
                                  <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    sx={{ width: "100px" }}
                                    onClick={() =>
                                      handleDeleteMenu(
                                        menu.id,
                                        menu.name,
                                        menu.path
                                      )
                                    }
                                  >
                                    Xóa
                                  </Button>
                                </Stack>
                              </Grid>
                            </Grid>
                          </ListItem>
                        </Grid>
                      ))}
                  </Box>
                )}
              </Box>
            </Box>
            <Box sx={{ position: "sticky", top: 0 }}>
              <Stack direction="column" spacing={2} alignItems="center">
                {/* Phần thêm mới */}
                {addingNew && !selectedMenu && (
                  <Box sx={{ p: "16px 10px 16px 10px" }}>
                    <Stack spacing={3}>
                      <Box
                        component="img"
                        alt="Default"
                        src="https://thaibinhtv.vn/assets/images/imgstd.jpg"
                        sx={{
                          width: "200px",
                          height: "200px",
                          pb: "10px",
                          borderRadius: "16px",
                          margin: "0 auto",
                        }}
                      />
                      {/* Phần tải ảnh lên */}
                      <input type="file" onChange={handleImageChange} />
                    </Stack>
                    <TextField
                      id="menu-name"
                      label="Tên món"
                      value={newMenuName}
                      onChange={(e) => setNewMenuName(e.target.value)}
                      variant="outlined"
                      fullWidth
                      sx={{ marginBottom: 2, marginTop: "10px" }}
                    />
                    <TextField
                      id="menu-price"
                      label="Giá"
                      value={newMenuPrice}
                      onChange={(e) => setNewMenuPrice(e.target.value)}
                      variant="outlined"
                      fullWidth
                      sx={{ marginBottom: 2 }}
                    />
                    <FormControl
                      fullWidth
                      variant="outlined"
                      sx={{ marginBottom: 2 }}
                    >
                      <InputLabel id="menu-type-label">Loại món</InputLabel>
                      <Select
                        labelId="menu-type-label"
                        id="menu-type"
                        value={newMenuType}
                        label="Loại món"
                        sx={{ textAlign: "left" }}
                        onChange={(e) => setNewMenuType(e.target.value)}
                      >
                        {menuTypes
                          .filter((type) =>
                            menus.some(
                              (menu) => menu.type === type && menu.price > 0
                            )
                          )
                          .map((type) => (
                            <MenuItem key={type} value={type}>
                              {getTypeName(type as keyof typeof typeMapping)}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Box>
                      <Stack direction={"row"} spacing={10}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleAddMenu}
                        >
                          Thêm Mới
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                )}
                {selectedMenu && (
                  <Box sx={{ p: "16px 10px 16px 10px", textAlign: "center" }}>
                    <Box
                      component="img"
                      alt={selectedMenu.name}
                      src={selectedMenu.path}
                      sx={{
                        width: "200px",
                        height: "200px",
                        pb: "10px",
                        borderRadius: "16px",
                        margin: "0 auto", // Để căn giữa hình ảnh
                      }}
                    />
                    <Box>
                      <Typography>Chọn Hình ảnh mới</Typography>
                      <input type="file" onChange={handleImageChange} />
                    </Box>
                    <TextField
                      id="menu-name"
                      label="Tên món"
                      value={selectedMenu.name}
                      onChange={(e) =>
                        setSelectedMenu({
                          ...selectedMenu,
                          name: e.target.value,
                        })
                      }
                      variant="outlined"
                      fullWidth
                      sx={{ marginBottom: 2 }}
                    />
                    <TextField
                      id="menu-price"
                      label="Giá"
                      value={selectedMenu.price.toString()}
                      onChange={(e) => {
                        const value = e.target.value.trim(); // Loại bỏ các khoảng trắng từ đầu và cuối chuỗi
                        const price = value === "" ? 0 : parseFloat(value); // Chuyển đổi thành số, nếu chuỗi rỗng thì gán giá trị 0
                        setSelectedMenu({ ...selectedMenu, price });
                      }}
                      variant="outlined"
                      fullWidth
                      sx={{ marginBottom: 2 }}
                    />
                    <FormControl
                      fullWidth
                      variant="outlined"
                      sx={{ marginBottom: 2 }}
                    >
                      <InputLabel id="menu-type-label">Thể loại</InputLabel>

                      <Select
                        labelId="menu-type-label"
                        id="menu-type"
                        value={selectedMenu ? selectedMenu.type : ""}
                        label="Loại món"
                        sx={{ textAlign: "left" }}
                        onChange={(event) =>
                          setSelectedMenu(
                            selectedMenu
                              ? {
                                  ...selectedMenu,
                                  type: event.target.value as string,
                                }
                              : null
                          )
                        }
                      >
                        {menuTypes
                          .filter((type) =>
                            menus.some(
                              (menu) => menu.type === type && menu.price > 0
                            )
                          )
                          .map((type) => (
                            <MenuItem key={type} value={type}>
                              {getTypeName(type as keyof typeof typeMapping)}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Box>
                      <Stack direction={"row"} spacing={10}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSaveMenu}
                        >
                          Lưu
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </TabPanel>
      </TabContext>
    </>
  );
};

export default ManageTable;
