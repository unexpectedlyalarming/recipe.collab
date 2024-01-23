import RecipeEditor from "../../../components/RecipeEditor/RecipeEditor";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import useApi from "../../../hooks/useApi";
import { useEffect, useState } from "react";
import Loading from "../../Loading/Loading";
import _ from "lodash";
export default function CreateRecipe() {
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFork = searchParams.get("fork");

  const [inputRecipe, setInputRecipe] = useState(null);

  const {
    data: recipe,
    loading,
    request,
    success,
  } = useApi({
    url: `/recipe/${id}`,
  });

  useEffect(() => {
    async function fetchRecipe() {
      await request();
      if (recipe) {
        setInputRecipe(await convertInputToEditorFormat(recipe));
      }
    }
    if (id) {
      fetchRecipe();
    }
  }, [success]);

  async function convertInputToEditorFormat(inputRecipe) {
    try {
      /*
      Its kind of annoying, but
      its easier to just convert to an
      object and back to an array.

      I could refactor but this works and I don't
      want to touch it again.

      */
      const newTags = inputRecipe.tags.map((tag) => {
        return { tag };
      });

      const outputRecipe = {
        recipe_id: inputRecipe.recipe_id,
        title: inputRecipe.title,
        description: inputRecipe.description,
        tags: newTags,
        preparation_time: inputRecipe.preparation_time,
        cooking_time: inputRecipe.cooking_time,
        ingredients: inputRecipe.ingredients,
        instructions: inputRecipe.instructions,
        servings: inputRecipe.servings,
        difficulty: _.lowerCase(inputRecipe.difficulty_level),
      };
      return outputRecipe;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  if (loading && id) {
    return <Loading />;
  }
  if (id && !recipe) {
    return <Loading />;
  }

  return (
    <>
      <RecipeEditor inputRecipe={inputRecipe} isFork={isFork} />
    </>
  );
}
