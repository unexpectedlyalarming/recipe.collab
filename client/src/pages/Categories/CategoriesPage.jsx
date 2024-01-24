import CategoriesFilters from "../../components/Categories/CategoriesFilters/CategoriesFilters";
import CategoriesView from "../../components/Categories/CategoriesView/CategoriesView";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import Loading from "../Loading/Loading";
import { useState } from "react";
import Container from "@mui/material/Container";

export default function CategoriesPage() {
  const [filter, setFilter] = useState("Vegan");

  const page = 1;
  const limit = 20;

  const {
    data: tags,
    loading: tagsLoading,
    request: tagsRequest,
  } = useApi({
    url: `/recipe/tags/${page}/${limit}/`,
  });

  const {
    data: recipesData,
    loading,
    request,
    success,
  } = useApi({
    url: `/recipe/sort/tag/${filter}/${page}/${limit}/`,
  });

  useEffect(() => {
    async function fetchRecipes() {
      try {
        console.log(filter);
        await request();
      } catch (error) {
        console.log(error);
      }
    }
    fetchRecipes();
  }, [success, filter]);

  useEffect(() => {
    async function fetchTags() {
      try {
        await tagsRequest();
      } catch (error) {
        console.log(error);
      }
    }
    fetchTags();
  }, []);

  return (
    <Container>
      <CategoriesFilters tags={tags} setFilter={setFilter} />
      {loading ? <Loading /> : <CategoriesView recipes={recipesData} />}
    </Container>
  );
}
