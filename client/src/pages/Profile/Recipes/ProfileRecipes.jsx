import RecipeCollection from "../../../components/RecipeCollection/RecipeCollection";

import { useContext } from "react";
import { UserContext } from "../../../contexts/userContext";

import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
export default function ProfileRecipes({ recipes }) {
  const { user } = useContext(UserContext);
  const { id } = useParams();

  const createRecipeView = (
    <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
      <Button variant="contained" component={Link} to="/recipe/create">
        Create Recipe
      </Button>
    </Stack>
  );

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <Typography variant="h4">Recipes</Typography>

      {user?.user_id == id && createRecipeView}
      <RecipeCollection recipes={recipes} />
    </Container>
  );
}
