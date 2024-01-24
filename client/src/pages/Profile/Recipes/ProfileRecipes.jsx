import RecipeCollection from "../../../components/RecipeCollection/RecipeCollection";
import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import { useContext } from "react";
import { UserContext } from "../../../contexts/userContext";
import Loading from "../../Loading/Loading";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import { useParams } from "react-router-dom";
export default function ProfileRecipes() {
  const { user } = useContext(UserContext);
  const { id } = useParams();

  const {
    data: recipes,
    loading,
    request,
  } = useApi({
    url: `/recipe/user/${user?.user_id}`,
  });

  useEffect(() => {
    async function fetchRecipes() {
      try {
        await request();
      } catch (error) {
        console.log(error);
      }
    }
    fetchRecipes();
  }, []);

  const createRecipeView = (
    <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
      <Button variant="contained" component={Link} to="/recipe/create">
        Create Recipe
      </Button>
    </Stack>
  );

  if (loading) return <Loading />;

  return (
    <Container>
      {user?.user_id == id && createRecipeView}
      <RecipeCollection recipes={recipes} />
    </Container>
  );
}
