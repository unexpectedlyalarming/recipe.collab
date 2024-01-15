import React from "react";
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

export default function RecipeCard({ recipe }) {
  return (
    <Card>
      <CardHeader title={recipe?.title} subheader={recipe?.created_at} />
      <Link to={`/recipes/${recipe?.recipe_id}`}>
        <CardMedia
          component="img"
          height="140"
          image={recipe?.image}
          alt={recipe?.title}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {recipe?.description}
          </Typography>
        </CardContent>
      </Link>
      <CardActions disableSpacing>
        <IconButton>
          <StarIcon />
          {recipe?.stars?.length}
        </IconButton>
        <IconButton>
          <CommentIcon />
          {recipe?.comments?.length}
        </IconButton>
        <IconButton>
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
