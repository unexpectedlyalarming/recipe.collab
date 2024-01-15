import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Loading from "./pages/Loading/Loading";
import Nav from "./components/Nav/Nav";
import NotFound from "./pages/404/NotFound";
import useApi from "./hooks/useApi";
import { UserProvider } from "./contexts/userContext";
import axios from "axios";

function Routers() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const Layout = () => {
    return (
      <>
        <Nav />
        <Outlet />
      </>
    );
  };

  //Check for session here -- todo

  // const {
  //   data: fetchedUser,
  //   success,
  //   request: getSession,
  // } = useApi({
  //   url: "/auth/session",
  // });

  useEffect(() => {
    async function checkUserSession() {
      try {
        const fetchedUser = await axios.get("/auth/session");
        if (fetchedUser.data) {
          setUser(fetchedUser.data);
        } else {
          setUser(null);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
    checkUserSession();
  }, []);

  const AuthorizedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <AuthorizedRoute>
          <Layout />
        </AuthorizedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  const theme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  if (loading) return <Loading />;

  return (
    <UserProvider value={{ user, setUser }}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router}></RouterProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

export default Routers;
