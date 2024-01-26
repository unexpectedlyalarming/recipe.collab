import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import useApi from "../../../hooks/useApi";
import { useEffect, useState } from "react";
import Loading from "../../Loading/Loading";
import RecipeCollection from "../../../components/RecipeCollection/RecipeCollection";

export default function ForksPage() {
  const [recipes, setRecipes] = useState([]);
  const {
    data: forks,
    loading,
    request,
    success,
  } = useApi({
    url: "/recipe/versions/unaccepted",
  });

  const {
    data: accept,
    loading: isAccepting,
    error: acceptError,
    request: acceptRequest,
  } = useApi({
    url: "/recipe/versions/accept", // add id
    method: "put",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await request();
        console.log("calling useEffect!");
        console.log(data);
        if (data) {
          setRecipes(data);
        } else {
          setRecipes([]);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, [success]);

  if (loading) return <Loading />;

  return (
    <Container>
      <Typography variant="h4">Forks</Typography>
      <RecipeCollection recipes={recipes} />
    </Container>
  );
}
