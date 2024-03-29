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
import { ThemeProvider } from "@mui/material/styles";
import Loading from "./pages/Loading/Loading";
import Nav from "./components/Nav/Nav";
import NotFound from "./pages/404/NotFound";
import { UserProvider } from "./contexts/userContext";
import axios from "axios";
import RecipePage from "./pages/Recipe/RecipePage";
import SERVER_URL from "./vars/server_url";
import theme from "./theme";
import CreateRecipe from "./pages/Recipe/Create/CreateRecipe";
import Profile from "./pages/Profile/Profile";
import ProfileRecipes from "./pages/Profile/Recipes/ProfileRecipes";
import CartPage from "./pages/Cart/CartPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import SearchPage from "./pages/Search/SearchPage";
import StarredRecipes from "./pages/Profile/Starred/StarredRecipes";
import ForksPage from "./pages/Profile/Forks/ForksPage";
import CssBaseline from "@mui/material/CssBaseline";
import Footer from "./components/Footer/Footer";
import ListsPage from "./pages/Lists/ListsPage";
import ListView from "./components/List/ListView";

function Routers() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const Layout = () => {
    return (
      <>
        <Nav />
        <Outlet />
        <Footer />
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
        const fetchedUser = await axios.get(SERVER_URL + "/auth/session");
        if (fetchedUser.data) {
          setUser(fetchedUser.data);
        } else {
          setUser(null);
        }
        setLoading(false);
      } catch (error) {
        setUser(null);
        setLoading(false);
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
        {
          path: "/recipe/:id",
          element: <RecipePage />,
        },
        {
          path: "/recipe/create",
          element: <CreateRecipe />,
        },
        {
          path: "/recipe/create/:id",
          element: <CreateRecipe />,
        },
        {
          path: "/user/starred",
          element: <StarredRecipes />,
        },
        {
          path: "user/forks",
          element: <ForksPage />,
        },
        {
          path: "/user/:id",
          element: <Profile />,
        },
        {
          path: "/cart",
          element: <CartPage />,
        },
        {
          path: "/lists",
          element: <ListsPage />,
        },
        {
          path: "/list/:id",
          element: <ListView />,
        },
        {
          path: "/categories",
          element: <CategoriesPage />,
        },
        {
          path: "/search",
          element: <SearchPage />,
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

  if (loading) return <Loading />;

  return (
    <UserProvider value={{ user, setUser }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router}></RouterProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

export default Routers;
