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
import Chip from "@mui/material/Chip";

import CardActionArea from "@mui/material/CardActionArea";
import RecipeStar from "./RecipeStar/RecipeStar";

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
          subheader={recipe?.created_at?.split("T", 1)}
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
        <RecipeStar recipe={recipe} />
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
        <Chip color="secondary" label={recipe?.difficulty_level} />
      </CardActions>
      <CardActions spacing={2}>
        {recipe?.tags?.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            color="primary"
            onClick={() => {
              navigate(`/categories?tag=${tag}`);
            }}
          />
        ))}
      </CardActions>
    </Card>
  );
}
