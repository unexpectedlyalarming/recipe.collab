import useApi from "../../hooks/useApi";
import { useEffect } from "react";
import Loading from "../Loading/Loading";
import { useState } from "react";
import Container from "@mui/material/Container";
import List from "./List";
export default function ListView({ list_id }) {
  const [refresh, setRefresh] = useState(false);
  const {
    data: listData,
    setData: setList,
    loading,
    request,
    success,
  } = useApi({
    url: `/list/${list_id}`,
  });

  useEffect(() => {
    async function fetchList() {
      try {
        await request();
      } catch (error) {
        console.log(error);
      }
    }
    fetchList();
  }, [success, refresh]);

  function handleRefresh() {
    setRefresh(!refresh);
  }

  function filterItem(recipe_id) {
    const newList = listData.filter((item) => item.recipe_id !== recipe_id);
    setList(newList);
  }

  if (loading) return <Loading />;

  return (
    <Container>
      <List cart={listData} removeItem={filterItem} />
      {/* <DeleteCart refreshCart={handleRefresh} /> 
      
      Should put delete list here.
      
      */}
    </Container>
  );
}
