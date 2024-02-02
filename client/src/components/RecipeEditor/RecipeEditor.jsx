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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Dropzone from "react-dropzone";
import Paper from "@mui/material/Paper";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Typography } from "@mui/material";

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

  const [originalImage, setOriginalImage] = useState(true);

  const [currentImage, setCurrentImage] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

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
    options: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
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
    options: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
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
      const newTags = tags.map((tag) => {
        return tag.tag;
      });

      const image = originalImage ? inputRecipe?.image : currentImage;

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
        tags: newTags,
        image: image,
      };

      setFormattedRecipe(formattedRecipe);

      // Todo: send recipe, support image upload, add loading indicator

      if (isFork) {
        if (inputRecipe) {
          const data = await forkRecipeRequest();
          if (data) {
            navigate(`/recipe/${data.recipe_id}`);
          }
        } else {
          console.error("Cannot fork a new recipe");
        }
      } else {
        const data = await sendRecipeRequest();
        if (data) {
          navigate(`/recipe/${data.recipe_id}`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleDropZone(acceptedFiles) {
    setCurrentImage(acceptedFiles[0]);
    setIsUploaded(true);
  }

  function handleOriginalImage(checked) {
    setOriginalImage(checked);

    if (checked) {
      setCurrentImage(null);
      setIsUploaded(false);
    }
  }

  const dropzoneView = (
    <Dropzone
      onDrop={handleDropZone}
      accept="image/*"
      multiple={false}
      maxSize={5000000}
    >
      {({ getRootProps, getInputProps }) => (
        <Paper
          variant="outlined"
          sx={(theme) => ({
            padding: 2,
            textAlign: "center",
            background: isUploaded
              ? theme.palette.success.main
              : theme.palette.action.hover,
          })}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 50 }} />
          <Typography variant="subtitle1">
            {isUploaded
              ? "File uploaded successfully!"
              : "Drag or click to upload an image"}
          </Typography>
        </Paper>
      )}
    </Dropzone>
  );

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
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={originalImage}
                onChange={(e) => handleOriginalImage(e.target.checked)}
              />
            }
            label="Use Original Image"
          />
        </FormGroup>

        {!originalImage && dropzoneView}

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
