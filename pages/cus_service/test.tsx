import { Box } from "@mui/material";
import React from "react";
import { Table, useFetchTables } from "@/models/Tables";

const Test = () => {
  const tables = useFetchTables(); // Sử dụng hook để lấy danh sách bàn

  return (
    <Box>
      <h2>List of Table IDs:</h2>
      <ul>
        {tables.map((table: Table) => (
          <li key={table.id}>
            {/* Tạo link tới cus_service/menu/:tableId */}
            <a href={`/cus_service/menu/?tableId=${table.table_number}`}>
              Table ID: {table.table_number}
            </a>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default Test;
