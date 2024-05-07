import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { DateRange } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import {
  DateRange as DateRangeIcon,
  FilterAltOff as FilterAltOffIcon,
} from "@mui/icons-material";
import { useFetchBills } from "@/models/Bill";
import { BillDetails } from "@/models/Bill";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/models/Config";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const BillDisplay: React.FC = () => {
  const { bills, noDataMessage } = useFetchBills();
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [filteredBills, setFilteredBills] = useState<BillDetails[]>([]);
  const [filterMessage, setFilterMessage] = useState<string>("");
  const [displayedBills, setDisplayedBills] = useState<BillDetails[]>([]);

  const findTableById = async (tableId: string) => {
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const tableRef = doc(db, "Tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const tableName = tableDoc.data()?.name || "Bàn không xác định";
      return tableName;
    } catch (error) {
      console.error("Error fetching table name: ", error);
      return "Bàn không xác định";
    }
  };

  useEffect(() => {
    // Ban đầu, hiển thị tất cả các hóa đơn từ mới nhất đến cũ nhất
    setDisplayedBills([...bills].reverse());
  }, [bills]);

  const handleStartDateChange = (date: Date | null) => {
    setSelectedStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setSelectedEndDate(date);
  };

  const handleFilterButtonClick = () => {
    if (selectedStartDate && selectedEndDate) {
      // Kiểm tra nếu ngày bắt đầu lớn hơn ngày kết thúc
      if (selectedStartDate > selectedEndDate) {
        alert(
          "Thời gian không hợp lệ: Ngày bắt đầu phải nhỏ hơn ngày kết thúc"
        );
        return;
      }

      const filtered = bills.filter((bill) => {
        // Chuyển đổi chuỗi ngày trong bill.date thành đối tượng Date
        const billDate = new Date(bill.date);

        // Kiểm tra xem ngày trong bill có nằm trong khoảng từ start đến end không
        return billDate >= selectedStartDate && billDate <= selectedEndDate;
      });

      setFilteredBills(filtered);
      setFilterMessage(
        `Danh sách hóa đơn từ ngày ${selectedStartDate.toLocaleDateString()} đến ngày ${selectedEndDate.toLocaleDateString()}`
      );
      setDisplayedBills(filtered);
    } else {
      // Nếu không có ngày nào được chọn, hiển thị tất cả các hóa đơn
      setFilteredBills([]);
      setFilterMessage("");
      setDisplayedBills([...bills].reverse());
    }
  };

  const handleClearFilterButtonClick = () => {
    // Xóa bộ lọc và hiển thị lại tất cả các hóa đơn
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setFilteredBills([]);
    setFilterMessage("");
    setDisplayedBills([...bills].reverse());
  };

  const handleViewDetail = (bill: BillDetails) => {
    let detailMessage = `Date: ${bill.date.toLocaleString()}\n`;
    detailMessage += `Tổng tiền: ${bill.totalPrice}\n`;
    detailMessage += `Trạng thái: ${
      bill.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán"
    }\n`;
    detailMessage += "Chi tiết đơn hàng:\n";
    bill.items.forEach((item, index) => {
      detailMessage += `${index + 1}. ${item.quantity} x ${item.menu_name} - ${
        item.orderdetails_price
      }\n`;
    });
    const confirmResult = window.confirm(detailMessage);
    if (confirmResult) {
      // Thực hiện các hành động khi xác nhận
    } else {
      // Thực hiện các hành động khi hủy
    }
  };

  if (noDataMessage) {
    return <Typography>{noDataMessage}</Typography>;
  }

  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField
            id="startDate"
            label="Start Date"
            type="date"
            value={
              selectedStartDate
                ? selectedStartDate.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => handleStartDateChange(new Date(e.target.value))}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item>
          <TextField
            id="endDate"
            label="End Date"
            type="date"
            value={
              selectedEndDate ? selectedEndDate.toISOString().split("T")[0] : ""
            }
            onChange={(e) => handleEndDateChange(new Date(e.target.value))}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DateRangeIcon />}
            onClick={handleFilterButtonClick}
          >
            Lọc
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FilterAltOffIcon />}
            onClick={handleClearFilterButtonClick}
          >
            Hủy Lọc
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h4">{filterMessage}</Typography>
      <List>
        {displayedBills
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((bill: BillDetails) => (
            <ListItem key={bill.id}>
              <ListItemText
                primary={`${bill.date.toLocaleString()}`}
                secondary={`Tổng tiền: ${bill.totalPrice} VNĐ, Trạng thái: ${
                  bill.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán"
                }`}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewDetail(bill)}
              >
                Xem chi tiết
              </Button>
              {/* <List>
                {bill.items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${item.quantity} x ${item.menu_name} - ${item.orderdetails_price}`}
                    />
                  </ListItem>
                ))}
              </List> */}
            </ListItem>
          ))}
      </List>
    </>
  );
};

export default BillDisplay;
