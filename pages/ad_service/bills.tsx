import { useEffect, useState } from "react";
import { Typography, Grid } from "@mui/material";
import { BillDetails, useFetchBillDetails } from "@/models/Bill";

const Bills = () => {
  const billDetailsList: BillDetails[] = useFetchBillDetails();

  console.log("Bill Details List:", billDetailsList); // Log dữ liệu billDetailsList để kiểm tra

  return (
    <>
      <Typography variant="h4" gutterBottom>
        All Bills
      </Typography>
      <Grid container spacing={3}>
        {billDetailsList.map((bill) => (
          <Grid item key={bill.id} xs={12}>
            <div style={{ border: "1px solid #ccc", padding: "10px" }}>
              <Typography variant="h6">Bill ID: {bill.id}</Typography>
              <Typography variant="body1">
                Date: {bill.date.toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                Total Price: {bill.totalPrice.toLocaleString("vi-VN")} VNĐ
              </Typography>
              <Typography variant="body1">Items:</Typography>
              <ul>
                {bill.items.map((item, index) => (
                  <li key={index}>
                    Menu ID: {item.menu_id} - Quantity: {item.quantity} - Price:{" "}
                    {item.bill_price.toLocaleString("vi-VN")} VNĐ
                  </li>
                ))}
              </ul>
            </div>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Bills;
