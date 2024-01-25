import StarIcon from "@mui/icons-material/Star";
import { IconButton } from "@mui/material";
import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "../../../contexts/userContext";

export default function RecipeStar({ recipe }) {
  const { user } = useContext(UserContext);

  const isStarred = recipe?.stars?.some((star) => {
    return star.user_id === user?.user_id;
  });
  const [starred, setStarred] = useState(isStarred);

  const [starCount, setStarCount] = useState(recipe?.stars?.length);

  const {
    data: toggleStarData,
    loading,
    request,
    success,
  } = useApi({
    url: `/star/${recipe?.recipe_id}`,
    method: "put",
  });

  async function handleStar() {
    try {
      const star = await request();
      setStarred(star);
      if (star) {
        setStarCount(starCount + 1);
      }
      if (!star) {
        setStarCount(starCount - 1);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <IconButton onClick={handleStar}>
      <StarIcon
        sx={{
          color: starred ? "yellow" : "white",
        }}
      />
      {starCount}
    </IconButton>
  );
}
