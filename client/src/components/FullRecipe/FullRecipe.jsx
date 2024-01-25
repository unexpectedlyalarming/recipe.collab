import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import {
  Star as StarIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableHead,
} from "@mui/material";
import Loading from "../../pages/Loading/Loading";
import Image from "mui-image";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import Chip from "@mui/material/Chip";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import AddToCart from "./AddToCart/AddToCart";
import RecipeStar from "../RecipeCard/RecipeStar/RecipeStar";

export default function FullRecipe({ id }) {
  const navigate = useNavigate();
  const {
    data: recipe,
    loading,
    request,
  } = useApi({
    url: `/recipe/${id}`,
  });

  useEffect(() => {
    request();
  }, [id]);

  const { user } = useContext(UserContext);

  const [isForksOpen, setIsForksOpen] = useState(false);

  function formatTime(time) {
    let timeString = "";

    for (let unit in time) {
      let rounded;

      if (unit === "minutes") {
        rounded = Math.max(Math.round(time[unit] / 5) * 5, 5);
      } else if (unit === "seconds") {
        rounded = Math.round(time[unit] / 30) * 30;
      } else {
        rounded = time[unit];
      }

      if (rounded > 0) {
        timeString += `${rounded} ${unit} `;
      }
    }

    return timeString.trim();
  }

  function createData(name, quantity, unit) {
    return { name, quantity, unit };
  }

  let rows = recipe?.ingredients?.map((item) => {
    return createData(item.name, item.quantity, item.unit);
  });

  const instructions = recipe?.instructions?.map((item) => {
    return (
      <Stack key={item.instruction_id}>
        <Typography variant="h5">{item.step_number}.</Typography>
        <Typography variant="p">{item.description}</Typography>
        {item.image && (
          <Image
            src={item.image}
            alt={item.description}
            sx={{
              width: "80% !important",
              height: "auto",
              objectFit: "contain",
            }}
          />
        )}
      </Stack>
    );
  });

  if (loading) {
    return <Loading />;
  }

  const tags = recipe?.tags?.map((tag) => {
    return (
      <Chip
        key={tag}
        label={tag}
        color="secondary"
        sx={{
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      />
    );
  });

  const forksView = recipe?.forks?.map((fork) => {
    return (
      <Stack key={fork.version_id}>
        <Typography variant="h5">{fork.version_number}</Typography>
        <Link to={`/recipe/${fork.recipe_id}`}>View Fork</Link>
      </Stack>
    );
  });

  function toggleForks() {
    setIsForksOpen(!isForksOpen);
  }

  function forkRecipe() {
    navigate(`/recipe/create/${id}?fork=true`);
  }

  const userOwnsRecipe = user?.user_id === recipe?.user_id;

  return (
    <Container>
      <Stack spacing={2}>
        <Typography variant="h2">{recipe?.title}</Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="p" color="gray">
            {recipe?.created_at.split("T")[0]}
          </Typography>
          <Typography
            variant="p"
            color="gray"
            component={Link}
            to={`/user/${recipe?.user_id}`}
            sx={{
              textDecoration: "none",
            }}
          >
            Posted by {recipe?.username}
          </Typography>
        </Stack>

        {recipe?.image && <Image src={recipe?.image} alt={recipe?.title} />}
        <Stack direction="row" spacing={2}>
          {tags}
        </Stack>
        {userOwnsRecipe && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/recipe/edit/${id}`)}
            >
              Edit Recipe
            </Button>
          </Stack>
        )}
        <Stack direction="row" spacing={2}>
          <AddToCart recipeId={recipe?.recipe_id} />
        </Stack>

        <Typography variant="h5">{recipe?.description}</Typography>

        <Stack direction="row" spacing={2}>
          <Typography variant="h6">
            Prep Time: {formatTime(recipe?.preparation_time)}
          </Typography>
          <Typography variant="h6">
            Cook Time: {formatTime(recipe?.cooking_time)}
          </Typography>
        </Stack>

        <Typography variant="h6">Serves {recipe?.servings} people</Typography>

        <Typography variant="h6">
          Difficulty: {recipe?.difficulty_level}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "start",
            alignItems: "center",
          }}
        >
          <RecipeStar recipe={recipe} />
          <Typography variant="body2">
            <CommentIcon />
            {recipe?.comments?.length}
          </Typography>
          <Typography variant="body2">
            <VisibilityIcon />
            {recipe?.views?.length}
          </Typography>
          <Typography variant="body2">
            <RestaurantIcon />
            {recipe?.forks?.length}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="primary" onClick={forkRecipe}>
            Fork Recipe
          </Button>
          <Button variant="contained" color="secondary" onClick={toggleForks}>
            View {recipe?.forks?.length} Forks
          </Button>
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              alignSelf: "center",
              justifySelf: "center",
            }}
          >
            Version {recipe?.version_number}
          </Typography>
        </Stack>
        {isForksOpen && forksView}

        <Typography variant="h4">Ingredients</Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ingredient</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {instructions}
      </Stack>
    </Container>
  );
}
