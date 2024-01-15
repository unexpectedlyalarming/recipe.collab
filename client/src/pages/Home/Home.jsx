import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import SortedRecipeList from "../../components/SortedRecipeList/SortedRecipeList";

export default function Home() {
  return (
    <Container>
      <Typography variant="h1">Your feed</Typography>

      <Typography variant="h2">Latest Recipes</Typography>
      <SortedRecipeList sortMethod="date" />

      <Typography variant="h2">Most Starred</Typography>
      <SortedRecipeList sortMethod="stars" />

      <Typography variant="h2">Most Viewed</Typography>
      <SortedRecipeList sortMethod="views" />

      <Typography variant="h2">Highest Rated</Typography>
      <SortedRecipeList sortMethod="rating" />
    </Container>
  );
}
