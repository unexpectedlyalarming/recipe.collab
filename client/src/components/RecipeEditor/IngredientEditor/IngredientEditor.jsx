import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TrashIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import { TextField } from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import pluralize from "pluralize";
import _ from "lodash";

export default function IngredientEditor({
  inputIngredients,
  updateParentIngredients,
}) {
  const units = [
    "cup",
    "tablespoon",
    "teaspoon",
    "pound",
    "ounce",
    "gram",
    "kilogram",
    "liter",
    "milliliter",
    "gallon",
    "quart",
    "pint",
    "fluid ounce",
    "milliliter",
    "milligram",
    "pinch",
  ].sort();

  const [ingredients, setIngredients] = useState(
    inputIngredients ? inputIngredients : []
  );

  const [currentIngredient, setCurrentIngredient] = useState({
    name: "",
    quantity: "",
    unit: "",
  });

  function addIngredient() {
    if (currentIngredient.quantity > 1) {
      currentIngredient.unit = pluralize(currentIngredient.unit);
    }
    currentIngredient.name = _.capitalize(currentIngredient.name);
    currentIngredient.quantity = Number(currentIngredient.quantity);
    setIngredients([...ingredients, currentIngredient]);
    setCurrentIngredient({
      name: "",
      quantity: "",
      unit: "",
    });
  }

  function deleteIngredient(e) {
    const ingredientName = e.currentTarget.value;
    const newIngredients = ingredients.filter(
      (ingredient) => ingredient.name != ingredientName
    );
    setIngredients(newIngredients);
  }

  useEffect(() => {
    updateParentIngredients(ingredients);
  }, [ingredients]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Ingredients</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient, index) => (
              <TableRow key={ingredient.name + index}>
                <TableCell>{ingredient.name}</TableCell>
                <TableCell>{ingredient.quantity}</TableCell>
                <TableCell>{ingredient.unit}</TableCell>
                <TableCell>
                  <IconButton
                    value={ingredient.name}
                    onClick={deleteIngredient}
                  >
                    <TrashIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell>
                <TextField
                  id="outlined-multiline-flexible"
                  label="Name"
                  value={currentIngredient.name}
                  required
                  multiline
                  onChange={(e) =>
                    setCurrentIngredient({
                      ...currentIngredient,
                      name: e.target.value,
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  id="outlined-multiline-flexible"
                  label="Quantity"
                  value={currentIngredient.quantity}
                  required
                  type="number"
                  onChange={(e) =>
                    setCurrentIngredient({
                      ...currentIngredient,
                      quantity: e.target.value,
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <Select
                  value={currentIngredient.unit}
                  onChange={(e) =>
                    setCurrentIngredient({
                      ...currentIngredient,
                      unit: e.target.value,
                    })
                  }
                >
                  {units.map((unit, index) => (
                    <MenuItem key={unit + "-" + index} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={addIngredient}
                  disabled={
                    !currentIngredient.name ||
                    !currentIngredient.quantity ||
                    !currentIngredient.unit
                  }
                >
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
