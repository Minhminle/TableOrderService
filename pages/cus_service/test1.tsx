import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";
import { Button, Grid } from "@mui/material";
import { useFetchTables } from "@/models/Tables";

const Test1 = () => {
  const tables = useFetchTables();
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    // Nếu cần làm gì đó với firestore ở đây, ví dụ fetch data
    return () => {
      // Cleanup code (nếu cần thiết)
    };
  }, []); // Dependency array rỗng để chỉ chạy một lần khi component mount

  const handleTableClick = (tableId: string) => {
    setSelectedTableId(tableId);
  };

  return (
    <>
      <Grid container spacing={2}>
        {tables
          .sort((a, b) => a.table_number - b.table_number)
          .map((table) => (
            <Grid item xs={4} key={table.id}>
              <Button
                variant="contained"
                sx={{
                  height: "100px",
                  width: "200px",
                  background: table.status ? "" : "white",
                  color: table.status ? "white" : "black",
                }}
                onClick={() => handleTableClick(table.id)}
              >
                {`Bàn số ${table.table_number}`}
              </Button>
            </Grid>
          ))}
      </Grid>
    </>
  );
};

export default Test1;
