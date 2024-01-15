import React, { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { CircularProgress } from "@mui/material";

export default function Register() {
  const [form, setForm] = useState("");

  const [formErrors, setFormErrors] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    data: error,
    success,
    loading: requestLoad,
    request: registerUser,
  } = useApi({
    url: "/auth/register",
    method: "post",
    body: {
      username: form.username,
      password: form.password,
      email: form.email,
      first_name: form.firstName,
      last_name: form.lastName,
    },
  });

  async function register() {
    try {
      if (form.username.length < 6) {
        setFormErrors({ username: "Username must be at least 6 characters" });
      } else if (form.password.length < 6) {
        setFormErrors({ password: "Password must be at least 6 characters" });
      } else if (form.password !== form.confirmPassword) {
        setFormErrors({ confirmPassword: "Passwords do not match" });
      } else if (form.email.length < 6) {
        setFormErrors({ email: "Email must be at least 6 characters" });
      } else if (form.firstName.length < 3) {
        setFormErrors({
          firstName: "First name must be at least 3 characters",
        });
      } else if (form.lastName.length < 3) {
        setFormErrors({ lastName: "Last name must be at least 3 characters" });
      } else if (
        //email regex... could use a library but this is easier with a comment
        !form.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)
      ) {
        setFormErrors({ email: "Please enter a valid email" });
      } else {
        setFormErrors(false);

        //todo: api calls

        setLoading(true);
        await registerUser();
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (success) {
      navigate("/");
    }
    setLoading(false);
  }, [success, error]);

  return (
    <Container>
      <h1>Register</h1>
      <Stack spacing={2}>
        <TextField
          variant="outlined"
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          error={formErrors?.email}
          helperText={formErrors?.email}
        />
        <TextField
          variant="outlined"
          label="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          error={formErrors?.username}
          helperText={formErrors?.username}
        />
        <TextField
          variant="outlined"
          label="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          error={formErrors?.password}
          helperText={formErrors?.password}
          type="password"
        />
        <TextField
          variant="outlined"
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          required
          error={formErrors?.confirmPassword}
          helperText={formErrors?.confirmPassword}
          type="password"
        />

        <TextField
          variant="outlined"
          label="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
          error={formErrors?.firstName}
          helperText={formErrors?.firstName}
        />
        <TextField
          variant="outlined"
          label="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
          error={formErrors?.lastName}
          helperText={formErrors?.lastName}
        />

        <Typography variant="p" color="error">
          {typeof error === "object" ? null : error}
        </Typography>

        <Button onClick={register}>Register</Button>

        <Button component={Link} to="/login">
          Have an account? Login
        </Button>
        {loading && (
          <CircularProgress
            sx={{
              alignSelf: "center",
              justifySelf: "center",
            }}
          />
        )}
      </Stack>
    </Container>
  );
}
