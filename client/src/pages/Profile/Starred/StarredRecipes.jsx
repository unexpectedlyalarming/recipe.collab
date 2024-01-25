import RecipeCollection from "../../../components/RecipeCollection/RecipeCollection";

import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import Loading from "../../Loading/Loading";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../../contexts/userContext";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function StarredRecipes() {
  const { user } = useContext(UserContext);
  const {
    data: recipes,
    loading,
    request,
  } = useApi({
    url: `/star/user/${user?.user_id}`,
  });

  useEffect(() => {
    async function getStarredRecipes() {
      await request();
    }
    getStarredRecipes();
  }, []);

  return (
    <Container>
      <Stack
        spacing={2}
        sx={{ justifyContent: "center", alignItems: "center" }}
      >
        <Typography variant="h4">Starred Recipes</Typography>
      </Stack>
      <RecipeCollection recipes={recipes} />
    </Container>
  );
}
