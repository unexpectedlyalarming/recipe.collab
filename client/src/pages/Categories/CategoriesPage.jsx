import CategoriesFilters from "../../components/Categories/CategoriesFilters/CategoriesFilters";
import CategoriesView from "../../components/Categories/CategoriesView/CategoriesView";
import useApi from "../../hooks/useApi";
import { useCallback, useEffect } from "react";
import Loading from "../Loading/Loading";
import { useState } from "react";
import Container from "@mui/material/Container";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import Pagination from "@mui/material/Pagination";

export default function CategoriesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [filter, setFilter] = useState(queryParams.get("tag") || "");

  const [tagQuery, setTagQuery] = useState("");

  const [page, setPage] = useState(1);
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
    url: `/recipe/tags/${page}/${limit}/${tagQuery}`,
  });

  const {
    data: recipesData,
    loading,
    request,
    success,
  } = useApi({
    url: `/recipe/sort/tag/${filter}/${page}/${limit}/`,
  });

  const debouncedUpdateFilter = useCallback(debounce(updateFilter, 300), []);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        await request();
      } catch (error) {
        console.log(error);
      }
    }
    fetchRecipes();
  }, [success, filter, page]);

  useEffect(() => {
    async function fetchTags() {
      try {
        await tagsRequest();
      } catch (error) {
        console.log(error);
      }
    }
    fetchTags();
  }, [tagQuery]);

  useEffect(() => {
    if (queryParams.get("tag")) {
      setFilter(queryParams.get("tag"));
    }
  }, [queryParams]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CategoriesFilters
        tags={tags}
        setFilter={debouncedUpdateFilter}
        filter={filter}
        setTagQuery={setTagQuery}
      />
      {loading ? (
        <Loading />
      ) : (
        <CategoriesView recipes={recipesData?.recipes} />
      )}
      <Pagination
        count={recipesData?.pageCount}
        page={page}
        onChange={(e, value) => setPage(value)}
      />
    </Container>
  );
}
