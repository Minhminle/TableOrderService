import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "@/models/Config";

export class BillItem {
  menu_id: string;
  bill_price: number;
  quantity: number;
  note: string;
  itemstatus: boolean;

  constructor(
    menu_id: string,
    bill_price: number,
    quantity: number,
    note: string = "",
    itemstatus: boolean = true
  ) {
    this.menu_id = menu_id;
    this.bill_price = bill_price;
    this.quantity = quantity;
    this.note = note;
    this.itemstatus = itemstatus;
  }
}

export class BillDetails {
  id: string;
  items: BillItem[];
  date: Date;
  paymentStatus: boolean;
  totalPrice: number;

  constructor(
    id: string,
    items: BillItem[],
    date: Date,
    paymentStatus: boolean,
    totalPrice: number
  ) {
    this.id = id;
    this.items = items;
    this.date = date;
    this.paymentStatus = paymentStatus;
    this.totalPrice = totalPrice;
  }
}
