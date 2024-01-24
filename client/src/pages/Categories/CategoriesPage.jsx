import CategoriesFilters from "../../components/Categories/CategoriesFilters/CategoriesFilters";
import CategoriesView from "../../components/Categories/CategoriesView/CategoriesView";
import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import Loading from "../Loading/Loading";
import { useState } from "react";
import Container from "@mui/material/Container";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function CategoriesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [filter, setFilter] = useState(queryParams.get("tag") || "");

  const page = 1;
  const limit = 20;

  function updateFilter(tag) {
    setFilter(tag);
    navigate(`/categories?tag=${tag}`, { replace: true });
  }

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

  useEffect(() => {
    if (queryParams.get("tag")) {
      setFilter(queryParams.get("tag"));
    }
  }, [queryParams]);

  return (
    <Container>
      <CategoriesFilters tags={tags} setFilter={updateFilter} filter={filter} />
      {loading ? <Loading /> : <CategoriesView recipes={recipesData} />}
    </Container>
  );
}
