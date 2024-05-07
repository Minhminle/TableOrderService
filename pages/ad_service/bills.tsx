import React, { useEffect, useState } from "react";
import { initializeApp, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";
import { BillDetails, BillItem } from "@/models/Bill";
import { parse, isAfter, isBefore } from "date-fns";

function FirebaseDataComponent() {
  let app;
  try {
    app = getApp();
  } catch (error) {
    app = initializeApp(firebaseConfig);
  }

  const db = getFirestore(app);
  const [bills, setBills] = useState<BillDetails[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [noDataMessage, setNoDataMessage] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const billDetailsCollection = collection(db, "Bills");
        let querySnapshot;

        if (startDate && endDate) {
          querySnapshot = await getDocs(
            query(
              billDetailsCollection,
              where("date", ">=", startDate.toISOString()),
              where("date", "<=", endDate.toISOString())
            )
          );
        } else {
          querySnapshot = await getDocs(billDetailsCollection);
        }

        const billsData: BillDetails[] = [];

        querySnapshot.forEach((doc) => {
          const billData = doc.data();
          const { id, items, date, paymentStatus, totalPrice } = billData;

          const billItems: BillItem[] = items.map((item: any) => {
            return new BillItem(
              item.menu_id,
              item.bill_price,
              item.quantity,
              item.note,
              item.itemstatus
            );
          });

          // Parse date string to Date object using date-fns
          const parsedDate = parse(date, "d/M/yyyy H:m:s", new Date());

          // Check if the parsed date falls within the selected range
          if (
            (startDate && isAfter(parsedDate, startDate)) ||
            (!startDate &&
              ((endDate && isBefore(parsedDate, endDate)) || !endDate))
          ) {
            const billDetails = new BillDetails(
              id,
              billItems,
              parsedDate,
              paymentStatus,
              totalPrice
            );
            billsData.push(billDetails);
          }
        });

        if (billsData.length === 0) {
          setNoDataMessage("No bills found for the selected date range.");
        } else {
          setNoDataMessage("");
        }

        setBills(billsData);
      } catch (error) {
        console.error("Error fetching bills: ", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(e.target.value));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(new Date(e.target.value));
  };

  return (
    <div>
      <h2>Bill Details</h2>
      <div>
        <label htmlFor="startDateInput">Start Date:</label>
        <input
          type="date"
          id="startDateInput"
          value={startDate ? startDate.toISOString().split("T")[0] : ""}
          onChange={handleStartDateChange}
        />
        <label htmlFor="endDateInput">End Date:</label>
        <input
          type="date"
          id="endDateInput"
          value={endDate ? endDate.toISOString().split("T")[0] : ""}
          onChange={handleEndDateChange}
        />
      </div>
      {noDataMessage && <p>{noDataMessage}</p>}
      <ul>
        {bills.map((bill) => (
          <li key={bill.id}>
            <p>Date: {bill.date.toLocaleDateString()}</p>
            <p>Total Price: {bill.totalPrice}</p>
            <p>Payment Status: {bill.paymentStatus ? "Paid" : "Not Paid"}</p>
            <ul>
              {bill.items.map((item, index) => (
                <li key={index}>
                  {item.quantity} x {item.menu_id} - {item.bill_price}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FirebaseDataComponent;
