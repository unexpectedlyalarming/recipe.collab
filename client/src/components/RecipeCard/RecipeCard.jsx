import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import CommentIcon from "@mui/icons-material/Comment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from "react-router-dom";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CardHeader,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";

import CardActionArea from "@mui/material/CardActionArea";

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  const [starred, setStarred] = useState(false);

  async function handleStar() {
    try {
      console.log("starred");
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <Card>
      <CardActionArea component={Link} to={`/recipe/${recipe?.recipe_id}`}>
        <CardHeader
          title={recipe?.title}
          subheader={recipe?.created_at.split("T", 1)}
        />
        <CardMedia
          component="img"
          height="194"
          image={recipe?.image}
          alt={recipe?.title}
          sx={{
            height: "20rem",
          }}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {recipe?.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions disableSpacing>
        <IconButton onClick={handleStar}>
          <StarIcon
            sx={{
              color: starred ? "yellow" : "white",
            }}
          />
          {recipe?.stars?.length}
        </IconButton>
        <IconButton
          onClick={() => {
            navigate(`/recipe/${recipe?.recipe_id}`);
          }}
        >
          <CommentIcon />
          {recipe?.comments?.length}
        </IconButton>
        <IconButton
          onClick={() => {
            navigate(`/recipe/${recipe?.recipe_id}`);
          }}
        >
          <VisibilityIcon />
          {recipe?.views?.length}
        </IconButton>
      </CardActions>
    </Card>
  );
}
// Converting to card

/* <Container>
<Link to={`/recipes/${recipe?.recipe_id}`}>
  <Typography variant="h5">{recipe?.title}</Typography>

  <img src={recipe?.image} alt={recipe?.title} />

  <Typography variant="body1">{recipe?.description}</Typography>

  <Stack direction="row" spacing={2}>
    <Typography variant="body2">
      <StarIcon />
      {recipe?.rating}
    </Typography>
    <Typography variant="body2">
      <CommentIcon />
      {recipe?.comments.length}
    </Typography>
    <Typography variant="body2">
      <VisibilityIcon />
      {recipe?.views.length}
    </Typography>
  </Stack>
</Link>
</Container> */
