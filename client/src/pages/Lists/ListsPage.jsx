import useApi from "../../hooks/useApi";

import { useState, useEffect, useContext } from "react";

import { Container, Stack, Typography } from "@mui/material";

import { Link } from "react-router-dom";

import { UserContext } from "../../contexts/userContext";
import CreateList from "../../components/List/CreateList/CreateList";

export default function ListsPage() {
  const { user } = useContext(UserContext);
  const {
    data: lists,
    loading,
    request,
    setData: setLists,
  } = useApi({
    url: `/list/${user.user_id}`,
  });

  useEffect(() => {
    async function fetchLists() {
      try {
        await request();
      } catch (error) {
        console.error(error);
      }
    }
    fetchLists();
  }, []);

  const listsList = lists?.length ? (
    lists.map((list) => {
      return (
        <Stack key={list?.list_id}>
          <Typography
            variant="h5"
            component={Link}
            to={`/list/${list?.list_id}`}
            sx={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {list?.name}
          </Typography>
        </Stack>
      );
    })
  ) : (
    <Typography variant="p">No Lists Found.</Typography>
  );

  function updateLists(newList) {
    setLists([...lists, newList]);
  }

  return (
    <Container>
      <Typography variant="h2">Lists</Typography>

      {listsList}

      <CreateList updateLists={updateLists} />
    </Container>
  );
}
