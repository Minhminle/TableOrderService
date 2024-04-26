import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./Config";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import useSWR from 'swr';

export class Login {
  username: string;
  password: string;
  constructor(
    username: string,
    password: string,
  ) {
    this.username = username;
    this.password = password;
  }
}

export function useFetchLogin() {
  const fetcher = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const loginCollection = collection(db, 'Login');
    const loginSnapshot = await getDocs(loginCollection);
    const loginList = loginSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        username: data.username,
        password: data.password,
      };
    });
    return loginList;
  };

  const { data: logins, error } = useSWR('fetchLogins', fetcher);

  return {
    logins,
    isLoading: !error && !logins,
    isError: error
  };
}
