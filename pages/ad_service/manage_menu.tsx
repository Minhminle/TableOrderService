import React, { useState } from "react";
import { useFetchMenus } from "@/models/Menu";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const ManageMenu = () => {
  const menus = useFetchMenus();
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuPath, setNewMenuPath] = useState("");
  const [newMenuType, setNewMenuType] = useState("");

  const firestore = getFirestore();

  const handleAddMenu = async () => {
    if (newMenuName && newMenuPrice && newMenuPath && newMenuType) {
      try {
        await addDoc(collection(firestore, "Menus"), {
          name: newMenuName,
          price: parseFloat(newMenuPrice),
          path: newMenuPath,
          type: newMenuType,
        });
        setNewMenuName("");
        setNewMenuPrice("");
        setNewMenuPath("");
        setNewMenuType("");
      } catch (error) {
        console.error("Error adding menu: ", error);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteDoc(doc(firestore, "Menus", menuId));
    } catch (error) {
      console.error("Error deleting menu: ", error);
    }
  };

  return (
    <div>
      <h1>Manage Menu</h1>
      <h2>Menu List</h2>
      <ul>
        {menus.map((menu) => (
          <li key={menu.id}>
            {menu.name} - ${menu.price} - {menu.type}{" "}
            <button onClick={() => handleDeleteMenu(menu.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2>Add New Menu</h2>
      <input
        type="text"
        placeholder="Name"
        value={newMenuName}
        onChange={(e) => setNewMenuName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Price"
        value={newMenuPrice}
        onChange={(e) => setNewMenuPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Path"
        value={newMenuPath}
        onChange={(e) => setNewMenuPath(e.target.value)}
      />
      <input
        type="text"
        placeholder="Type"
        value={newMenuType}
        onChange={(e) => setNewMenuType(e.target.value)}
      />
      <button onClick={handleAddMenu}>Add Menu</button>
    </div>
  );
};

export default ManageMenu;
