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
import {
  OrderItem,
  OrderDetails,
  useFetchOrderDetails,
} from "@/models/OrderDetails";
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
  const [selectedTableId, setSelectedTableId] = useState<string>(""); // Đặt giá trị mặc định là chuỗi rỗng
  const orderDetails = useFetchOrderDetails(selectedTableId);

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

  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
  };

  const findMenuById = (menuId: string) => {
    return menus.find((menu) => menu.id === menuId);
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
  const sortedTables = [...tables].sort(
    (a, b) => a.table_number - b.table_number
  );
  const gridItemStyle = {
    width: "20%", // 20% cho mỗi cột để hiển thị 5 cột trên mỗi hàng
  };
  return (
    <>
      <TabContext value={value.toString()}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Hiển thị các Tab đã được sắp xếp theo số bàn tăng dần */}
          <Grid container spacing={2} justifyContent="center">
            {/* Sử dụng một vòng lặp để tạo các mục Grid */}
            {sortedTables.map((table, index) => (
              <Grid key={table.id} item style={gridItemStyle}>
                {/* Mỗi Grid item chứa một Button */}
                <Button
                  value={table.id}
                  onClick={() => handleTableClick(table.id)}
                  sx={{
                    background: table.status ? "blue" : "white",
                    color: table.status ? "white" : "black",
                    width: "100%", // Đảm bảo nút Button chiếm toàn bộ chiều rộng của Grid item
                  }}
                >
                  {`Bàn số ${table.table_number}`}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid item xs={5}>
          <Typography
            fontSize={"30px"}
            fontWeight={"bolder"}
            textAlign={"center"}
          >
            Sản Phẩm
          </Typography>
          {/* Phần orderDetails */}
          <Box
            sx={{
              padding: 2,
              background: "#fff",
              maxHeight: "400px", // Giữ phần orderDetails cách phần tổng tiền và các nút
              overflowY: "auto",
              textAlign: "center", // Tạo thanh cuộn khi nội dung vượt quá kích thước
            }}
          >
            {/* Phần orderDetails */}
            <Grid item xs={12}>
              {/* Render order details based on selectedTableId */}
              {orderDetails.map((orderDetail, orderIndex) => (
                <div key={orderIndex}>
                  {/* Lặp qua từng mục trong orderDetail.items */}
                  {orderDetail.items.map((item, index) => (
                    <div key={index}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          {/* Tên và thông tin khác về menu */}
                          <Typography variant="subtitle1">
                            {findMenuById(item.menu_id)?.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="subtitle1">
                            {item.quantity}
                          </Typography>
                        </Grid>
                      </Grid>
                    </div>
                  ))}
                </div>
              ))}
            </Grid>
          </Box>
          {/* Phần tổng tiền và các nút */}
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              padding: 2,
              background: "#fff",
              marginTop: 2, // Tạo khoảng cách giữa phần orderDetails và phần tổng tiền và các nút
              width: "100%",
              textAlign: "center",
            }}
          ></Box>
        </Grid>
      </TabContext>
    </>
  );
};

export default ManageTable;
