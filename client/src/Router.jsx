import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function Routers() {
  const [user, setUser] = useState(false);

  const [loading, setLoading] = useState(false);

  const Layout = () => {
    return (
      <>
        <div>Nav</div>
        <Outlet />
      </>
    );
  };

  //Check for session here -- todo

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
  ]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const theme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router}></RouterProvider>
    </ThemeProvider>
  );
}

export default Routers;