import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import RecipeCard from "../RecipeCard/RecipeCard";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import Typography from "@mui/material/Typography";

export default function SortedRecipeList({ sortMethod, sortOption = null }) {
  let { page, limit } = sortOption || { page: 1, limit: 10 };

  const {
    data: recipes,
    loading,
    request,
  } = useApi({
    url: `/recipe/sort/${sortMethod}/${page}/${limit}`,
  });

  useEffect(() => {
    request();
  }, [sortMethod]);

  if (loading) {
    return <Typography variant="h5">Loading...</Typography>;
  }

  return (
    <Carousel showThumbs={false} infiniteLoop={true} showIndicators={false}>
      {recipes?.map((item, index) => (
        <RecipeCard recipe={item} key={index} />
      ))}
    </Carousel>
  );
}
