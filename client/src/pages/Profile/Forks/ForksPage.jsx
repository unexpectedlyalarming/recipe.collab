import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import Loading from "../../Loading/Loading";
import RecipeCollection from "../../../components/RecipeCollection/RecipeCollection";

export default function ForksPage() {
  const { data: forks, loading, error } = useApi("/recipe/versions/unaccepted");

  const {
    data: accept,
    loading: isAccepting,
    error: acceptError,
    request: acceptRequest,
  } = useApi("/recipe/versions/accept/"); // Add id

  useEffect(() => {
    async function fetchData() {
      try {
        await acceptRequest();
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <Container>
      <Typography variant="h4">Forks</Typography>
      <RecipeCollection recipes={forks} />
    </Container>
  );
}
