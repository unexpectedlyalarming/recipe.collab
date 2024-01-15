import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import SERVER_URL from "../vars/server_url";
import { UserContext } from "../contexts/userContext";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const navigate = useNavigate();
  const { setUser, user } = useContext(UserContext);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        SERVER_URL + "/auth/login",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setUser(response.data);
        setSuccess(true);
        if (response.data) {
          navigate("/");
        }
      } else {
        setError(response.data.message);
        throw new Error("Login failed");
      }
    } catch (err) {
      setError(err.response.data.message);
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await axios.get(SERVER_URL + "/auth/logout");
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return { login, logout, success, error };
}
