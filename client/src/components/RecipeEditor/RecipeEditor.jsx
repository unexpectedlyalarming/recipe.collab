import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import { TextField } from "@mui/material";
import { CircularProgress } from "@mui/material";
import useApi from "../../hooks/useApi";
import IngredientEditor from "./IngredientEditor/IngredientEditor";
import InstructionEditor from "./InstructionEditor/InstructionEditor";
import { FormHelperText } from "@mui/material";
import TagEditor from "./TagEditor/TagEditor";

export default function RecipeEditor({ inputRecipe, isFork }) {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(
    inputRecipe
      ? inputRecipe
      : {
          title: "",
          description: "",
          preparation_time: {
            minutes: "",
            hours: "",
          },
          cooking_time: {
            minutes: "",
            hours: "",
          },
          servings: "",
          difficulty: "easy",
        }
  );
  const [ingredients, setIngredients] = useState();
  const [instructions, setInstructions] = useState();
  const [tags, setTags] = useState();

  const [formattedRecipe, setFormattedRecipe] = useState();

  const [formErrors, setFormErrors] = useState({
    title: false,
    description: false,
    preparation_time: false,
    cooking_time: false,
    servings: false,
    difficulty: false,
    ingredients: false,
    instructions: false,
  });

  useEffect(() => {
    if (inputRecipe) {
      setRecipe(inputRecipe);
      setIngredients(inputRecipe?.ingredients);
      setInstructions(inputRecipe?.instructions);
      setTags(inputRecipe?.tags);
    }
  }, [inputRecipe]);

  async function convertFormTimeToInterval(time) {
    try {
      const hours = time.hours;
      const minutes = time.minutes;
      if (!hours) {
        return `${minutes} minutes`;
      }
      if (!minutes) {
        return `${hours} hours`;
      }

      return `${hours} hours ${minutes} minutes`;
    } catch (error) {
      console.error(error);
    }
  }

  function updateIngredients(ingredients) {
    setIngredients(ingredients);
  }

  function updateInstructions(instructions) {
    setInstructions(instructions);
  }

  function updateTags(tags) {
    setTags(tags);
  }

  const {
    data: newRecipe,
    loading: newRecipeLoading,
    request: sendRecipeRequest,
    success,
  } = useApi({
    url: "/recipe",
    method: "post",
    body: formattedRecipe,
  });

  const {
    data: forkedRecipe,
    loading: forkedRecipeLoading,
    request: forkRecipeRequest,
    success: forkSuccess,
  } = useApi({
    url: "/recipe/fork/" + inputRecipe?.recipe_id,
    method: "post",
    body: formattedRecipe,
  });

  async function formatAndSendRecipe() {
    try {
      let errors = {};

      if (!recipe.title) {
        errors.title = "title is required";
      }
      if (!recipe.description) {
        errors.description = "Description is required";
      }
      if (!recipe.preparation_time.hours && !recipe.preparation_time.minutes) {
        errors.preparation_time = "Prep time is required";
      }
      if (!recipe.cooking_time.hours && !recipe.cooking_time.minutes) {
        errors.cooking_time = "Cook time is required";
      }
      if (!recipe.servings) {
        errors.servings = "Servings are required";
      }
      if (!recipe.difficulty) {
        errors.difficulty = "Difficulty is required";
      }
      if (!ingredients.length) {
        errors.ingredients = "Ingredients are required";
      }
      if (!instructions.length) {
        errors.instructions = "Instructions are required";
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      } else {
        setFormErrors({});
      }

      const formattedRecipe = {
        title: recipe.title,
        description: recipe.description,
        preparation_time: await convertFormTimeToInterval(
          recipe.preparation_time
        ),
        cooking_time: await convertFormTimeToInterval(recipe.cooking_time),
        servings: recipe.servings,
        difficulty_level: recipe.difficulty,
        ingredients: ingredients,
        instructions: instructions,
        tags: tags,
      };

      setFormattedRecipe(formattedRecipe);
      console.log(formattedRecipe);

      // Todo: send recipe, support image upload, add loading indicator

      if (isFork && inputRecipe) {
        await forkRecipeRequest();
      }
      if (isFork && !inputRecipe) {
        console.error("Cannot fork a new recipe");
      } else {
        await sendRecipeRequest();
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (success) {
      navigate(`/recipe/${newRecipe?.recipe_id}`);
    }
    if (forkSuccess) {
      navigate(`/recipe/${forkedRecipe?.recipe_id}`);
    }
  }, [success, forkSuccess]);

  return (
    <Container>
      <Stack spacing={2}>
        <TextField
          id="outlined-multiline-flexible"
          label="Recipe Title"
          multiline
          maxRows={4}
          value={recipe.title}
          required
          onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
          error={!!formErrors.title}
          helperText={formErrors.title}
        />
        <TextField
          id="outlined-multiline-flexible"
          label="Description"
          multiline
          maxRows={4}
          value={recipe.description}
          required
          onChange={(e) =>
            setRecipe({ ...recipe, description: e.target.value })
          }
          error={!!formErrors.description}
          helperText={formErrors.description}
        />
        <InputLabel id="prep-time-label">Prep Time*</InputLabel>
        <Stack direction="row" spacing={2}>
          <TextField
            id="outlined-multiline-flexible"
            label="Hours"
            type="number"
            value={recipe.preparation_time.hours}
            onChange={(e) =>
              setRecipe({
                ...recipe,
                preparation_time: {
                  ...recipe.preparation_time,
                  hours: e.target.value,
                },
              })
            }
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Minutes"
            type="number"
            value={recipe.preparation_time.minutes}
            onChange={(e) =>
              setRecipe({
                ...recipe,
                preparation_time: {
                  ...recipe.preparation_time,
                  minutes: e.target.value,
                },
              })
            }
            error={!!formErrors.preparation_time}
            helperText={formErrors.preparation_time}
          />
        </Stack>

        <InputLabel id="cook-time-label">Cook Time*</InputLabel>

        <Stack direction="row" spacing={2}>
          <TextField
            id="outlined-multiline-flexible"
            label="Hours"
            type="number"
            value={recipe.cooking_time.hours}
            onChange={(e) =>
              setRecipe({
                ...recipe,
                cooking_time: { ...recipe.cooking_time, hours: e.target.value },
              })
            }
          />

          <TextField
            id="outlined-multiline-flexible"
            label="Minutes"
            type="number"
            value={recipe.cooking_time.minutes}
            onChange={(e) =>
              setRecipe({
                ...recipe,
                cooking_time: {
                  ...recipe.cooking_time,
                  minutes: e.target.value,
                },
              })
            }
            error={!!formErrors.cooking_time}
            helperText={formErrors.cooking_time}
          />
        </Stack>

        <TextField
          id="outlined-multiline-flexible"
          label="Servings"
          type="number"
          value={recipe.servings}
          required
          onChange={(e) => setRecipe({ ...recipe, servings: e.target.value })}
          error={!!formErrors.servings}
          helperText={formErrors.servings}
        />
        <InputLabel id="difficulty-label">Difficulty*</InputLabel>

        <Select
          id="outlined-multiline-flexible"
          label="Difficulty"
          value={recipe.difficulty}
          required
          onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
        >
          <FormHelperText>{formErrors.difficulty}</FormHelperText>
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
          <MenuItem value="expert">Expert</MenuItem>
        </Select>
      </Stack>

      <Divider
        sx={{
          marginBottom: "1rem",
          marginTop: "1rem",
        }}
      />

      <TagEditor inputTags={tags} setParentTags={updateTags} />

      <Divider
        sx={{
          marginBottom: "1rem",
          marginTop: "1rem",
        }}
      />

      <IngredientEditor
        inputIngredients={ingredients}
        updateParentIngredients={updateIngredients}
      />

      <Divider
        sx={{
          marginBottom: "1rem",
          marginTop: "1rem",
        }}
      />

      <InstructionEditor
        inputInstructions={instructions}
        updateParentInstructions={updateInstructions}
      />

      <Divider
        sx={{
          marginBottom: "1rem",
          marginTop: "1rem",
        }}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{
          alignSelf: "center",
          justiySelf: "center",
          width: "100%",
          marginTop: "1rem",
          padding: "1rem",
        }}
        onClick={formatAndSendRecipe}
      >
        Submit
      </Button>
      {newRecipeLoading && <CircularProgress />}
    </Container>
  );
}
