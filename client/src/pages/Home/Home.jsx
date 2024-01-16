import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import SortedRecipeList from "../../components/SortedRecipeList/SortedRecipeList";
import Stack from "@mui/material/Stack";
export default function Home() {
  return (
    <Container>
      <Typography variant="h1">Your feed</Typography>

      <Stack spacing={4}>
        <Typography variant="h2">Latest Recipes</Typography>
        <SortedRecipeList sortMethod="date" />
      </Stack>
      <Stack spacing={4}>
        <Typography variant="h2">Most Starred</Typography>
        <SortedRecipeList sortMethod="stars" />
      </Stack>
      <Stack spacing={4}>
        <Typography variant="h2">Most Viewed</Typography>
        <SortedRecipeList sortMethod="views" />
      </Stack>
      <Stack spacing={4}>
        <Typography variant="h2">Highest Rated</Typography>
        <SortedRecipeList sortMethod="rating" />
      </Stack>
    </Container>
  );
}
