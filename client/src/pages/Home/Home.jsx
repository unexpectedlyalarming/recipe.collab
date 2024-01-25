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

      {/*
        Just a note.
        Highest rated seems a bit redundant
        with the star feature, views, and comments.
        I think stars probably covers what is the
        best/most popular so it will probably end up
        commented out (maybe by time anyone else reads this).
        */}
      {/* <Stack spacing={4}>
        <Typography variant="h2">Highest Rated</Typography>
        <SortedRecipeList sortMethod="rating" />
      </Stack> */}

      <Stack spacing={4}>
        <Typography variant="h2">Following</Typography>
        <SortedRecipeList sortMethod="following" />
      </Stack>
    </Container>
  );
}
