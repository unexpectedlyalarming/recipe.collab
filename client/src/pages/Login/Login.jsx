import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState(false);

  const navigate = useNavigate();

  const { login, success, error } = useAuth();

  async function handleLogin() {
    try {
      if (username.length < 6) {
        setFormErrors({ username: "Username must be at least 6 characters" });
      } else if (password.length < 6) {
        setFormErrors({ password: "Password must be at least 6 characters" });
      } else {
        setFormErrors(false);
      }

      await login(username, password);
      console.log(error);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (success) {
      navigate("/");
    }
  }, [success]);

  return (
    <Container>
      <h1>Login</h1>
      <Stack spacing={2}>
        <TextField
          variant="outlined"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          error={formErrors?.username}
          helperText={formErrors?.username}
        />
        <TextField
          variant="outlined"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={formErrors?.password}
          helperText={formErrors?.password}
          type="password"
        />
        <Typography variant="p" color="error">
          {error}
        </Typography>
        <Button onClick={handleLogin}>Login</Button>

        <Button component={Link} to="/register">
          Register
        </Button>
      </Stack>
    </Container>
  );
}
