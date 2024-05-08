import { useEffect } from "react";
import { useRouter } from "next/router";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const requireAuth = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login_service/login"); 
      }
    });

    return () => unsubscribe();
  }, []);

  return null; 
};

export default requireAuth;
