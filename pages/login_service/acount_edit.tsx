import { useState } from "react";
import { getFirestore, collection, updateDoc, doc, getDocs } from "firebase/firestore";
import { hash } from "bcryptjs";
import { useRouter } from "next/router";
import { firebaseConfig } from "@/models/Config";
import { initializeApp } from "firebase/app";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useFetchLogin } from "@/models/Login";
import { compare } from "bcryptjs";

const acount_edit = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [recentUsername, setRecentUsername] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [recentPassword, setRecentPassword] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [newPassword, setNewPassword] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();


  const handleChangePass = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const userRef = collection(db, "Login");
    const querySnapshot = await getDocs(userRef);
    const users = querySnapshot.docs.map((doc) => doc.data());

    const user = users.find((login) => login.username === recentUsername);
    if (user) {
      const isPasswordMatch = await compare(recentPassword, user.password);
      if (isPasswordMatch) {
        if (newPassword === confirmNewPassword) {
          const hashedNewPassword = await hash(newPassword, 10);
          await updateDoc(doc(user.id), { password: hashedNewPassword });
          router.push("/login_service/login");
        } else {
          alert("New password and confirm new password do not match");
        }
      } else {
        alert("Username or password is incorrect");
      }
    } else {
      alert("Username or password is incorrect");
    }
  };

  return (
    <Box>
      <Typography textAlign="center" variant="h3">Change Password</Typography>
      <TextField
        type="text"
        label="Username"
        placeholder="Enter your recent username"
        value={recentUsername}
        onChange={(e) => setRecentUsername(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        type="password"
        label="Recent Password"
        placeholder="Enter your recent password"
        value={recentPassword}
        onChange={(e) => setRecentPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        type="password"
        label="New Password"
        placeholder="Enter your new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        type="password"
        label="Confirm New Password"
        placeholder="Confirm your new password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        onClick={handleChangePass}
        sx={{ display: 'block', margin: 'auto' }}
        variant="contained"
        color="primary"
      >
        Change Password
      </Button>
    </Box>
  );
};

export default acount_edit;
