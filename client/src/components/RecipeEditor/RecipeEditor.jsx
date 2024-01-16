import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import { TextField } from "@mui/material";
import { CircularProgress } from "@mui/material";
import useApi from "../../hooks/useApi";
import IngredientEditor from "./IngredientEditor/IngredientEditor";
import InstructionEditor from "./InstructionEditor/InstructionEditor";
import { FormHelperText } from "@mui/material";
export default function RecipeEditor({ inputRecipe }) {
  const [recipe, setRecipe] = useState(
    inputRecipe
      ? inputRecipe
      : {
          name: "",
          description: "",
          prepTime: {
            minutes: "",
            hours: "",
          },
          cookTime: {
            minutes: "",
            hours: "",
          },
          servings: "",
          difficulty: "easy",
        }
  );
  const [ingredients, setIngredients] = useState();
  const [instructions, setInstructions] = useState();

  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    prepTime: false,
    cookTime: false,
    servings: false,
    difficulty: false,
    ingredients: false,
    instructions: false,
  });

  if (inputRecipe) {
    setRecipe(inputRecipe);
    setIngredients(inputRecipe.ingredients);
    setInstructions(inputRecipe.instructions);
  }

  function convertFormTimeToInterval(time, type) {
    const hours = time.hours;
    const minutes = time.minutes;

    if (type == "prep") {
      const preparation_time = {
        minutes: minutes,
        hours: hours,
      };
      return preparation_time;
    } else if (type == "cook") {
      const cooking_time = {
        minutes: minutes,
        hours: hours,
      };
      return cooking_time;
    }
  }

  function updateIngredients(ingredients) {
    setIngredients(ingredients);
  }

  function updateInstructions(instructions) {
    setInstructions(instructions);
  }

  async function formatAndSendRecipe() {
    try {
      let errors = {};

      if (!recipe.name) {
        errors.name = "Name is required";
      }
      if (!recipe.description) {
        errors.description = "Description is required";
      }
      if (!recipe.prepTime.hours && !recipe.prepTime.minutes) {
        errors.prepTime = "Prep time is required";
      }
      if (!recipe.cookTime.hours && !recipe.cookTime.minutes) {
        errors.cookTime = "Cook time is required";
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
      }

      const formattedRecipe = {
        name: recipe.name,
        description: recipe.description,
        prepTime: convertFormTimeToInterval(recipe.prepTime, "prep"),
        cookTime: convertFormTimeToInterval(recipe.cookTime, "cook"),
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        ingredients: ingredients,
        instructions: instructions,
      };

      console.log(formattedRecipe);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Container>
      <Stack spacing={2}>
        <TextField
          id="outlined-multiline-flexible"
          label="Recipe Name"
          multiline
          maxRows={4}
          value={recipe.name}
          required
          onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
          error={!!formErrors.name}
          helperText={formErrors.name}
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
            value={recipe.prepTime.hours}
            onChange={(e) =>
              setRecipe({
                ...recipe,
                prepTime: { ...recipe.prepTime, hours: e.target.value },
              })
            }
          />
          <TextField
            id="outlined-multiline-flexible"
            label="Minutes"
            type="number"
            value={recipe.prepTime.minutes}
            onChange={(e) =>
              setRecipe({
                ...recipe,
                prepTime: { ...recipe.prepTime, minutes: e.target.value },
              })
            }
            error={!!formErrors.prepTime}
            helperText={formErrors.prepTime}
          />
        </Stack>

        <InputLabel id="cook-time-label">Cook Time*</InputLabel>

        <Stack direction="row" spacing={2}>
          <TextField
            id="outlined-multiline-flexible"
            label="Hours"
            type="number"
            value={recipe.cookTime.hours}
            onChange={(e) =>
              setRecipe({
                ...recipe,
                cookTime: { ...recipe.cookTime, hours: e.target.value },
              })
            }
          />

          <TextField
            id="outlined-multiline-flexible"
            label="Minutes"
            type="number"
            value={recipe.cookTime.minutes}
            onChange={(e) =>
              setRecipe({
                ...recipe,
                cookTime: { ...recipe.cookTime, minutes: e.target.value },
              })
            }
            error={!!formErrors.cookTime}
            helperText={formErrors.cookTime}
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

      <Divider />

      <IngredientEditor
        inputIngredients={ingredients}
        updateParentIngredients={updateIngredients}
      />

      <Divider />

      <InstructionEditor
        inputInstructions={instructions}
        updateParentInstructions={updateInstructions}
      />

      <Divider />
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
    </Container>
  );
}
