import SearchFilters from "../../components/Search/SearchFilters/SearchFilters";
import CategoriesView from "../../components/Categories/CategoriesView/CategoriesView";
import { useState, useEffect, useCallback } from "react";
import useApi from "../../hooks/useApi";
import { useParams } from "react-router-dom";
import { debounce } from "lodash";

import { Container } from "@mui/material";
import Pagination from "@mui/material/Pagination";

export default function SearchPage() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;
  const sort = "date";

  function updateFilter(filter) {
    setFilter(filter);
  }

  const debouncedUpdateFilter = useCallback(debounce(updateFilter, 300), []);

  const {
    data: recipes,
    loading,
    request,
    success,
  } = useApi({
    url: `/recipe/search/${filter}/${page}/${limit}/${sort}`,
  });

  useEffect(() => {
    request();
  }, [filter, success, page]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  return (
    <Container>
      <SearchFilters setFilter={debouncedUpdateFilter} filter={filter} />
      <CategoriesView recipes={recipes?.recipes} />
      <Pagination
        count={recipes?.pageCount}
        page={page}
        onChange={(e, value) => setPage(value)}
      />
    </Container>
  );
}
