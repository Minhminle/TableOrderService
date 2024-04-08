import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";

export class Menu {
  id: string;
  name: string;
  price: number;
  path: string;
  type: string;
  constructor(
    id: string,
    name: string,
    price: number,
    path: string,
    type: string
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.path = path;
    this.type = type;
  }
}

export function useFetchMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const fetchData = async () => {
      try {
        const menuCollection = collection(db, "Menus");
        const menuSnapshot = await getDocs(menuCollection);
        const menuList = menuSnapshot.docs.map((doc) => {
          const data = doc.data();
          return new Menu(doc.id, data.name, data.price, data.path, data.type);
        });
        setMenus(menuList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  return menus;
}
