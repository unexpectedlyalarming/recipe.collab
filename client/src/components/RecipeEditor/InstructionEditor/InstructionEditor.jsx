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
import EditIcon from "@mui/icons-material/Edit";
import _ from "lodash";
import CheckIcon from "@mui/icons-material/Check";

export default function InstructionEditor({
  inputInstructions,
  updateParentInstructions,
}) {
  const [instructions, setInstructions] = useState(
    inputInstructions ? inputInstructions : []
  );

  const [editingIndex, setEditingIndex] = useState(null);

  const [currentInstruction, setCurrentInstruction] = useState({
    step_number: "",
    description: "",
    image: "",
  });

  function addInstruction() {
    currentInstruction.description = _.capitalize(
      currentInstruction.description
    );
    currentInstruction.step_number = instructions.length + 1;
    setInstructions([...instructions, currentInstruction]);

    setCurrentInstruction({
      step_number: instructions.length + 1,
      description: "",
      image: "",
    });
  }

  function setIndex(index) {
    setEditingIndex(index);
    setCurrentInstruction(
      instructions.find((instruction) => instruction.step_number === index)
    );
  }

  function updateInstruction(index) {
    setEditingIndex(null);
    const newInstructions = instructions.map((instruction) => {
      if (instruction.step_number === index) {
        return currentInstruction;
      } else {
        return instruction;
      }
    });
    setInstructions(newInstructions);

    setCurrentInstruction({
      step_number: "",
      description: "",
      image: "",
    });
  }

  function deleteInstruction(step) {
    const newInstructions = instructions.filter(
      (instruction) => instruction.step_number != step
    );
    newInstructions.forEach((instruction, index) => {
      instruction.step_number = index + 1;
    });
    setInstructions(newInstructions);
  }

  useEffect(() => {
    updateParentInstructions(instructions);
  }, [instructions]);

  useEffect(() => {
    if (inputInstructions && !instructions.length) {
      setInstructions(inputInstructions);
    }
  }, [inputInstructions]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Instructions</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Step</TableCell>
              <TableCell
                sx={{
                  minWidth: "200px",
                }}
              >
                Description
              </TableCell>
              <TableCell
                sx={{
                  minWidth: "200px",
                }}
              >
                Image
              </TableCell>
              <TableCell></TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instructions?.map((instruction) => (
              <TableRow
                key={instruction.step_number}
                sx={{
                  backgroundColor:
                    editingIndex === instruction.step_number
                      ? "black"
                      : "transparent",
                }}
              >
                <TableCell>{instruction.step_number}</TableCell>
                <TableCell>{instruction.description}</TableCell>
                <TableCell>{instruction.image}</TableCell>
                <TableCell>
                  {editingIndex !== instruction?.step_number ? (
                    <IconButton
                      value={instruction.step_number}
                      onClick={() => setIndex(instruction.step_number)}
                    >
                      <EditIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      value={instruction.step_number}
                      onClick={() => updateInstruction(instruction.step_number)}
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => deleteInstruction(instruction?.step_number)}
                  >
                    <TrashIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell>
                {editingIndex ? editingIndex : instructions?.length + 1}
              </TableCell>
              <TableCell>
                <TextField
                  id="outlined-multiline-flexible"
                  label="Description"
                  multiline
                  maxRows={24}
                  value={currentInstruction?.description}
                  onChange={(e) =>
                    setCurrentInstruction({
                      ...currentInstruction,
                      description: e.target.value,
                    })
                  }
                  sx={{
                    minWidth: "20rem",
                  }}
                  required
                />
              </TableCell>
              <TableCell>
                <TextField
                  id="outlined-multiline-flexible"
                  label="Image"
                  multiline
                  maxRows={8}
                  value={currentInstruction?.image}
                  onChange={(e) =>
                    setCurrentInstruction({
                      ...currentInstruction,
                      image: e.target.value,
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={addInstruction}
                  disabled={!currentInstruction?.description}
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
