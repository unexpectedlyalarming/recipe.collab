import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "mui-image";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardHeader from "@mui/material/CardHeader";
import MinusIcon from "@mui/icons-material/Remove";
import IconButton from "@mui/material/IconButton";
import useApi from "../../../hooks/useApi";
export default function ListItem({ listItem, removeItem }) {
  const {
    data: deletedItem,
    loading,
    request,
  } = useApi({
    url: `/list/${listItem?.recipe_id}`,
    method: "delete",
  });

  async function handleDelete() {
    try {
      await request();
      removeItem(listItem?.recipe_id);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Card>
      <CardActionArea component={Link} to={`/recipe/${listItem?.recipe_id}`}>
        <CardHeader
          title={listItem?.title}
          subheader={listItem?.created_at?.split("T", 1)}
        />
        <CardMedia
          component="img"
          height="194"
          image={listItem?.image}
          alt={listItem?.title}
          sx={{
            height: "20rem",
          }}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {listItem?.description}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActionArea>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            padding: "1rem",
          }}
        >
          <IconButton color="error" onClick={handleDelete}>
            <MinusIcon />
          </IconButton>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
