import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export class Table {
  table_number: number;
  status: string;
  constructor(table_number: number, status: string) {
    this.table_number = table_number;
    this.status = status;
  }
}

export function useFetchTables() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
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
    const db = getFirestore(app);

    const fetchData = async () => {
      try {
        const tablesCollection = collection(db, "Tables");
        const tablesSnapshot = await getDocs(tablesCollection);
        const tablesList = tablesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return new Table(data.table_number, data.status);
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
