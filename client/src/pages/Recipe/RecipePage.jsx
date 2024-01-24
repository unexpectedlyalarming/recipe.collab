import Comments from "../../components/Comments/Comments";
import FullRecipe from "../../components/FullRecipe/FullRecipe";
import { useParams } from "react-router-dom";

export default function RecipePage() {
  const { id } = useParams();
  return (
    <>
      <FullRecipe id={id} />
      <Comments id={id} />
    </>
  );
}
