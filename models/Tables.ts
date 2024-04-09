import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";
import { OrderDetails } from "@/models/OrderDetails";

export class Table {
  id: string;
  table_number: number;
  status: boolean;

  constructor(id: string, table_number: number, status: boolean = false) {
    this.id = id;
    this.table_number = table_number;
    this.status = status;
  }
}

export function useFetchTables() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const fetchData = async () => {
      try {
        const tablesCollection = collection(db, "Tables");
        const tablesSnapshot = await getDocs(tablesCollection);
        const tablesList: Table[] = [];

        for (const doc of tablesSnapshot.docs) {
          const data = doc.data();
          const table = new Table(doc.id, data.table_number, data.status);
          tablesList.push(table);
        }

        // Fetch OrderDetails for each table and update table status
        for (const table of tablesList) {
          const orderDetails = await fetchOrderDetailsForTable(db, table.id);
          const hasUnpaidOrder = orderDetails.some(
            (orderDetail) => !orderDetail.paymentStatus
          );
          await updateTableStatus(db, table.id, hasUnpaidOrder);
          table.status = hasUnpaidOrder;
        }

        setTables(tablesList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return tables;
}

async function fetchOrderDetailsForTable(
  db: any,
  tableId: string
): Promise<OrderDetails[]> {
  const orderDetailsCollection = collection(db, "OrderDetails");
  const q = query(orderDetailsCollection, where("tableId", "==", tableId));
  const querySnapshot = await getDocs(q);
  const orderDetailsList: OrderDetails[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const orderDetails = new OrderDetails(
      data.items,
      data.orderDate,
      data.orderTime,
      data.paymentStatus,
      data.totalPrice
    );
    orderDetailsList.push(orderDetails);
  });

  return orderDetailsList;
}

async function updateTableStatus(db: any, tableId: string, status: boolean) {
  const tableRef = doc(db, "Tables", tableId);
  await updateDoc(tableRef, {
    status: status,
  });
}
