import RecipeCard from "../RecipeCard/RecipeCard";
import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export default function RecipeCollection({ recipes }) {
  const recipeView = recipes?.length ? (
    recipes.map((recipe) => {
      return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.recipe_id}>
          <RecipeCard recipe={recipe} />
        </Grid>
      );
    })
  ) : (
    <Stack spacing={2}>
      <Typography variant="h5">No recipes found</Typography>
    </Stack>
  );
  return (
    <Grid
      container
      spacing={2}
      sx={{
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        margin: "auto",
        padding: "1rem",
      }}
    >
      {recipeView}
    </Grid>
  );
}
