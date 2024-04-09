import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";

export class Table {
  id: string;
  table_number: number;
  status: boolean;
  constructor(id: string, table_number: number, status: boolean) {
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
        const tablesList = tablesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return new Table(doc.id, data.table_number, data.status);
        });
        setTables(tablesList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  return tables;
}
