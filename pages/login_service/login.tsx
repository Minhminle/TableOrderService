import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useFetchLogin } from "@/models/Login";
import router from "next/router";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { logins } = useFetchLogin();
  const handleLogin = () => {
    const user = logins.find((login) => login.username === username && login.password === password);
    if (user) {
      router.push("http://localhost:3000/ad_service/manage");
    } else {
      alert("Username or password is incorrect");
    }
  };

  return (
    <>
      <Box>
        <Typography variant="h4" textAlign="center">
          Login
        </Typography>
        <Stack direction="column" spacing={1}>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin}>Login</Button>
          <Typography
            sx={{
              textAlign: "center",
              "&:hover": {
                color: "blue",
                cursor: "pointer",
              },
            }}
          >
            Change password your account
          </Typography>
        </Stack>
      </Box>
    </>
  );
};

export default Login;
