import Stack from "@mui/material/Stack";
import { Button } from "@mui/material";
import { useState } from "react";
import useApi from "../../../hooks/useApi";
import { useEffect } from "react";
import useNavigate from "react-router-dom";

export default function ForkButton({ forkOfUserRecipe }) {
  const [confirmation, setConfirmation] = useState(false);

  const ownerForkView = (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" color="primary" onClick={null}>
        Merge with Original
      </Button>
    </Stack>
  );

  return <>{forkOfUserRecipe && ownerForkView}</>;
}
